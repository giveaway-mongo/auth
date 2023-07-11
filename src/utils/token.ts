import crypto from 'crypto';

export const generateRandomToken = () => {
  const buffer = crypto.randomBytes(48);
  return buffer.toString('hex');
};



