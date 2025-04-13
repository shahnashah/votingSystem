// utils/helpers.js

import crypto from 'crypto';

/**
 * Generates a unique link identifier for elections
 * @returns {string} A unique string that can be used as part of a URL
 */
export const generateUniqueLink = () => {
  // Generate a random buffer of bytes
  const randomBytes = crypto.randomBytes(16);
  
  // Convert to a URL-friendly base64 string and remove any special characters
  return randomBytes.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};