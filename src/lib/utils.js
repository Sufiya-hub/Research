import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { randomUUID } from 'crypto';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const generateCopiedS3Key = (userId, originalKey) => {
  const ext = originalKey.split('.').pop();
  return `users/${userId}/files/${randomUUID()}.${ext}`;
};
