// Slack トークンなどを取得して復号する共通処理
async function loadCredentials() {
  try {
    const items = await chrome.storage.local.get([
      'token',
      'channels',
      'member',
      'mention',
    ]);

    const token = items.token ? await decryptText(items.token) : null;
    const channels = items.channels
      ? JSON.parse(await decryptText(items.channels))
      : null;
    const memberId = items.member ? await decryptText(items.member) : null;
    const mention = 'mention' in items ? items.mention : null;

    return { token, channels, memberId, mention };
  } catch (e) {
    console.error('Failed to load credentials', e);
    return { token: null, channels: null, memberId: null, mention: null };
  }
}

