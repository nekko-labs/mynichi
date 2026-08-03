import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { colorContract, leading, radius, size, type ColorName } from './contract.css';
import { palette } from './tokens';

// The token contract, enforced.
//
// Three shells implement the same tokens in three formats (StyleX vars for
// RSD, plain objects for React Native chrome, CSS custom properties for the
// Lynx port). None of them can import the others' format, so drift used to be
// invisible until someone compared screenshots. These tests do the comparing:
// before the Lynx migration (T70-T75) makes parity a daily question, a shell
// that renames, drops or re-values a token fails here.

const THEME_DIR = import.meta.dir;
const NATIVE_SRC = join(THEME_DIR, '..');
const LYNX_SRC = join(THEME_DIR, '../../../lynx/src');

const contractNames = Object.keys(colorContract) as ColorName[];

function read(path: string): string {
  return readFileSync(path, 'utf8');
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** camelCase token name to the kebab-case custom property Lynx uses. */
function cssVarName(name: string): string {
  return `--mynichi-${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
}

describe('token contract: react-strict-dom shell (tokens.css.ts)', () => {
  const source = read(join(THEME_DIR, 'tokens.css.ts'));
  const colorsBlock = source.slice(
    source.indexOf('export const colors'),
    source.indexOf('export const text')
  );

  test('declares exactly the contract colors', () => {
    const declared = [...colorsBlock.matchAll(/^ {2}([A-Za-z][A-Za-z0-9]*):/gm)].map((m) => m[1]);
    expect(declared.sort()).toEqual([...contractNames].sort());
  });

  for (const name of contractNames) {
    test(`${name} matches the contract in both schemes`, () => {
      const pair = colorContract[name];
      const scheme = colorsBlock.match(
        new RegExp(
          `\\b${name}:\\s*\\{[^}]*default:\\s*'([^']+)'[^}]*prefers-color-scheme: dark\\)':\\s*'([^']+)'`,
          's'
        )
      );
      if (scheme) {
        expect(normalize(scheme[1])).toBe(normalize(pair.light));
        expect(normalize(scheme[2])).toBe(normalize(pair.dark));
        return;
      }
      // A single value means the token is scheme-independent, which is only
      // legal when the contract says both sides are the same.
      const single = colorsBlock.match(new RegExp(`\\b${name}:\\s*'([^']+)'`));
      expect(single).not.toBeNull();
      expect(normalize(pair.light)).toBe(normalize(pair.dark));
      expect(normalize(single![1])).toBe(normalize(pair.light));
    });
  }
});

describe('token contract: react native chrome (tokens.ts)', () => {
  test('palette is the light side of the contract', () => {
    expect(palette.paper).toBe(colorContract.paper.light);
    expect(palette.paperShade).toBe(colorContract.paperShade.light);
    expect(palette.ink).toBe(colorContract.ink.light);
    expect(palette.inkSoft).toBe(colorContract.inkSoft.light);
  });

  test('palette carries the dark counterparts the chrome needs', () => {
    expect(palette.paperDark).toBe(colorContract.paper.dark);
    expect(palette.paperDarkShade).toBe(colorContract.paperShade.dark);
    expect(palette.inkOnDark).toBe(colorContract.ink.dark);
    expect(palette.inkSoftOnDark).toBe(colorContract.inkSoft.dark);
  });
});

describe('token contract: lynx shell (apps/lynx/src/tokens.css)', () => {
  const source = read(join(LYNX_SRC, 'tokens.css'));
  const darkBlock = source.slice(source.indexOf('@media (prefers-color-scheme: dark)'));
  const lightBlock = source.slice(0, source.indexOf('@media (prefers-color-scheme: dark)'));

  function declaredValue(block: string, variable: string): string | null {
    const match = block.match(new RegExp(`${variable}:\\s*([^;]+);`));
    return match ? normalize(match[1]) : null;
  }

  for (const name of contractNames) {
    test(`${name} is declared with the contract value`, () => {
      const variable = cssVarName(name);
      const light = declaredValue(lightBlock, variable);
      expect(light).toBe(normalize(colorContract[name].light));
      const dark = declaredValue(darkBlock, variable) ?? light;
      expect(dark).toBe(normalize(colorContract[name].dark));
    });
  }

  test('type scale and radii are declared', () => {
    for (const [name, value] of Object.entries(size)) {
      expect(declaredValue(lightBlock, cssVarName(`size-${name}`))).toBe(`${value}px`);
    }
    for (const [name, value] of Object.entries(leading)) {
      expect(declaredValue(lightBlock, cssVarName(`leading-${name}`))).toBe(String(value));
    }
    for (const [name, value] of Object.entries(radius)) {
      expect(declaredValue(lightBlock, cssVarName(`radius-${name}`))).toBe(`${value}px`);
    }
  });

  test('the Lynx styles use tokens, never raw colours', () => {
    const app = read(join(LYNX_SRC, 'App.css'));
    expect(app).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(app).not.toMatch(/\brgba?\(/);
  });
});

describe('token contract: no screen invents a colour', () => {
  function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) return walk(path);
      return path.endsWith('.tsx') || path.endsWith('.ts') ? [path] : [];
    });
  }

  const sources = walk(NATIVE_SRC).filter((path) => !path.includes(`${join('src', 'theme')}`));

  test('hex and rgba literals live in theme/ only', () => {
    const offenders = sources.filter((path) => /#[0-9a-fA-F]{3,8}\b|\brgba?\(/.test(read(path)));
    expect(offenders.map((p) => p.replace(NATIVE_SRC, 'src'))).toEqual([]);
  });
});
