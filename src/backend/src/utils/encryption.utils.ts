const CryptoJS = require('crypto-js');

// if (!process.env.ENCRYPTION_KEY) {
//   throw new Error('ENCRYPTION_KEY is missing');
// }

const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY || 'key'; // should "|| 'key" be removed?

/**
 * Encrypts the given password to be stored in the db
 * @param password password to be encrypted
 * @returns encrypted password
 */
export const encryptPassword = (password: string) => {
  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
};

/**
 * Decryptes the given encrypted password to get its original text
 * @param encryptedPassword password to be decrypted
 * @returns orginal password
 */
export const decryptPassword = (encryptedPassword: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
