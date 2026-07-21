import Anthropic from '@anthropic-ai/sdk';
import { fitFurigana, hasKanji, type EnrichRequest, type EnrichResponse } from '@mynichi/core';

import { segment } from './translate/segment';

// Quick-add enrichment for the Lists capture flow. Reading + furigana are
// derived deterministically with kuromoji (no model, always available); the
// English meaning and a short example sentence come from Claude for the words
// the app's bundled common-dictionary misses (e.g. 納期). If no model key is
// configured we still return the reading, which alone removes most of the
// manual typing.

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8';

const SYSTEM = `You enrich a single Japanese term (word, phrase, kanji, or grammar point) for a foreign resident of Japan who is learning the language. Respond with JSON only:
{
  "meaning": "a concise English meaning: a few words to one short line; separate distinct senses with '; '",
  "example": { "jp": "one short, natural Japanese sentence that uses the term the way a resident would meet it", "en": "a plain English translation of that sentence" }
}
Keep the meaning practical and everyday, not a dictionary dump. The example must actually contain the term.`;

const OUTPUT_SCHEMA = {
  type: 'object' as const,
  properties: {
    meaning: { type: 'string' as const },
    example: {
      type: 'object' as const,
      properties: { jp: { type: 'string' as const }, en: { type: 'string' as const } },
      required: ['jp', 'en'],
      additionalProperties: false
    }
  },
  required: ['meaning', 'example'],
  additionalProperties: false
};

function guessKind(text: string): EnrichResponse['kind'] {
  const t = text.trim();
  if ([...t].length === 1 && hasKanji(t)) return 'kanji';
  if ([...t].length > 6 || /[はがをにでへとや、。]/.test(t)) return 'phrase';
  return 'word';
}

let anthropic: Anthropic | null = null;

export async function enrich(req: EnrichRequest): Promise<EnrichResponse> {
  const text = req.text.trim();

  // Reading + furigana from kuromoji: deterministic, no model needed.
  const { tokens } = await segment(text);
  const reading = tokens.map((t) => t.reading ?? '').join('');
  const furigana = reading ? fitFurigana(text, reading) : [{ text }];

  let meaning = '';
  let example: EnrichResponse['example'];
  let source: EnrichResponse['source'] = 'reading-only';

  try {
    anthropic ??= new Anthropic();
    const response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 512,
      system: SYSTEM,
      output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
      messages: [{ role: 'user', content: text }]
    });
    const block = response.content.find((b) => b.type === 'text');
    if (block?.type === 'text') {
      const obj = JSON.parse(block.text) as { meaning?: string; example?: EnrichResponse['example'] };
      if (typeof obj.meaning === 'string') meaning = obj.meaning;
      if (obj.example?.jp && obj.example?.en) example = obj.example;
      source = 'model';
    }
  } catch (err) {
    // No key or model error: the reading alone is still a big win; the client
    // falls back to its offline dictionary (or manual entry) for the meaning.
    console.error('enrich model step failed:', err);
  }

  return { text, reading, furigana, meaning, example, kind: guessKind(text), source };
}
