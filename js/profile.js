document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'gravenholdrp-user';
  const form = document.getElementById('authForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const submitBtn = form?.querySelector('.primary-btn');
  const switchBtn = document.getElementById('switchAuthBtn');
  const authModeLabel = document.getElementById('authModeLabel');
  const authStatus = document.getElementById('authStatus');
  const authFormContainer = document.querySelector('.auth-form');
  const profilePanel = document.getElementById('profilePanel');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const logoutBtn = document.getElementById('logoutBtn');

  let mode = 'login';

  setMode('login');
  updateView();

  switchBtn?.addEventListener('click', () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);
    if (authStatus) {
      authStatus.textContent = '';
      authStatus.classList.remove('error', 'success');
    }
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = usernameInput?.value.trim();
    const password = passwordInput?.value.trim();

    if (!username || !password) {
      return showMessage('Будь ласка, заповни всі поля.', 'error');
    }

    const stored = getStoredUser();

    if (mode === 'register') {
      saveUser({ username });
      updateView();
      showMessage('');
      form.reset();
    } else {
      if (!stored) {
        return showMessage('Спершу зареєструй акаунт, щоб увійти.', 'error');
      }
      if (stored.username !== username) {
        return showMessage('Нікнейм не знайдено. Спробуй ще раз або зареєструйся.', 'error');
      }
      updateView();
      showMessage('');
      form.reset();
    }
  });

  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    showMessage('Ти вийшов із профілю. До зустрічі в GravenholdRP!', 'success');
    updateView();
    setMode('login');
    form?.reset();
  });

  function setMode(newMode) {
    mode = newMode;
    if (!switchBtn || !authModeLabel || !submitBtn) return;
    if (mode === 'login') {
      switchBtn.textContent = 'Зареєструватися';
      authModeLabel.textContent = 'Немає акаунта?';
      submitBtn.textContent = 'Увійти';
    } else {
      switchBtn.textContent = 'Увійти';
      authModeLabel.textContent = 'Вже граєш з нами?';
      submitBtn.textContent = 'Створити акаунт';
    }
  }

  function updateView() {
    const stored = getStoredUser();
    if (stored && stored.username) {
      if (authFormContainer) {
        authFormContainer.style.display = 'none';
      }
      if (profilePanel) {
        profilePanel.classList.add('active');
      }
      if (welcomeMessage) {
        welcomeMessage.textContent = `Привіт, ${stored.username}!`;
      }
    } else {
      if (authFormContainer) {
        authFormContainer.style.display = '';
      }
      if (profilePanel) {
        profilePanel.classList.remove('active');
      }
    }
  }

  function getStoredUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Не вдалося прочитати профіль:', error);
      return null;
    }
  }

  function saveUser(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function showMessage(message, type) {
    if (!authStatus) return;
    authStatus.textContent = message;
    authStatus.classList.remove('error', 'success');
    if (type) {
      authStatus.classList.add(type);
    }
  }
});
