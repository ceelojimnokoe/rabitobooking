/**
 * Ghana phone number validation. Accepts common local (0XXXXXXXXX) and
 * international (+233XXXXXXXXX / 233XXXXXXXXX) formats, tolerating
 * spaces, dashes, dots and parentheses in the input.
 */

export function normalizePhone(input: string): string {
  return input.trim().replace(/[\s\-().]/g, "");
}

const GHANA_PHONE_PATTERN = /^(0\d{9}|\+233\d{9}|233\d{9})$/;

export function isValidGhanaPhone(input: string): boolean {
  return GHANA_PHONE_PATTERN.test(normalizePhone(input));
}
