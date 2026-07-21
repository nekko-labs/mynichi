import Anthropic from '@anthropic-ai/sdk';

// Free tier: our self-trained, license-clean SLM (LoRA on Qwen3-4B-Instruct-2507,
// Apache-2.0 end to end) served locally by LM Studio over its OpenAI-compatible
// API. One model maps Japanese text -> {literal, practical} JSON directly,
// replacing the earlier two-stage PLaMo+Shisa pipeline (PLaMo's community license
// needed a PFN commercial agreement; the tuned SLM matches its correctness on the
// tricky cases while staying Apache-clean). Premium: Claude.
//
// Serving notes (see packages/slm/README.md + TASKS.md "Key Technical Decisions"):
//  - Build the GGUF and load it into LM Studio via packages/slm/export_gguf.py.
//  - The endpoint is OpenAI-compatible, so pointing SLM_BASE_URL at a vLLM server
//    instead of LM Studio works unchanged.
//  - Decoding MUST be greedy (top_k 1, no repeat penalty) to reproduce the model's
//    trained behavior. LM Studio/vLLM honor top_k + repeat_penalty as OpenAI
//    extensions; without them the sampler reverts hard cases (e.g. 「巻きで」).

export type Translation = { literal: string; practical: string };

const SLM_BASE_URL = process.env.SLM_BASE_URL ?? 'http://localhost:1338/v1';
const SLM_MODEL = process.env.SLM_MODEL ?? 'mynichi-translate';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8';

// Prompt contract: MUST stay byte-identical to packages/slm/common.py
// STUDENT_SYSTEM (the string the model was trained and evaluated against).
const STUDENT_SYSTEM =
  'You translate Japanese for a foreign resident of Japan. Respond with JSON only: ' +
  '{"literal": "literal English translation mirroring the Japanese structure", ' +
  '"practical": "what it actually means for the reader, including what to do if it implies an action"}';

// Claude gets a fuller brief; the tuned SLM already carries this behavior in-weights.
const CLOUD_SYSTEM = `You are the translation engine inside a Japanese learning app for foreign residents of Japan.
Respond with JSON only:
{
  "literal": "a literal English translation that mirrors the Japanese structure and word choice",
  "practical": "what the text actually means for the reader in plain everyday English, including what they should do if it implies an action"
}`;

function parseTranslation(raw: string): Translation {
  // Tolerate stray prose / code fences around the JSON object.
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error(`no JSON object in model output: ${raw.slice(0, 120)}`);
  const obj = JSON.parse(raw.slice(start, end + 1)) as Partial<Translation>;
  if (typeof obj.literal !== 'string' || typeof obj.practical !== 'string') {
    throw new Error('model output missing literal/practical');
  }
  return { literal: obj.literal, practical: obj.practical };
}

export async function translateLocal(text: string): Promise<Translation> {
  const res = await fetch(`${SLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model: SLM_MODEL,
      stream: false,
      max_tokens: 512,
      // Greedy decoding — reproduces training/eval behavior. top_k + repeat_penalty
      // are OpenAI-API extensions honored by LM Studio and vLLM.
      temperature: 0,
      top_p: 1,
      top_k: 1,
      repeat_penalty: 1.0,
      messages: [
        { role: 'system', content: STUDENT_SYSTEM },
        { role: 'user', content: text }
      ]
    })
  });
  if (!res.ok) throw new Error(`SLM chat failed: ${res.status} ${await res.text().catch(() => '')}`);
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new Error('unexpected SLM response shape');
  return parseTranslation(content);
}

let anthropic: Anthropic | null = null;

export async function translateCloud(text: string): Promise<Translation> {
  anthropic ??= new Anthropic();
  const response = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 2048,
    system: CLOUD_SYSTEM,
    output_config: {
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: { literal: { type: 'string' }, practical: { type: 'string' } },
          required: ['literal', 'practical'],
          additionalProperties: false
        }
      }
    },
    messages: [{ role: 'user', content: text }]
  });
  const block = response.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') throw new Error('unexpected Claude response shape');
  return parseTranslation(block.text);
}

export function translate(text: string): Promise<Translation> {
  const backend = process.env.TRANSLATE_BACKEND ?? 'local';
  return backend === 'anthropic' ? translateCloud(text) : translateLocal(text);
}

export function activeBackend(): 'local' | 'cloud' {
  return (process.env.TRANSLATE_BACKEND ?? 'local') === 'anthropic' ? 'cloud' : 'local';
}
