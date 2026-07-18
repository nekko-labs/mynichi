import { z } from 'zod';

// A run of text inside a token; ruby is present only over kanji runs.
export const RubyPartSchema = z.object({
  text: z.string(),
  ruby: z.string().optional()
});

export const TokenSchema = z.object({
  surface: z.string(),
  reading: z.string().optional(),
  romaji: z.string().optional(),
  parts: z.array(RubyPartSchema)
});

export const TranslateRequestSchema = z.object({
  text: z.string().min(1).max(2000),
  targetLang: z.string().default('en')
});

export const TranslateResponseSchema = z.object({
  original: z.string(),
  tokens: z.array(TokenSchema),
  romaji: z.string(),
  literal: z.string(),
  practical: z.string(),
  backend: z.enum(['local', 'cloud'])
});

export type RubyPart = z.infer<typeof RubyPartSchema>;
export type Token = z.infer<typeof TokenSchema>;
export type TranslateRequest = z.infer<typeof TranslateRequestSchema>;
export type TranslateResponse = z.infer<typeof TranslateResponseSchema>;
