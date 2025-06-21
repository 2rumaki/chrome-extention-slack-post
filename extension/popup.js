// ポップアップから現在のタブの URL とコメントを Slack に送信する
document.getElementById('send').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Sending...';

  // アクティブなタブの URL を取得
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;

  // 入力されたコメントを取得
  const comment = document.getElementById('comment').value;

  // 保存されているトークンとチャンネル ID を取得
  chrome.storage.local.get(['token', 'channel'], async (items) => {
    let token = null;
    let channel = null;
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
    // トークンまたはチャンネル ID が未設定の場合はエラー表示
    if (!token || !channel) {
      statusEl.textContent = 'Set Slack token and channel in options.';
      return;
    }
    try {
      // Google アカウントのメールアドレスを取得
      const userInfo = await new Promise((resolve) => {
        chrome.identity.getProfileUserInfo(resolve);
      });

      let mention = '';
      if (userInfo && userInfo.email) {
        try {
          // メールアドレスから Slack ユーザーを検索
          const lookupRes = await fetch(
            `https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(userInfo.email)}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          const lookupData = await lookupRes.json();
          if (lookupData.ok && lookupData.user) {
            mention = `<@${lookupData.user.id}> `;
          }
        } catch (e) {
          console.error('Slack lookup error', e);
        }
      }

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
