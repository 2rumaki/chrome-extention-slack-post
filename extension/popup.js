// ポップアップから現在のタブの URL とコメントを Slack に送信する
document.getElementById('send').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Sending...';

  // アクティブなタブの URL を取得
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;

  // 入力されたコメントを取得
  const comment = document.getElementById('comment').value;

  // 保存されているトークン、チャンネル ID、メンバー ID を取得
  chrome.storage.local.get(['token', 'channel', 'member'], async (items) => {
    let token = null;
    let channel = null;
    let member = null;
    if (items.token) {
      try {
        token = await decryptText(items.token);
      } catch (e) {
        console.error('Failed to decrypt token', e);
      }
    }
    if (items.channel) {
      try {
        channel = await decryptText(items.channel);
      } catch (e) {
        console.error('Failed to decrypt channel', e);
      }
    }
    if (items.member) {
      try {
        member = await decryptText(items.member);
      } catch (e) {
        console.error('Failed to decrypt member', e);
      }
    }
    // 必要な情報が未設定の場合はエラー表示
    if (!token || !channel || !member) {
      statusEl.textContent = 'Set Slack token, channel and member in options.';
      return;
    }
    try {
      const mention = `<@${member}>`;

      // Slack API へメッセージを送信
      const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ channel, text: `${mention}\n${url}\n${comment}` })
      });
      const data = await res.json();
      if (data.ok) {
        // 正常に投稿できた場合
        statusEl.textContent = 'Posted!';
        document.getElementById('comment').value = '';
      } else {
        // API からエラーが返ってきた場合
        console.error('Slack API error', data);
        statusEl.textContent = 'Failed: ' + (data.error || 'unknown error');
      }
    } catch (e) {
      // ネットワークエラーなど API 通信に失敗した場合
      console.error(e);
      statusEl.textContent = 'Failed to post.';
    }
  });
});
