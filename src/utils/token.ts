import { nanoid } from 'nanoid';

export const generateRandomToken = () => {
  return nanoid(48);
};
