import { Hono } from 'hono';
import { logger } from 'hono/logger';

const app = new Hono();

app.use('*', logger());

app.get('/health', (c) =>
  c.json({ ok: true, service: 'mynichi-api', version: '0.1.0' })
);

// Routes land here as features do: /translate (T10), /enrich (T21), /practice (T41).

const port = Number(process.env.PORT ?? 4300);

export default {
  port,
  fetch: app.fetch
};
