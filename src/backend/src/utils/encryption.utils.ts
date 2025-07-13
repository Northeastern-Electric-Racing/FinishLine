import CryptoJS from 'crypto-js';

const { ENCRYPTION_KEY } = process.env;

/**
 * Encrypts the given password to be stored in the db
 * @param password password to be encrypted
 * @returns encrypted password
 */
export const encryptPassword = (password: string) => {
  return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY!).toString();
};

/**
 * Decryptes the given encrypted password to get its original text
 * @param encryptedPassword password to be decrypted
 * @returns orginal password
 */
export const decryptPassword = (encryptedPassword: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY!);
  return bytes.toString(CryptoJS.enc.Utf8);
};
