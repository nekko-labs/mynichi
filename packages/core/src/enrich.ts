import { z } from 'zod';
import { RubyPartSchema } from './translate';

// Quick-add enrichment: given a single Japanese word / phrase / grammar point,
// fill in its reading (kana + furigana), an English meaning, and one natural
// example sentence, so capture is "type the Japanese, keep moving" instead of
// hand-entering the reading and meaning. Reading/furigana come from kuromoji
// (deterministic, no model). Meaning + example come from Claude for words the
// bundled offline dictionary misses (the client checks its dictionary first
// and only asks the API for the gaps).

export const EnrichRequestSchema = z.object({
  text: z.string().min(1).max(80),
  targetLang: z.string().default('en')
});

export const EnrichExampleSchema = z.object({
  jp: z.string(),
  en: z.string()
});

export const EnrichResponseSchema = z.object({
  text: z.string(),
  /** Kana reading (hiragana), empty only when segmentation yields nothing. */
  reading: z.string(),
  /** Ruby parts so the caller can render furigana over the kanji runs. */
  furigana: z.array(RubyPartSchema),
  meaning: z.string(),
  example: EnrichExampleSchema.optional(),
  kind: z.enum(['word', 'kanji', 'phrase', 'grammar']),
  /** Where the meaning came from: 'model' (Claude) or 'reading-only' (no key). */
  source: z.enum(['model', 'reading-only'])
});

export type EnrichRequest = z.infer<typeof EnrichRequestSchema>;
export type EnrichExample = z.infer<typeof EnrichExampleSchema>;
export type EnrichResponse = z.infer<typeof EnrichResponseSchema>;
