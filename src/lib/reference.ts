/**
 * Reference number generation for booking requests and confirmed
 * appointments. Uses the Web Crypto API (available in both the Node.js and
 * Edge runtimes) rather than Math.random() for better randomness quality.
 */

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity

function randomAlphaNumeric(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** e.g. "REQ-2026-ABC123" */
export function generateRequestReference(now: Date = new Date()): string {
  return `REQ-${now.getUTCFullYear()}-${randomAlphaNumeric(6)}`;
}

/** e.g. "RAB-2026-ABC123" */
export function generateAppointmentReference(now: Date = new Date()): string {
  return `RAB-${now.getUTCFullYear()}-${randomAlphaNumeric(6)}`;
}
