document.getElementById('send').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Sending...';
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;
  const comment = document.getElementById('comment').value;

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
    if (!token || !channel) {
      statusEl.textContent = 'Set Slack token and channel in options.';
      return;
    }
    try {
      const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ channel, text: `*${url}*\n${comment}` })
      });
      const data = await res.json();
      if (data.ok) {
        statusEl.textContent = 'Posted!';
        document.getElementById('comment').value = '';
      } else {
        console.error('Slack API error', data);
        statusEl.textContent = 'Failed: ' + (data.error || 'unknown error');
      }
    } catch (e) {
      console.error(e);
      statusEl.textContent = 'Failed to post.';
    }
  });
});
