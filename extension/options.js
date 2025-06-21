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

document.addEventListener('DOMContentLoaded', () => {
  // ページ読み込み時に保存済みの値を復号して入力欄に表示する
  chrome.storage.local.get(['token', 'channel', 'member'], async (items) => {
    if (items.token) {
      try {
        document.getElementById('token').value = await decryptText(items.token);
      } catch (e) {
        console.error('Failed to decrypt token', e);
      }
    }
    if (items.channel) {
      try {
        document.getElementById('channel').value = await decryptText(items.channel);
      } catch (e) {
        console.error('Failed to decrypt channel', e);
      }
    }
    if (items.member) {
      try {
        document.getElementById('member').value = await decryptText(items.member);
      } catch (e) {
        console.error('Failed to decrypt member', e);
      }
    }
  });
});
