import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const { ENCRYPTION_KEY } = process.env;

const encryptionKey = ENCRYPTION_KEY ?? randomBytes(32).toString('hex');
const algorithm = 'aes-256-gcm';

/**
 * Ensures the encryption key is exactly 32 bytes
 * @param key the key being normalized
 * @returns the key padded with 0s or truncated to be 32 bytes
 */
function normalizeKey(key: string): Buffer {
  const keyBuffer = Buffer.from(key, 'hex');

  if (keyBuffer.length === 32) {
    return keyBuffer;
  } else if (keyBuffer.length < 32) {
    console.log('WARNING: Encryption key not long enough');
    const paddedKey = Buffer.alloc(32, 0);
    for (let i = 0; i < keyBuffer.length; i++) {
      paddedKey[i] = keyBuffer[i];
    }
    return paddedKey;
  }
  return keyBuffer.slice(0, 32);
}

/**
 * Encrypts the given text to be stored in the db
 * @param plaintext text to be encrypted
 * @returns encrypted text
 */
export function encrypt(plaintext: string): string {
  // Random iv so duplicate text has different encryptions
  const iv = new Uint8Array(randomBytes(16));
  const keyBuffer = new Uint8Array(normalizeKey(encryptionKey));

  // The cipher used to encrypt the text
  const cipher = createCipheriv(algorithm, keyBuffer, iv);
  const updateBuffer = new Uint8Array(cipher.update(plaintext, 'utf8'));
  const finalBuffer = new Uint8Array(cipher.final());
  const authTag = new Uint8Array(cipher.getAuthTag());

  // Concat iv, tag, encrypted data, and final together so only key is needed to decrypt
  const totalLength = iv.length + authTag.length + updateBuffer.length + finalBuffer.length;
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  combined.set(iv, offset);
  offset += iv.length;
  combined.set(authTag, offset);
  offset += authTag.length;
  combined.set(updateBuffer, offset);
  offset += updateBuffer.length;
  combined.set(finalBuffer, offset);

  return Buffer.from(combined).toString('base64');
}

/**
 * Decryptes the given encrypted text to get its original text
 * @param encryptedBase64 text to be decrypted
 * @returns orginal text
 */
export function decrypt(encryptedBase64: string): string {
  const combined = new Uint8Array(Buffer.from(encryptedBase64, 'base64'));

  // Parse out pieces from encryption
  const iv = combined.slice(0, 16);
  const authTag = combined.slice(16, 32);
  const encrypted = combined.slice(32);
  const keyBuffer = new Uint8Array(normalizeKey(encryptionKey));

  // The decipher to decrypt text
  const decipher = createDecipheriv(algorithm, keyBuffer, iv);
  decipher.setAuthTag(authTag);

  //get the text
  const updateResult = new Uint8Array(decipher.update(encrypted));
  const finalResult = new Uint8Array(decipher.final());
  const decryptedLength = updateResult.length + finalResult.length;
  const decrypted = new Uint8Array(decryptedLength);
  decrypted.set(updateResult, 0);
  decrypted.set(finalResult, updateResult.length);

  return Buffer.from(decrypted).toString('utf8');
}
