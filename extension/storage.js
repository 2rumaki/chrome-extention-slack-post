// Slack トークンなどを取得して復号する共通処理
async function loadCredentials() {
  try {
    const items = await chrome.storage.local.get([
      'token',
      'channel',
      'member',
    ]);

    const token = items.token ? await decryptText(items.token) : null;
    const channelId = items.channel
      ? await decryptText(items.channel)
      : null;
    const memberId = items.member ? await decryptText(items.member) : null;

    return { token, channelId, memberId };
  } catch (e) {
    console.error('Failed to load credentials', e);
    return { token: null, channelId: null, memberId: null };
  }
}

