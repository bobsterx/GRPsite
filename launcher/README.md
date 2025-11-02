# GravenholdRP Launcher

Electron-базований лаунчер для середньовічного RP-проєкту **GravenholdRP**. Інтерфейс розроблено українською мовою з акцентами неону та підтримкою зимових візуальних ефектів.

## Можливості

- Кастомне вікно з анімованим тлом та скляними панелями.
- Вкладки «Головна», «Оновлення», «Налаштування», «Підтримка», «Соцмережі».
- Менеджер компонентів (моди, датапаки, ресурс-пак) з прогрес-барами та статусами.
- Завантаження новин із віддаленого JSON із локальним резервом.
- Збереження налаштувань у локальному `config.json` (шлях до Java, RAM, роздільна здатність, тема, зимовий режим).
- Форма підтримки з логуванням офлайн-запитів.
- Зимовий режим із сніжинками, підсвіткою та процедурним аудіо.
- Модуль локалізації на базі `uk-UA.json`.

## Структура

```
launcher/
├── main.js                # Головний процес Electron
├── package.json           # Залежності та скрипти
├── .eslintrc.cjs          # Налаштування ESLint
├── src/
│   ├── data/updates.json  # Резервні новини
│   ├── localization/      # JSON із локалізацією
│   ├── main/
│   │   ├── configManager.js
│   │   ├── localization.js
│   │   └── updater.js
│   ├── preload/
│   │   ├── mainPreload.js
│   │   └── splashPreload.js
│   └── renderer/
│       ├── assets/logo.svg
│       ├── index.html
│       ├── scripts/
│       │   ├── renderer.js
│       │   └── winterevent.js
│       ├── splash.html
│       └── styles/
│           ├── main.css
│           └── winterevent.css
```

## Запуск

```bash
cd launcher
npm install
npm start
```

## Збирання

```bash
npm run build
```

## Ліцензія

MIT
