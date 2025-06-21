// Uint8Array を Base64 文字列へ変換するヘルパー
function btoaBytes(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

// Base64 文字列を Uint8Array に変換するヘルパー
function atobBytes(str) {
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

// 生成済みの暗号鍵を取得する
async function getStoredKey() {
  const items = await chrome.storage.local.get('encKey');
  return items.encKey;
}

// 暗号鍵を保存する
async function setStoredKey(key) {
  await chrome.storage.local.set({ encKey: key });
}

// 暗号処理に使用する鍵を取得する
// 未生成の場合は新しく作成して保存する
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

// 文字列を AES-GCM で暗号化し Base64 文字列として返す
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

// encryptText で暗号化した文字列を復号する
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
