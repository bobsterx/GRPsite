const STORAGE_KEY = 'gravenholdrp-user';

const badgesByFaction = {
  'Гільдія клинків': ['Майстер дуелей', 'Захисник столиці'],
  'Орден арканістів': ['Відкривач порталів', 'Арканічний історик'],
  'Синдикат патриціїв': ['Магнат ринків', 'Дипломат світанку'],
};

document.addEventListener('DOMContentLoaded', () => {
  const panel = document.getElementById('profilePanel');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const logoutBtn = document.getElementById('logoutBtn');
  const heroActions = document.querySelector('.profile-actions');
  const nicknameEl = document.getElementById('statNickname');
  const factionEl = document.getElementById('statFaction');
  const levelEl = document.getElementById('statLevel');
  const joinedEl = document.getElementById('statJoined');
  const badgeList = document.getElementById('badgeList');
  const statusEl = document.getElementById('authStatus');

  const user = readUser();

  if (user) {
    panel?.classList.add('active');
    if (welcomeMessage) {
      welcomeMessage.textContent = `Привіт, ${user.username}!`;
    }
    if (heroActions) {
      heroActions.style.display = 'none';
    }
    if (nicknameEl) nicknameEl.textContent = user.username;
    if (factionEl) factionEl.textContent = user.faction || '—';
    if (levelEl) levelEl.textContent = user.level || '1';
    if (joinedEl) joinedEl.textContent = user.joined || formatDate(new Date());

    if (badgeList) {
      badgeList.innerHTML = '';
      const badges = getBadges(user);
      badges.forEach((badge) => {
        const item = document.createElement('li');
        item.textContent = badge;
        badgeList.append(item);
      });
    }
  } else {
    panel?.classList.remove('active');
    if (statusEl) {
      statusEl.textContent = 'Щоб бачити свої статистики, увійди або створи акаунт.';
    }
    if (heroActions) {
      heroActions.style.display = '';
    }
  }

  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    if (statusEl) {
      statusEl.textContent = 'Ти вийшов з профілю. До зустрічі в GravenholdRP!';
    }
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 600);
  });
});

function readUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Не вдалося прочитати профіль:', error);
    return null;
  }
}

function getBadges(user) {
  const base = ['Піонер сезону «Арканіум»'];
  const factionBadges = badgesByFaction[user.faction] || ['Мандрівник Gravenhold'];
  if (Number(user.level) >= 15) {
    base.push('Легенда серверу');
  }
  return [...base, ...factionBadges];
}

function formatDate(date) {
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
