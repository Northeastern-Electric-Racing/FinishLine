"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
var crypto_1 = require("crypto");
var ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
var encryptionKey = ENCRYPTION_KEY !== null && ENCRYPTION_KEY !== void 0 ? ENCRYPTION_KEY : (0, crypto_1.randomBytes)(32).toString('hex');
var algorithm = 'aes-256-gcm';
/**
 * Ensures the encryption key is exactly 32 bytes
 * @param key the key being normalized
 * @returns the key padded with 0s or truncated to be 32 bytes
 */
function normalizeKey(key) {
    var keyBuffer = Buffer.from(key, 'hex');
    if (keyBuffer.length === 32) {
        return keyBuffer;
    }
    else if (keyBuffer.length < 32) {
        console.log('WARNING: Encryption key not long enough');
        var paddedKey = Buffer.alloc(32, 0);
        for (var i = 0; i < keyBuffer.length; i++) {
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
function encrypt(plaintext) {
    // Random iv so duplicate text has different encryptions
    var iv = new Uint8Array((0, crypto_1.randomBytes)(16));
    var keyBuffer = new Uint8Array(normalizeKey(encryptionKey));
    // The cipher used to encrypt the text
    var cipher = (0, crypto_1.createCipheriv)(algorithm, keyBuffer, iv);
    var updateBuffer = new Uint8Array(cipher.update(plaintext, 'utf8'));
    var finalBuffer = new Uint8Array(cipher.final());
    var authTag = new Uint8Array(cipher.getAuthTag());
    // Concat iv, tag, encrypted data, and final together so only key is needed to decrypt
    var totalLength = iv.length + authTag.length + updateBuffer.length + finalBuffer.length;
    var combined = new Uint8Array(totalLength);
    var offset = 0;
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
function decrypt(encryptedBase64) {
    var combined = new Uint8Array(Buffer.from(encryptedBase64, 'base64'));
    // Parse out pieces from encryption
    var iv = combined.slice(0, 16);
    var authTag = combined.slice(16, 32);
    var encrypted = combined.slice(32);
    var keyBuffer = new Uint8Array(normalizeKey(encryptionKey));
    // The decipher to decrypt text
    var decipher = (0, crypto_1.createDecipheriv)(algorithm, keyBuffer, iv);
    decipher.setAuthTag(authTag);
    //get the text
    var updateResult = new Uint8Array(decipher.update(encrypted));
    var finalResult = new Uint8Array(decipher.final());
    var decryptedLength = updateResult.length + finalResult.length;
    var decrypted = new Uint8Array(decryptedLength);
    decrypted.set(updateResult, 0);
    decrypted.set(finalResult, updateResult.length);
    return Buffer.from(decrypted).toString('utf8');
}
