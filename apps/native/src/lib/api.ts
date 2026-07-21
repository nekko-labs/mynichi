import type { EnrichResponse, TranslateResponse } from '@mynichi/core';

// One place for the API origin.
//   dev  -> the local Bun+Hono API on :4300
//   prod -> the hosted API (Fly). Override at build time with EXPO_PUBLIC_API_URL
//           (e.g. the raw fly.dev URL before the api.mynichi.app domain is live).
const PROD_API_URL = 'https://api.mynichi.app';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? (__DEV__ ? 'http://localhost:4300' : PROD_API_URL);

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  if (!API_URL) throw new Error('api-not-configured');
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return (await res.json()) as T;
}

/** Translate pasted/typed Japanese (Translate screen). */
export function translateText(text: string): Promise<TranslateResponse> {
  return postJson<TranslateResponse>('/translate', { text });
}

/** Enrich a captured term for quick-add (reading + meaning + example). */
export function enrichTerm(text: string): Promise<EnrichResponse> {
  return postJson<EnrichResponse>('/enrich', { text });
}
