function btoaBytes(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function atobBytes(str) {
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

async function getStoredKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get('encKey', (items) => {
      resolve(items.encKey);
    });
  });
}

async function setStoredKey(key) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ encKey: key }, resolve);
  });
}

async function getKey() {
  const stored = await getStoredKey();
  let keyBytes;
  if (stored) {
    keyBytes = atobBytes(stored);
  } else {
    keyBytes = crypto.getRandomValues(new Uint8Array(32));
    await setStoredKey(btoaBytes(keyBytes));
  }
  return crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function encryptText(text) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(text)
  );
  const result = new Uint8Array(iv.byteLength + encrypted.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(encrypted), iv.byteLength);
  return btoaBytes(result);
}

async function decryptText(str) {
  const data = atobBytes(str);
  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);
  const key = await getKey();
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );
  return new TextDecoder().decode(decrypted);
}
