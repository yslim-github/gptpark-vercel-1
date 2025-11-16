
const KEY_STORAGE_KEY = 'cryptoKey';
const ENCRYPTION_ALGORITHM = 'AES-GCM';
const ENCRYPTION_EXTRACTABLE = true;
const ENCRYPTION_KEY_USAGES: KeyUsage[] = ['encrypt', 'decrypt'];

function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getEncryptionKey(): Promise<CryptoKey> {
  const storedKey = localStorage.getItem(KEY_STORAGE_KEY);
  if (storedKey) {
    try {
      const jwk = JSON.parse(storedKey);
      return await window.crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: ENCRYPTION_ALGORITHM },
        ENCRYPTION_EXTRACTABLE,
        ENCRYPTION_KEY_USAGES
      );
    } catch (e) {
      console.error("Failed to import stored key, generating new one.", e);
    }
  }

  const newKey = await window.crypto.subtle.generateKey(
    { name: ENCRYPTION_ALGORITHM, length: 256 },
    ENCRYPTION_EXTRACTABLE,
    ENCRYPTION_KEY_USAGES
  );

  const jwk = await window.crypto.subtle.exportKey('jwk', newKey);
  localStorage.setItem(KEY_STORAGE_KEY, JSON.stringify(jwk));

  return newKey;
}

export async function encrypt(data: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(data);

  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM, iv },
    key,
    encodedData
  );

  const ivBase64 = bufferToBase64(iv);
  const contentBase64 = bufferToBase64(encryptedContent);

  return `${ivBase64}.${contentBase64}`;
}

export async function decrypt(encryptedData: string): Promise<string> {
  const key = await getEncryptionKey();
  const parts = encryptedData.split('.');
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted data format.");
  }
  const [ivBase64, contentBase64] = parts;

  const iv = base64ToBuffer(ivBase64);
  const encryptedContent = base64ToBuffer(contentBase64);

  const decryptedContent = await window.crypto.subtle.decrypt(
    { name: ENCRYPTION_ALGORITHM, iv },
    key,
    encryptedContent
  );

  return new TextDecoder().decode(decryptedContent);
}
