/**
 * Builds a compact common-words JA-EN dictionary JSON from jmdict-simplified.
 *
 * - Downloads the latest `jmdict-eng-common` release asset (tgz preferred, zip fallback)
 *   from https://github.com/scriptin/jmdict-simplified/releases (cached in .cache/).
 * - Keeps entries with at least one `common: true` kanji/kana form, ranked by the
 *   lowest nfXX priority tag when present (nf01=1 ... nf48=48; common-but-no-nf = 60).
 *   In practice jmdict-simplified omits nf tags, so all common entries rank equally
 *   and are all kept as long as the output fits the size budget.
 * - Emits a minified JSON into apps/native/public/data/dict-common.json.
 *
 * Data source: JMdict (EDRDG) via jmdict-simplified. License: CC BY-SA 4.0 / EDRDG.
 */

import { mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const PKG_DIR = resolve(import.meta.dir, "..");
const REPO_ROOT = resolve(PKG_DIR, "..", "..");
const CACHE_DIR = join(PKG_DIR, ".cache");
const OUT_DIR = join(REPO_ROOT, "apps", "native", "public", "data");
const OUT_FILE = join(OUT_DIR, "dict-common.json");

const RELEASES_API =
    "https://api.github.com/repos/scriptin/jmdict-simplified/releases/latest";
const ASSET_RE = /^jmdict-eng-common-3.*\.json\.(tgz|zip)$/;

const MAX_SENSES = 2;
const MAX_POS = 3;
const TARGET_BYTES = 2.5 * 1024 * 1024;
// NOTE: jmdict-simplified does not expose nfXX priority tags (frequency is
// collapsed into the `common` boolean), so nf-based ranking is a no-op in
// practice and we keep ALL common entries when they fit the size budget.
// Fallback attempts if the build exceeds TARGET_BYTES:
const ATTEMPTS: { entries: number; glosses: number }[] = [
    { entries: Number.POSITIVE_INFINITY, glosses: 4 },
    { entries: 12000, glosses: 4 },
    { entries: 10000, glosses: 3 },
];

interface JmdictForm {
    text: string;
    common?: boolean;
    tags?: string[];
}
interface JmdictSense {
    gloss: { text: string }[];
    partOfSpeech?: string[];
}
interface JmdictWord {
    id: string;
    kanji: JmdictForm[];
    kana: JmdictForm[];
    sense: JmdictSense[];
}
interface CompactWord {
    s: number;
    k?: string;
    r: string;
    g: string[];
    p?: string[];
}

async function fetchWithRetry(url: string, tries = 3): Promise<Response> {
    let lastErr: unknown;
    for (let i = 0; i < tries; i++) {
        try {
            const res = await fetch(url, {
                headers: {
                    accept: "application/octet-stream, application/vnd.github+json",
                    "user-agent": "mynichi-dict-pipeline",
                },
            });
            if (res.ok) return res;
            lastErr = new Error(`HTTP ${res.status} for ${url}`);
        } catch (err) {
            lastErr = err;
        }
        if (i < tries - 1) await Bun.sleep(1000 * (i + 1));
    }
    throw lastErr;
}

/** Find the latest release asset, download it into .cache/ (skip if cached). */
async function obtainArchive(): Promise<string> {
    let assetName: string | undefined;
    let assetUrl: string | undefined;
    try {
        const res = await fetchWithRetry(RELEASES_API);
        const release = (await res.json()) as {
            tag_name: string;
            assets: { name: string; browser_download_url: string }[];
        };
        const candidates = release.assets.filter((a) => ASSET_RE.test(a.name));
        // Prefer .tgz (extractable without a system unzip), fall back to .zip.
        const asset =
            candidates.find((a) => a.name.endsWith(".tgz")) ?? candidates[0];
        if (!asset) {
            throw new Error(
                `No jmdict-eng-common asset found in release ${release.tag_name}`,
            );
        }
        assetName = asset.name;
        assetUrl = asset.browser_download_url;
        console.log(`Latest release: ${release.tag_name}, asset: ${assetName}`);
    } catch (err) {
        // Offline fallback: use any previously cached archive.
        const cached = existsSync(CACHE_DIR)
            ? readdirSync(CACHE_DIR).filter((f) => ASSET_RE.test(f))
            : [];
        if (cached.length > 0) {
            console.warn(
                `GitHub API unreachable (${err}); using cached ${cached[0]}`,
            );
            return join(CACHE_DIR, cached[0]);
        }
        throw new Error(`Failed to query GitHub releases and no cache exists: ${err}`);
    }

    const archivePath = join(CACHE_DIR, assetName);
    if (existsSync(archivePath) && Bun.file(archivePath).size > 0) {
        console.log(`Using cached archive: ${archivePath}`);
        return archivePath;
    }
    console.log(`Downloading ${assetUrl} ...`);
    const res = await fetchWithRetry(assetUrl!);
    const buf = new Uint8Array(await res.arrayBuffer());
    mkdirSync(CACHE_DIR, { recursive: true });
    await Bun.write(archivePath, buf);
    console.log(`Downloaded ${(buf.byteLength / 1024 / 1024).toFixed(1)} MB`);
    return archivePath;
}

/** Minimal tar reader: returns the contents of the first *.json entry. */
function extractJsonFromTar(tar: Uint8Array): Uint8Array {
    let offset = 0;
    const decoder = new TextDecoder();
    while (offset + 512 <= tar.length) {
        const header = tar.subarray(offset, offset + 512);
        // End of archive: two zero blocks.
        if (header.every((b) => b === 0)) break;
        const name = decoder
            .decode(header.subarray(0, 100))
            .replace(/\0.*$/, "");
        const size = parseInt(
            decoder.decode(header.subarray(124, 136)).replace(/\0.*$/, "").trim(),
            8,
        );
        const typeflag = header[156];
        const dataStart = offset + 512;
        if (
            name.endsWith(".json") &&
            (typeflag === 0x30 /* '0' regular file */ || typeflag === 0)
        ) {
            return tar.subarray(dataStart, dataStart + size);
        }
        offset = dataStart + Math.ceil(size / 512) * 512;
    }
    throw new Error("No .json entry found in tar archive");
}

async function extractJson(archivePath: string): Promise<string> {
    if (archivePath.endsWith(".tgz")) {
        const gz = new Uint8Array(await Bun.file(archivePath).arrayBuffer());
        const tar = Bun.gunzipSync(gz);
        return new TextDecoder().decode(extractJsonFromTar(tar));
    }
    // .zip fallback: use system tar (bsdtar on Windows/macOS handles zip).
    const extractDir = join(CACHE_DIR, "extracted");
    mkdirSync(extractDir, { recursive: true });
    const proc = Bun.spawnSync(["tar", "-xf", archivePath, "-C", extractDir]);
    if (proc.exitCode !== 0) {
        throw new Error(
            `tar failed to extract zip: ${proc.stderr.toString()}`,
        );
    }
    const jsonFile = readdirSync(extractDir).find((f) => f.endsWith(".json"));
    if (!jsonFile) throw new Error("No .json file found after zip extraction");
    return await Bun.file(join(extractDir, jsonFile)).text();
}

/** Lowest nfXX number across all kanji/kana tags, or 60 if none. */
function rankOf(word: JmdictWord): number {
    let best = 60;
    for (const form of [...(word.kanji ?? []), ...(word.kana ?? [])]) {
        for (const tag of form.tags ?? []) {
            const m = /^nf(\d{2})$/.exec(tag);
            if (m) best = Math.min(best, parseInt(m[1], 10));
        }
    }
    return best;
}

function toCompact(
    word: JmdictWord,
    maxGlosses: number,
): CompactWord | null {
    const kanjiForm =
        (word.kanji ?? []).find((k) => k.common) ?? (word.kanji ?? [])[0];
    const kanaForm =
        (word.kana ?? []).find((k) => k.common) ?? (word.kana ?? [])[0];
    if (!kanaForm) return null;

    const glosses: string[] = [];
    for (const sense of (word.sense ?? []).slice(0, MAX_SENSES)) {
        for (const gl of sense.gloss ?? []) {
            if (glosses.length >= maxGlosses) break;
            if (gl.text) glosses.push(gl.text);
        }
        if (glosses.length >= maxGlosses) break;
    }
    if (glosses.length === 0) return null;

    const record: CompactWord = {
        s: Number(word.id),
        r: kanaForm.text,
        g: glosses,
    };
    if (kanjiForm) record.k = kanjiForm.text;
    const pos = (word.sense?.[0]?.partOfSpeech ?? []).slice(0, MAX_POS);
    if (pos.length > 0) record.p = pos;
    // Reorder keys for readability: s, k?, r, g, p?
    return {
        s: record.s,
        ...(record.k !== undefined ? { k: record.k } : {}),
        r: record.r,
        g: record.g,
        ...(record.p !== undefined ? { p: record.p } : {}),
    };
}

function buildOutput(
    ranked: JmdictWord[],
    maxEntries: number,
    maxGlosses: number,
): string {
    const words: CompactWord[] = [];
    for (const word of ranked) {
        if (words.length >= maxEntries) break;
        const compact = toCompact(word, maxGlosses);
        if (compact) words.push(compact);
    }
    return JSON.stringify({
        source: "jmdict-simplified (JMdict, EDRDG)",
        license: "CC BY-SA 4.0 / EDRDG",
        built: new Date().toISOString().slice(0, 10),
        words,
    });
}

async function main() {
    mkdirSync(CACHE_DIR, { recursive: true });
    const archivePath = await obtainArchive();
    console.log("Extracting and parsing JSON ...");
    const jsonText = await extractJson(archivePath);
    const data = JSON.parse(jsonText) as { words: JmdictWord[] };
    console.log(`Parsed ${data.words.length} total entries`);

    const common = data.words.filter(
        (w) =>
            (w.kanji ?? []).some((k) => k.common) ||
            (w.kana ?? []).some((k) => k.common),
    );
    console.log(`${common.length} entries with a common form`);

    // Stable sort by rank ascending (ties keep original JMdict order).
    const ranked = common
        .map((w, i) => ({ w, rank: rankOf(w), i }))
        .sort((a, b) => a.rank - b.rank || a.i - b.i)
        .map((x) => x.w);

    let out = "";
    let byteSize = 0;
    for (const attempt of ATTEMPTS) {
        out = buildOutput(ranked, attempt.entries, attempt.glosses);
        byteSize = Buffer.byteLength(out, "utf8");
        if (byteSize <= TARGET_BYTES) break;
        console.warn(
            `Output ${(byteSize / 1024 / 1024).toFixed(2)} MB exceeds target ` +
                `at ${attempt.entries} entries / ${attempt.glosses} glosses; reducing`,
        );
    }

    mkdirSync(OUT_DIR, { recursive: true });
    await Bun.write(OUT_FILE, out);
    const entryCount = (JSON.parse(out) as { words: unknown[] }).words.length;
    console.log(`Wrote ${OUT_FILE}`);
    console.log(
        `Entries: ${entryCount}, size: ${(byteSize / 1024 / 1024).toFixed(2)} MB (${byteSize} bytes)`,
    );
}

await main();
