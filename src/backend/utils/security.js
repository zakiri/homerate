// Security utilities and encryption helpers
import crypto from 'crypto';

export const SecurityUtils = {
  generateRandomToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  },

  hashPassword(password) {
    return crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
  },

  validatePassword(inputPassword, hashedPassword) {
    return this.hashPassword(inputPassword) === hashedPassword;
  },

  encryptData(data, key) {
    const cipher = crypto.createCipher('aes192', key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  },

  decryptData(encrypted, key) {
    const decipher = crypto.createDecipher('aes192', key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
};
