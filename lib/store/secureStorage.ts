
import type { StateStorage } from "zustand/middleware";

const DB_NAME = "fittish-admin-secure";
const DB_VERSION = 1;
const STORE_NAME = "crypto-keys";
const KEY_ID = "auth-encryption-key";

const CIPHER_PREFIX = "ENC1:";
const IV_LENGTH = 12;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function cryptoAvailable(): boolean {
  return (
    isBrowser() &&
    typeof indexedDB !== "undefined" &&
    typeof crypto !== "undefined" &&
    typeof crypto.subtle !== "undefined"
  );
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbGet(db: IDBDatabase, key: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbPut(db: IDBDatabase, key: string, value: CryptoKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function idbDelete(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

let keyPromise: Promise<CryptoKey | null> | null = null;

async function getEncryptionKey(): Promise<CryptoKey | null> {
  if (!cryptoAvailable()) return null;

  if (!keyPromise) {
    keyPromise = (async () => {
      try {
        const db = await openDatabase();
        const existing = await idbGet(db, KEY_ID);
        if (existing) return existing as CryptoKey;

        const key = await crypto.subtle.generateKey(
          { name: "AES-GCM", length: 256 },
          false,
          ["encrypt", "decrypt"]
        );
        await idbPut(db, KEY_ID, key);
        return key;
      } catch {
        return null;
      }
    })();
  }

  return keyPromise;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function encrypt(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  if (!key) {
    console.warn(
      "[secureStorage] Web Crypto unavailable — auth data is being stored UNENCRYPTED."
    );
    return plaintext;
  }

  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );

  const payload = new Uint8Array(IV_LENGTH + ciphertext.byteLength);
  payload.set(iv, 0);
  payload.set(new Uint8Array(ciphertext), IV_LENGTH);

  return CIPHER_PREFIX + toBase64(payload);
}

async function decrypt(stored: string): Promise<string | null> {
  if (!stored.startsWith(CIPHER_PREFIX)) return stored;

  const key = await getEncryptionKey();
  if (!key) return null;

  try {
    const payload = fromBase64(stored.slice(CIPHER_PREFIX.length));
    const iv = payload.slice(0, IV_LENGTH);
    const ciphertext = payload.slice(IV_LENGTH);

    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return new TextDecoder().decode(plaintext);
  } catch {

    return null;
  }
}

export const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (!isBrowser()) return null;
    try {
      const stored = localStorage.getItem(name);
      if (!stored) return null;
      return await decrypt(stored);
    } catch {
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (!isBrowser()) return;
    try {
      localStorage.setItem(name, await encrypt(value));
    } catch {
      console.warn("[secureStorage] Could not persist auth state.");
    }
  },

  removeItem: async (name: string): Promise<void> => {
    if (!isBrowser()) return;
    localStorage.removeItem(name);
  },
};

export async function destroyEncryptionKey(): Promise<void> {
  keyPromise = null;
  if (!cryptoAvailable()) return;
  try {
    const db = await openDatabase();
    await idbDelete(db, KEY_ID);
  } catch {
  }
}
