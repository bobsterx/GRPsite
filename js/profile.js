document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'gravenholdrp-user';
  const form = document.getElementById('authForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const submitBtn = form?.querySelector('.cta-button');
  const switchBtn = document.getElementById('switchAuthBtn');
  const authModeLabel = document.getElementById('authModeLabel');
  const authStatus = document.getElementById('authStatus');
  const authCard = document.querySelector('.auth-card');
  const profilePanel = document.getElementById('profilePanel');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const logoutBtn = document.getElementById('logoutBtn');

  let mode = 'login';
  let statsAnimated = false;

  setMode('login');
  updateView();

  switchBtn?.addEventListener('click', () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);
    showMessage('');
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = usernameInput?.value.trim();
    const password = passwordInput?.value.trim();

    if (!username || !password) {
      return showMessage('Заповни всі поля, будь ласка.', 'error');
    }

    const stored = getStoredUser();

    if (mode === 'register') {
      saveUser({ username });
      showMessage('Профіль створено. Тепер увійди, щоб продовжити.', 'success');
      setMode('login');
      form.reset();
      return;
    }

    if (!stored) {
      return showMessage('Спершу зареєструй акаунт, щоб увійти.', 'error');
    }

    if (stored.username !== username) {
      return showMessage('Нікнейм не знайдено. Спробуй ще раз.', 'error');
    }

    updateView();
    showMessage('Успішний вхід. Гарної служби!', 'success');
    form.reset();
  });

  logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    showMessage('Вихід виконано. До зустрічі у GravenholdRP!', 'success');
    setMode('login');
    statsAnimated = false;
    updateView();
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
    const isLoggedIn = Boolean(stored?.username);

    if (authCard) {
      authCard.classList.toggle('hidden', isLoggedIn);
    }

    if (profilePanel) {
      profilePanel.classList.toggle('active', isLoggedIn);
      profilePanel.classList.toggle('locked', !isLoggedIn);
      profilePanel.setAttribute('aria-hidden', String(!isLoggedIn));
    }

    if (welcomeMessage) {
      welcomeMessage.textContent = isLoggedIn ? `Привіт, ${stored.username}!` : 'Привіт, мандрівнику!';
    }

    if (isLoggedIn && !statsAnimated) {
      requestAnimationFrame(() => animateStats());
      statsAnimated = true;
    }
  }

  function animateStats() {
    if (!profilePanel) return;
    const radialItems = profilePanel.querySelectorAll('.radial-progress');
    radialItems.forEach((item) => {
      const value = Number(item.dataset.progress) || 0;
      item.style.setProperty('--progress', `${Math.max(0, Math.min(100, value))}%`);
      const valueEl = item.querySelector('.radial-value');
      if (valueEl) {
        valueEl.textContent = `${value}%`;
      }
    });

    const bars = profilePanel.querySelectorAll('.progress-bar span');
    bars.forEach((bar) => {
      const container = bar.closest('.bar-item');
      const label = container?.querySelector('.bar-value');
      const value = Number(label?.dataset.bar || 0);
      bar.style.width = `${Math.max(0, Math.min(100, value))}%`;
      if (label) {
        label.textContent = `${value}%`;
      }
    });
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
