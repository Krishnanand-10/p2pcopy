/**
 * Generates an ephemeral 6-digit room pairing code formatted as XXX-XXX.
 * e.g., "482-910"
 */
export function generatePairingCode(): string {
  const num1 = Math.floor(100 + Math.random() * 900);
  const num2 = Math.floor(100 + Math.random() * 900);
  return `${num1}-${num2}`;
}

/**
 * Normalizes input code (handles with or without dash, case-insensitive).
 */
export function normalizeCode(input: string): string {
  const clean = input.trim().replace(/[\s-]/g, "");
  if (clean.length === 6) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  return input.trim();
}
