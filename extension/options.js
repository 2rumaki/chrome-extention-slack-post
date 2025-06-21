document.getElementById('save').addEventListener('click', () => {
  const token = document.getElementById('token').value;
  const channel = document.getElementById('channel').value;
  chrome.storage.local.set({ token, channel }, () => {
    document.getElementById('status').textContent = 'Saved!';
    setTimeout(() => { document.getElementById('status').textContent = ''; }, 1500);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['token', 'channel'], (items) => {
    if (items.token) document.getElementById('token').value = items.token;
    if (items.channel) document.getElementById('channel').value = items.channel;
  });
});
