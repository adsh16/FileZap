// cryptoUtils.js
// Uses Web Crypto API to encrypt/decrypt files in the browser

/**
 * Encrypts a File or Blob using AES-GCM (256-bit)
 * @param {File|Blob} file - The file to encrypt
 * @returns {Promise<{ encryptedBlob: Blob, key: Uint8Array, iv: Uint8Array }>}
 */

export async function encryptFile(file) {
  const key = crypto.getRandomValues(new Uint8Array(32)); // 256-bit key
  const iv = crypto.getRandomValues(new Uint8Array(12));  // 96-bit IV (recommended for GCM)

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const fileBuffer = await file.arrayBuffer();

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    fileBuffer
  );

  return {
    encryptedBlob: new Blob([encryptedBuffer]),
    key,
    iv
  };
}

/**
 * Decrypts an encrypted ArrayBuffer using AES-GCM
 * @param {ArrayBuffer} encryptedBuffer - The encrypted file buffer
 * @param {Uint8Array} key - The AES key
 * @param {Uint8Array} iv - The AES-GCM IV
 * @returns {Promise<Blob>} - The decrypted file as a Blob
 */
export async function decryptFile(encryptedBuffer, key, iv) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encryptedBuffer
  );

  return new Blob([decryptedBuffer]);
}

/**
 * Encodes key + IV into a base64 string for use in URLs
 * @param {Uint8Array} key
 * @param {Uint8Array} iv
 * @returns {string}
 */
export function encodeKeyData(key, iv) {
  const json = JSON.stringify({
    key: Array.from(key),
    iv: Array.from(iv)
  });
  return btoa(json);
}

/**
 * Decodes key + IV from a base64 string (URL fragment)
 * @param {string} encoded
 * @returns {{ key: Uint8Array, iv: Uint8Array }}
 */
export function decodeKeyData(encoded) {
  const { key, iv } = JSON.parse(atob(encoded));
  return {
    key: new Uint8Array(key),
    iv: new Uint8Array(iv)
  };
}
