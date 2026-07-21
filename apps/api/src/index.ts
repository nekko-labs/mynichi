import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import {
  EnrichRequestSchema,
  PracticeRequestSchema,
  TranslateRequestSchema,
  type TranslateResponse
} from '@mynichi/core';

import { segment, warmTokenizer } from './translate/segment';
import { activeBackend, translate } from './translate/backends';
import { practiceTurn } from './practice';
import { enrich } from './enrich';

const app = new Hono();

app.use('*', logger());
app.use('*', cors());

app.get('/health', (c) =>
  c.json({ ok: true, service: 'mynichi-api', version: '0.1.0', backend: activeBackend() })
);

app.post('/translate', async (c) => {
  const parsed = TranslateRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: 'text is required (1-2000 chars)' }, 400);
  }
  const { text } = parsed.data;

  const [{ tokens, romaji }, translation] = await Promise.all([segment(text), translate(text)]);

  const response: TranslateResponse = {
    original: text,
    tokens,
    romaji,
    literal: translation.literal,
    practical: translation.practical,
    backend: activeBackend()
  };
  return c.json(response);
});

app.post('/enrich', async (c) => {
  const parsed = EnrichRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: 'text is required (1-80 chars)' }, 400);
  }
  try {
    return c.json(await enrich(parsed.data));
  } catch (err) {
    console.error('enrich failed:', err);
    return c.json({ error: 'Could not enrich this term right now.' }, 502);
  }
});

app.post('/practice', async (c) => {
  const parsed = PracticeRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: 'scenario is required (1-300 chars)' }, 400);
  }
  try {
    return c.json(await practiceTurn(parsed.data));
  } catch (err) {
    console.error('practice turn failed:', err);
    return c.json({ error: 'The practice partner is unavailable right now.' }, 502);
  }
});

const port = Number(process.env.PORT ?? 4300);
warmTokenizer();
console.log(`mynichi-api listening on :${port} (translate backend: ${activeBackend()})`);

export default {
  port,
  idleTimeout: 120,
  fetch: app.fetch
};
