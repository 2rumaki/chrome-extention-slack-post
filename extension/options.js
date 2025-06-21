document.getElementById('save').addEventListener('click', async () => {
  const token = document.getElementById('token').value;
  const channel = document.getElementById('channel').value;
  const encToken = await encryptText(token);
  const encChannel = await encryptText(channel);
  chrome.storage.local.set({ token: encToken, channel: encChannel }, () => {
    const statusEl = document.getElementById('status');
    statusEl.textContent = 'Saved!';
    statusEl.style.color = '#28a745';
    setTimeout(() => { statusEl.textContent = ''; }, 1500);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['token', 'channel'], async (items) => {
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
  });
});
