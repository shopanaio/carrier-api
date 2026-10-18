// code and comments in English
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** UTF-8 aware base64 that works the same in Node, browsers and edge runtimes. */
export function base64Encode(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let output = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    output += ALPHABET[a >> 2];
    output += ALPHABET[((a & 3) << 4) | ((b ?? 0) >> 4)];
    output += b === undefined ? '=' : ALPHABET[((b & 15) << 2) | ((c ?? 0) >> 6)];
    output += c === undefined ? '=' : ALPHABET[c & 63];
  }
  return output;
}
