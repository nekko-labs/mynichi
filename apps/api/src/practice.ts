import Anthropic from '@anthropic-ai/sdk';
import type { PracticeReply, PracticeRequest } from '@mynichi/core';

// Cloud conversation partner (premium path). Privacy posture documented
// in-app: no training on user data, voice never reaches the server (STT/TTS
// stay on device), transcripts are not persisted server-side.

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8';

const SYSTEM = `You are the conversation partner inside mynichi, a Japanese learning app for foreign residents of Japan. You role-play everyday scenarios so learners can practice without embarrassment.

Rules:
- Stay in character for the scenario. Speak natural, everyday Japanese matched to the learner's apparent level (default to simple polite form; simplify if they struggle, stretch them gently if they are comfortable).
- Keep each turn short: one or two sentences, like real speech. Ask questions to keep the conversation moving.
- If the learner makes an error that would cause real-world confusion, keep the conversation flowing in "jp" and note the correction briefly in "en".
- If target words are provided, weave them into the conversation naturally over multiple turns. Never dump them all at once.
- Be warm and patient. Never mock, never lecture.

Respond with JSON only:
{
  "jp": "your next line, in Japanese",
  "en": "brief English gloss of your line (and a gentle correction note if needed)",
  "hint": "a short Japanese reply the learner could try next (optional, include while the learner seems unsure)"
}`;

let anthropic: Anthropic | null = null;

export async function practiceTurn(req: PracticeRequest): Promise<PracticeReply> {
  anthropic ??= new Anthropic();

  const setup = [
    `Scenario: ${req.scenario}`,
    req.words.length > 0 ? `Target words to weave in: ${req.words.join('、')}` : null,
    req.messages.length === 0 ? 'Open the conversation in character.' : null
  ]
    .filter(Boolean)
    .join('\n');

  const history = req.messages.map((m) => ({
    role: m.role,
    content: m.text
  }));

  const response = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 1024,
    system: SYSTEM,
    output_config: {
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            jp: { type: 'string' },
            en: { type: 'string' },
            hint: { type: 'string' }
          },
          required: ['jp', 'en'],
          additionalProperties: false
        }
      }
    },
    messages: [{ role: 'user', content: setup }, ...history]
  });

  const block = response.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') throw new Error('unexpected Claude response shape');
  return JSON.parse(block.text) as PracticeReply;
}
