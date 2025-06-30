// オプションページのスクリプト
// Slack の Bot トークンとチャンネル ID を暗号化してブラウザに保存する
// また、保存済みの値を読み込んでフォームに表示する

// 保存ボタンが押された時の処理
document.getElementById('save').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  const tokenEl = document.getElementById('token');
  const memberEl = document.getElementById('member');
  const token = tokenEl.value.trim();
  const memberId = memberEl.value.trim();

  // 入力欄のエラースタイルをリセット
  tokenEl.classList.remove('error');
  memberEl.classList.remove('error');
  document.querySelectorAll('.channel-name').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.channel-id').forEach(el => el.classList.remove('error'));

  const channelRows = document.querySelectorAll('.channel-row');
  const channels = [];
  channelRows.forEach(row => {
    const nameInput = row.querySelector('.channel-name');
    const idInput = row.querySelector('.channel-id');
    const name = nameInput.value.trim();
    const id = idInput.value.trim();
    if (name && id) {
      channels.push({ name, id });
    }
  });

  // 未入力項目をハイライト
  let hasError = false;
  if (!token) {
    tokenEl.classList.add('error');
    hasError = true;
  }
  if (!memberId) {
    memberEl.classList.add('error');
    hasError = true;
  }
  if (channels.length === 0) {
    document.querySelectorAll('.channel-name').forEach(el => el.classList.add('error'));
    document.querySelectorAll('.channel-id').forEach(el => el.classList.add('error'));
    hasError = true;
  }

  if (hasError) {
    statusEl.textContent = '必須項目を入力してください。';
    statusEl.style.color = '#dc3545';
    setTimeout(() => {
      statusEl.textContent = '';
    }, 5000);
    return;
  }

  // トークンの有効性チェック
  try {
    const res = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!data.ok) {
      statusEl.textContent = 'トークンが無効です。';
      statusEl.style.color = '#dc3545';
      return;
    }
  } catch (e) {
    console.error('Token validation failed', e);
    statusEl.textContent = 'トークン確認中にエラーが発生しました。';
    statusEl.style.color = '#dc3545';
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

    statusEl.textContent = '保存しました。';
    statusEl.style.color = '#28a745';
  } catch (e) {
    console.error('Failed to save credentials', e);
    statusEl.textContent = '保存に失敗しました。';
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
