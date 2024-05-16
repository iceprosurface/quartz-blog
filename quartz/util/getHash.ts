import crypto from 'crypto';

export const generateHash = (content: string) => {
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  return hash.substring(0, 7);
};