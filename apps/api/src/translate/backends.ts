import Anthropic from '@anthropic-ai/sdk';

// Free tier: self-hosted SLM pipeline (PLaMo-2-translate for the translation,
// Shisa for the literal/practical JSON layer grounded on it). Premium: Claude.
// See TASKS.md "Key Technical Decisions" (2026-07-18 bake-off).

export type Translation = { literal: string; practical: string };

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const MODEL_TRANSLATE = process.env.TRANSLATE_MODEL_TRANSLATE ?? 'mitmul/plamo-2-translate:Q4_K_M';
const MODEL_PRACTICAL =
  process.env.TRANSLATE_MODEL_PRACTICAL ?? 'hf.co/mradermacher/shisa-v2.1-qwen3-8b-GGUF:Q5_K_M';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8';
const LMSTUDIO_URL = process.env.LMSTUDIO_URL ?? 'http://127.0.0.1:1338/v1';
const MODEL_STUDENT = process.env.TRANSLATE_MODEL_STUDENT ?? 'mynichi-slm';

// Prompt contract of the self-trained student SLM. Must stay byte-identical
// with packages/slm/common.py STUDENT_SYSTEM (training + eval use the same).
const STUDENT_SYSTEM =
  'You translate Japanese for a foreign resident of Japan. Respond with JSON only: ' +
  '{"literal": "literal English translation mirroring the Japanese structure", ' +
  '"practical": "what it actually means for the reader, including what to do if it implies an action"}';

const PRACTICAL_SYSTEM = `You are the translation engine inside a Japanese learning app for foreign residents of Japan.
You are given a Japanese text and a reference translation produced by a specialist translation model. The reference is authoritative for meaning and nuance: never contradict it.
Respond with JSON only:
{
  "literal": "a literal English translation that mirrors the Japanese structure and word choice, consistent with the reference's reading of any idioms",
  "practical": "what the text actually means for the reader in plain everyday English, including what they should do if it implies an action"
}`;

async function ollamaChatJson(model: string, system: string, user: string): Promise<Translation> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model,
      stream: false,
      think: false,
      keep_alive: '30m',
      options: { temperature: 0.2 },
      format: {
        type: 'object',
        properties: { literal: { type: 'string' }, practical: { type: 'string' } },
        required: ['literal', 'practical']
      },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })
  });
  if (!res.ok) throw new Error(`ollama chat failed: ${res.status}`);
  const data = (await res.json()) as { message: { content: string } };
  return JSON.parse(data.message.content) as Translation;
}

async function plamoTranslate(text: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model: MODEL_TRANSLATE,
      stream: false,
      prompt: text,
      keep_alive: '30m',
      options: { temperature: 0, stop: ['<|plamo:op|>'] }
    })
  });
  if (!res.ok) throw new Error(`ollama generate failed: ${res.status}`);
  const data = (await res.json()) as { response: string };
  return data.response.trim();
}

export async function translateLocal(text: string): Promise<Translation> {
  const reference = await plamoTranslate(text);
  return ollamaChatJson(
    MODEL_PRACTICAL,
    PRACTICAL_SYSTEM,
    `Japanese text:\n${text}\n\nReference translation:\n${reference}`
  );
}

/** Self-trained student SLM served by LM Studio (OpenAI-compatible). One call
 * replaces the two-stage PLaMo+Shisa pipeline. */
export async function translateStudent(text: string): Promise<Translation> {
  const res = await fetch(`${LMSTUDIO_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal: AbortSignal.timeout(120_000),
    body: JSON.stringify({
      model: MODEL_STUDENT,
      stream: false,
      temperature: 0,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: STUDENT_SYSTEM },
        { role: 'user', content: text }
      ]
    })
  });
  if (!res.ok) throw new Error(`lmstudio chat failed: ${res.status}`);
  const data = (await res.json()) as {
    choices: Array<{ message: { content?: string; reasoning_content?: string } }>;
  };
  const msg = data.choices[0]?.message ?? {};
  const raw = (msg.content ?? '').trim() || (msg.reasoning_content ?? '').trim();
  // Lenient extraction: no grammar constraint server-side (it stalls gemma-family
  // models in LM Studio), so tolerate stray text around the JSON.
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('student returned no JSON');
  const parsed = JSON.parse(raw.slice(start, end + 1)) as Partial<Translation>;
  if (typeof parsed.literal !== 'string' || typeof parsed.practical !== 'string') {
    throw new Error('student JSON missing literal/practical');
  }
  return { literal: parsed.literal, practical: parsed.practical };
}

let anthropic: Anthropic | null = null;

export async function translateCloud(text: string): Promise<Translation> {
  anthropic ??= new Anthropic();
  const response = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 2048,
    system: PRACTICAL_SYSTEM.replace(
      /You are given a Japanese text and a reference translation[\s\S]*?never contradict it\./,
      'You are given a Japanese text.'
    ),
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
  return JSON.parse(block.text) as Translation;
}

export function translate(text: string): Promise<Translation> {
  const backend = process.env.TRANSLATE_BACKEND ?? 'ollama';
  if (backend === 'anthropic') return translateCloud(text);
  if (backend === 'lmstudio') return translateStudent(text);
  return translateLocal(text);
}

export function activeBackend(): 'local' | 'cloud' {
  return (process.env.TRANSLATE_BACKEND ?? 'ollama') === 'anthropic' ? 'cloud' : 'local';
}
