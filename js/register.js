const STORAGE_KEY = 'gravenholdrp-user';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const usernameInput = document.getElementById('registerUsername');
  const emailInput = document.getElementById('registerEmail');
  const passwordInput = document.getElementById('registerPassword');
  const factionSelect = document.getElementById('registerFaction');
  const statusEl = document.getElementById('registerStatus');

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = usernameInput?.value.trim();
    const email = emailInput?.value.trim();
    const password = passwordInput?.value.trim();
    const faction = factionSelect?.value;

    if (!username || !email || !password || !faction) {
      return setStatus('Будь ласка, заповни всі поля форми.', 'error');
    }

    const newUser = {
      username,
      email,
      password,
      faction,
      level: '1',
      joined: formatDate(new Date()),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setStatus('Акаунт створено! Перенаправляємо до профілю…', 'success');

    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 700);
  });

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('error', 'success');
    if (type) statusEl.classList.add(type);
  }
});

function formatDate(date) {
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
