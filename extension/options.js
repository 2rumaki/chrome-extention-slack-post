// オプションページのスクリプト
// Slack の Bot トークンとチャンネル ID を暗号化してブラウザに保存する
// また、保存済みの値を読み込んでフォームに表示する

// 保存ボタンが押された時の処理
document.getElementById('save').addEventListener('click', async () => {
  const token = document.getElementById('token').value;
  const channel = document.getElementById('channel').value;
  const member = document.getElementById('member').value;

  // ローカルストレージに保存する前に暗号化する
  const encToken = await encryptText(token);
  const encChannel = await encryptText(channel);
  const encMember = await encryptText(member);

  chrome.storage.local.set({ token: encToken, channel: encChannel, member: encMember }, () => {
    const statusEl = document.getElementById('status');
    statusEl.textContent = 'Saved!';
    statusEl.style.color = '#28a745';

    // 保存メッセージは1.5秒後に消す
    setTimeout(() => { statusEl.textContent = ''; }, 1500);
  });
});

document.addEventListener('DOMContentLoaded', async () => {
  // 保存済みのトークン等を読み込んでフォームに表示
  const { token, channel, member } = await loadCredentials();
  if (token) {
    document.getElementById('token').value = token;
  }
  if (channel) {
    document.getElementById('channel').value = channel;
  }
  if (member) {
    document.getElementById('member').value = member;
  }
});
