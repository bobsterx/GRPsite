const STORAGE_KEY = 'gravenholdrp-user';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('loginPassword');
  const statusEl = document.getElementById('loginStatus');

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = usernameInput?.value.trim();
    const password = passwordInput?.value.trim();

    if (!username || !password) {
      return setStatus('Будь ласка, заповни всі поля.', 'error');
    }

    const user = readUser();
    if (!user) {
      return setStatus('Обліковий запис не знайдено. Зареєструйся, щоб продовжити.', 'error');
    }

    if (user.username !== username || user.password !== password) {
      return setStatus('Невірний нікнейм або пароль.', 'error');
    }

    setStatus('Вітаємо назад у GravenholdRP! Перенаправляємо…', 'success');
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

function readUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Не вдалося прочитати профіль:', error);
    return null;
  }
}
