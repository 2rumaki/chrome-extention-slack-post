// オプションページのスクリプト
// Slack の Bot トークンとチャンネル ID を暗号化してブラウザに保存する
// また、保存済みの値を読み込んでフォームに表示する

// 保存ボタンが押された時の処理
document.getElementById('save').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  const token = document.getElementById('token').value.trim();
  const memberId = document.getElementById('member').value.trim();

  const channelRows = document.querySelectorAll('.channel-row');
  const channels = [];
  channelRows.forEach(row => {
    const name = row.querySelector('.channel-name').value.trim();
    const id = row.querySelector('.channel-id').value.trim();
    if (name && id) {
      channels.push({ name, id });
    }
  });

  if (!token || !memberId || channels.length === 0) {
    statusEl.textContent = '必須項目が未入力です。';
    statusEl.style.color = '#dc3545';
    setTimeout(() => {
      statusEl.textContent = '';
    }, 1500);
    return;
  }

  try {
    const encToken = await encryptText(token);
    const encMemberId = await encryptText(memberId);
    const encChannels = await encryptText(JSON.stringify(channels));

    await chrome.storage.local.set({
      token: encToken,
      channels: encChannels,
      member: encMemberId,
    });

    statusEl.textContent = 'Saved!';
    statusEl.style.color = '#28a745';
  } catch (e) {
    console.error('Failed to save credentials', e);
    statusEl.textContent = 'Failed to save.';
    statusEl.style.color = '#dc3545';
  } finally {
    // 保存メッセージは1.5秒後に消す
    setTimeout(() => {
      statusEl.textContent = '';
    }, 1500);
  }
});

function addChannelRow(name = '', id = '') {
  const container = document.getElementById('channels');
  const row = document.createElement('div');
  row.className = 'channel-row';

  const nameInput = document.createElement('input');
  nameInput.placeholder = 'Name';
  nameInput.value = name;
  nameInput.className = 'channel-name';
  row.appendChild(nameInput);

  const idInput = document.createElement('input');
  idInput.placeholder = 'C12345678';
  idInput.value = id;
  idInput.className = 'channel-id';
  row.appendChild(idInput);

  const upBtn = document.createElement('button');
  upBtn.textContent = '▲';
  upBtn.type = 'button';
  upBtn.className = 'move-up';
  upBtn.addEventListener('click', () => {
    const prev = row.previousElementSibling;
    if (prev) {
      container.insertBefore(row, prev);
    }
  });
  row.appendChild(upBtn);

  const downBtn = document.createElement('button');
  downBtn.textContent = '▼';
  downBtn.type = 'button';
  downBtn.className = 'move-down';
  downBtn.addEventListener('click', () => {
    const next = row.nextElementSibling;
    if (next) {
      container.insertBefore(next, row);
    }
  });
  row.appendChild(downBtn);

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'X';
  removeBtn.type = 'button';
  removeBtn.className = 'remove-channel';
  removeBtn.addEventListener('click', () => row.remove());
  row.appendChild(removeBtn);

  container.appendChild(row);
}

document.getElementById('addChannel').addEventListener('click', () => {
  addChannelRow();
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { token, channels, memberId } = await loadCredentials();
    if (token) {
      document.getElementById('token').value = token;
    }
    if (Array.isArray(channels) && channels.length) {
      channels.forEach(ch => addChannelRow(ch.name, ch.id));
    } else {
      addChannelRow();
    }
    if (memberId) {
      document.getElementById('member').value = memberId;
    }
  } catch (e) {
    console.error('Failed to load saved credentials', e);
  }
});
