const state = {
  strings: {},
  config: null,
  components: [],
  installing: new Set()
};

const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));

const applyLocalization = () => {
  qsa('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    const segments = key.split('.');
    let value = state.strings;
    segments.forEach((segment) => {
      value = value?.[segment];
    });
    if (value) {
      element.textContent = value;
    }
  });
};

const renderComponents = () => {
  const container = qs('#components');
  container.innerHTML = '';

  state.components.forEach((component) => {
    const card = document.createElement('article');
    card.className = 'component-card';

    const status = component.state.status;
    const actionText =
      status === 'installed'
        ? state.strings.home.installed
        : status === 'downloading'
        ? state.strings.home.installing
        : state.strings.home.install;

    card.innerHTML = `
      <div class="meta">
        <div>
          <h3>${component.title}</h3>
          <p>${component.description}</p>
        </div>
        <span>${component.required ? state.strings.home.required : state.strings.home.optional}</span>
      </div>
      <div class="progress-bar"><span style="width: ${component.state.progress || 0}%"></span></div>
      <button class="primary component-action" data-id="${component.id}" ${
        status === 'downloading' ? 'disabled' : ''
      }>${actionText}</button>
    `;

    container.appendChild(card);
  });
};

const renderUpdates = (items) => {
  const container = qs('#updates-list');
  container.innerHTML = '';

  if (!items || items.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = state.strings.updates.empty;
    container.appendChild(empty);
    return;
  }

  items.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'update-card';
    card.style.animationDelay = `${index * 0.05}s`;
    card.innerHTML = `
      <h3>${item.title}</h3>
      <time>${new Date(item.date).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</time>
      <p>${item.excerpt}</p>
    `;
    container.appendChild(card);
  });
};

const updateLaunchState = async () => {
  const allowed = await window.gravenhold.checkRequired();
  qs('#launch').disabled = !allowed;
};

const handleComponentClick = async (event) => {
  if (!event.target.classList.contains('component-action')) {
    return;
  }

  const id = event.target.getAttribute('data-id');
  state.installing.add(id);
  event.target.disabled = true;
  event.target.textContent = state.strings.home.installing;

  const updateProgress = (progress) => {
    const card = event.target.closest('.component-card');
    const bar = card.querySelector('.progress-bar span');
    bar.style.width = `${progress}%`;
  };

  for (let i = 0; i <= 70; i += 10) {
    await new Promise((resolve) => setTimeout(resolve, 160));
    updateProgress(i);
  }

  try {
    const status = await window.gravenhold.installComponent(id);
    updateProgress(status.progress || 100);
    event.target.textContent = state.strings.home.installed;
    state.installing.delete(id);
    state.components = await window.gravenhold.listComponents();
    renderComponents();
    updateLaunchState();
    return status;
  } catch (error) {
    console.error(error);
    window.alert('Не вдалося встановити компонент. Переконайтеся в наявності інтернету.');
    event.target.disabled = false;
    event.target.textContent = state.strings.home.install;
    state.installing.delete(id);
    updateProgress(0);
    return null;
  }
};

const changeTab = (tab) => {
  qsa('.tab').forEach((section) => {
    section.classList.toggle('active', section.id === tab);
  });
  qsa('.tab-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === tab);
  });
};

const bindTabNavigation = () => {
  qsa('.tab-button').forEach((button) =>
    button.addEventListener('click', () => changeTab(button.dataset.tab))
  );
};

const bindWindowControls = () => {
  qs('#btn-close').addEventListener('click', () => window.gravenhold.close());
  qs('#btn-minimize').addEventListener('click', () => window.gravenhold.minimize());
  qs('#btn-maximize').addEventListener('click', () => window.gravenhold.maximize());
};

const populateSettings = () => {
  if (!state.config) return;
  qs('#java-path').value = state.config.javaPath || '';
  qs('#ram').value = state.config.ram;
  qs('#resolution-width').value = state.config.resolution.width;
  qs('#resolution-height').value = state.config.resolution.height;
  qs('#winter-mode').checked = !!state.config.winterEvent;
  qs('#auto-update').checked = !!state.config.autoUpdate;

  const theme = state.config.theme || 'dark';
  document.body.classList.toggle('theme-light', theme === 'light');
  document.body.classList.toggle('theme-dark', theme !== 'light');
  document.body.classList.toggle('winter-event', !!state.config.winterEvent);
  qsa('.toggle').forEach((toggle) => toggle.classList.toggle('active', toggle.dataset.theme === theme));
};

const bindSettings = () => {
  qs('#select-java').addEventListener('click', async () => {
    const path = await window.gravenhold.selectJava();
    if (path) {
      qs('#java-path').value = path;
    }
  });

  qsa('.toggle').forEach((toggle) =>
    toggle.addEventListener('click', async () => {
      const theme = toggle.dataset.theme;
      await window.gravenhold.toggleTheme(theme);
      state.config.theme = theme;
      populateSettings();
    })
  );

  qs('#winter-mode').addEventListener('change', (event) => {
    document.body.classList.toggle('winter-event', event.target.checked);
    if (event.target.checked) {
      import('../scripts/winterevent.js').then((module) => module.enableWinter());
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'styles/winterevent.css';
      link.id = 'winter-styles';
      document.head.appendChild(link);
    } else {
      document.body.dispatchEvent(new CustomEvent('winter:disable'));
      document.querySelector('#winter-styles')?.remove();
    }
  });

  qs('#settings-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      javaPath: qs('#java-path').value,
      ram: Number(qs('#ram').value),
      resolution: {
        width: Number(qs('#resolution-width').value),
        height: Number(qs('#resolution-height').value)
      },
      theme: state.config.theme,
      winterEvent: qs('#winter-mode').checked,
      autoUpdate: qs('#auto-update').checked
    };

    state.config = await window.gravenhold.saveConfig(payload);
    populateSettings();
  });
};

const bindLaunchButton = () => {
  qs('#launch').addEventListener('click', async () => {
    try {
      await window.gravenhold.launchGame();
    } catch (error) {
      console.error(error);
    }
  });
};

const bindUpdaterEvents = () => {
  const banner = qs('#update-banner');
  const message = qs('#update-message');
  const restart = qs('#update-restart');

  restart.addEventListener('click', () => {
    window.gravenhold.restartForUpdate();
  });

  window.gravenhold.onUpdaterEvent((payload) => {
    if (payload.type === 'available') {
      banner.hidden = false;
      message.textContent = 'Доступне нове оновлення лаунчера...';
      restart.disabled = true;
    }
    if (payload.type === 'ready') {
      banner.hidden = false;
      message.textContent = 'Оновлення завантажено. Перезапустіть, щоб застосувати.';
      restart.disabled = false;
    }
  });
};

const bindSupportForm = () => {
  const form = qs('#support-form');
  const statusElement = qs('#support-status');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    statusElement.textContent = '...';
    try {
      await window.gravenhold.submitSupport({
        category: qs('#support-category').value,
        email: qs('#support-email').value,
        message: qs('#support-message').value
      });
      statusElement.textContent = state.strings.support.success;
      statusElement.style.color = '#39d4ff';
      form.reset();
    } catch (error) {
      statusElement.textContent = state.strings.support.error;
      statusElement.style.color = '#ff7070';
    }
  });
};

const bindSocialLinks = () => {
  qsa('.social-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      event.preventDefault();
      const url = card.getAttribute('href');
      window.gravenhold.openExternal(url);
    });
  });
};

const initParticles = () => {
  const canvas = qs('#particle-canvas');
  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: 48 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0005,
    vy: (Math.random() - 0.5) * 0.0005,
    size: Math.random() * 2 + 0.5
  }));

  const resize = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  };

  window.addEventListener('resize', resize);
  resize();

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 3,
      0,
      canvas.width / 2,
      canvas.height / 3,
      canvas.width
    );
    gradient.addColorStop(0, 'rgba(57, 212, 255, 0.22)');
    gradient.addColorStop(1, 'rgba(6, 12, 19, 0.02)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > 1) particle.vx *= -1;
      if (particle.y < 0 || particle.y > 1) particle.vy *= -1;

      ctx.beginPath();
      ctx.arc(particle.x * canvas.width, particle.y * canvas.height, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(57, 212, 255, 0.55)';
      ctx.fill();
    });

    requestAnimationFrame(render);
  };

  render();
};

const bootstrap = async () => {
  state.strings = await window.gravenhold.getLocalization();
  applyLocalization();

  state.config = await window.gravenhold.loadConfig();
  populateSettings();

  if (state.config.winterEvent) {
    qs('#winter-mode').checked = true;
    import('../scripts/winterevent.js').then((module) => module.enableWinter());
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'styles/winterevent.css';
    link.id = 'winter-styles';
    document.head.appendChild(link);
  }

  state.components = await window.gravenhold.listComponents();
  renderComponents();
  updateLaunchState();

  const updates = await window.gravenhold.fetchUpdates();
  renderUpdates(updates);

  bindTabNavigation();
  bindWindowControls();
  bindSettings();
  bindSupportForm();
  bindLaunchButton();
  bindUpdaterEvents();
  bindSocialLinks();
  qs('#components').addEventListener('click', handleComponentClick);
  initParticles();
};

window.addEventListener('DOMContentLoaded', bootstrap);
