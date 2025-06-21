// Slack トークンなどを取得して復号する共通処理
async function loadCredentials() {
  const items = await new Promise((resolve) => {
    chrome.storage.local.get(['token', 'channel', 'member'], resolve);
  });
  try {
    const token = items.token ? await decryptText(items.token) : null;
    const channel = items.channel ? await decryptText(items.channel) : null;
    const member = items.member ? await decryptText(items.member) : null;
    return { token, channel, member };
  } catch (e) {
    console.error('Failed to load credentials', e);
    return { token: null, channel: null, member: null };
  }
}

