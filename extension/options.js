// オプションページのスクリプト
// Slack の Bot トークンとチャンネル ID を暗号化してブラウザに保存する
// また、保存済みの値を読み込んでフォームに表示する

// 保存ボタンが押された時の処理
document.getElementById('save').addEventListener('click', async () => {
  const token = document.getElementById('token').value;
  const channelId = document.getElementById('channel').value;
  const memberId = document.getElementById('member').value;

  // ローカルストレージに保存する前に暗号化する
  const encToken = await encryptText(token);
  const encChannelId = await encryptText(channelId);
  const encMemberId = await encryptText(memberId);

  chrome.storage.local.set({ token: encToken, channel: encChannelId, member: encMemberId }, () => {
    const statusEl = document.getElementById('status');
    statusEl.textContent = 'Saved!';
    statusEl.style.color = '#28a745';

    // 保存メッセージは1.5秒後に消す
    setTimeout(() => { statusEl.textContent = ''; }, 1500);
  });
});

document.addEventListener('DOMContentLoaded', async () => {
  // 保存済みのトークン等を読み込んでフォームに表示
  const { token, channelId, memberId } = await loadCredentials();
  if (token) {
    document.getElementById('token').value = token;
  }
  if (channelId) {
    document.getElementById('channel').value = channelId;
  }
  if (memberId) {
    document.getElementById('member').value = memberId;
  }
});
