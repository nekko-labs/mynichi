// Validation rules, in one place, in the app's own voice: plain language, no
// scolding, and the same rule wherever a field appears (a list name typed in
// Lists must behave exactly like one typed in the dictionary's list picker).

export const LIMITS = {
  listName: 40,
  capture: 120,
  reading: 60,
  meaning: 160,
  example: 200,
  scenario: 120,
  reply: 400
} as const;

export type Validation = string | null;

/** Empty is "not ready yet", not an error: fields stay quiet until submit. */
export function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

export function tooLong(value: string, max: number): boolean {
  return [...value.trim()].length > max;
}

/**
 * A field the user has to fill in. `subject` is a noun phrase, so the message
 * reads as a sentence: "Add a list name first."
 */
export function required(value: string, subject: string, max: number): Validation {
  if (isBlank(value)) return `Add ${subject} first.`;
  if (tooLong(value, max)) return `Keep ${subject} under ${max} characters.`;
  return null;
}

/** An optional field: only length is checked. */
export function optional(value: string, subject: string, max: number): Validation {
  return tooLong(value, max) ? `Keep ${subject} under ${max} characters.` : null;
}

export function validateListName(value: string): Validation {
  return required(value, 'a list name', LIMITS.listName);
}

export function validateCapture(value: string): Validation {
  return required(value, 'a word to capture', LIMITS.capture);
}

export function validateScenario(value: string): Validation {
  return required(value, 'a scenario', LIMITS.scenario);
}
