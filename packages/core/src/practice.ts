import { z } from 'zod';

// AI Practice: turn-based conversation with an illustrated partner. The API
// orchestrates the cloud model; the on-device path (Apple Intelligence)
// reuses the same message shapes.

export const PracticeMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  text: z.string().min(1).max(2000)
});

export const PracticeRequestSchema = z.object({
  scenario: z.string().min(1).max(300),
  /** Words from the user's practice lists to weave into the conversation. */
  words: z.array(z.string().min(1).max(50)).max(30).default([]),
  messages: z.array(PracticeMessageSchema).max(60).default([])
});

export const PracticeReplySchema = z.object({
  /** The character's next line, in Japanese. */
  jp: z.string(),
  /** Brief English gloss of the line. */
  en: z.string(),
  /** A suggested Japanese reply the learner could try next. */
  hint: z.string().optional()
});

export type PracticeMessage = z.infer<typeof PracticeMessageSchema>;
export type PracticeRequest = z.infer<typeof PracticeRequestSchema>;
export type PracticeReply = z.infer<typeof PracticeReplySchema>;
