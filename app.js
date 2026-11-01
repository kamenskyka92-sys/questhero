/**
 * КВЕСТГЕРОЙ (QuestHero) — Главная логика приложения (app.js)
 * Темы: Супергерой, Minecraft, Roblox, Brawl Stars
 * Звуки: Web Audio API (адаптированные под тему)
 * Полная поддержка LocalStorage, родительского контроля и интерактивных таймеров
 */

const STORAGE_KEY = 'questhero_save_v1';

// Набор аватарок
const AVATARS = ['🦁', '🦊', '🚀', '🦸‍♂️', '🦸‍♀️', '🥷', '🤖', '🦄', '🧙‍♂️', '🦖', '🐼', '🐯', '⚡', '🌟', '🎮', '👑'];

// Стартовые квесты по умолчанию
const DEFAULT_TASKS = [
  { id: 't1', title: 'Заправить кровать и умыться', icon: '🛏️', category: 'morning', coins: 10, xp: 15, requiresApproval: false, status: 'pending' },
  { id: 't2', title: 'Вкусный и полезный завтрак', icon: '🍳', category: 'morning', coins: 10, xp: 15, requiresApproval: false, status: 'pending' },
  { id: 't3', title: 'Сделать уроки без напоминаний', icon: '📚', category: 'study', coins: 25, xp: 40, requiresApproval: true, status: 'pending' },
  { id: 't4', title: 'Почитать книгу (20 минут)', icon: '📖', category: 'study', coins: 20, xp: 30, requiresApproval: false, status: 'pending' },
  { id: 't5', title: 'Навести порядок на столе и в комнате', icon: '🧹', category: 'chores', coins: 20, xp: 25, requiresApproval: true, status: 'pending' },
  { id: 't6', title: 'Помочь убрать со стола после еды', icon: '🍽️', category: 'chores', coins: 15, xp: 20, requiresApproval: false, status: 'pending' },
  { id: 't7', title: 'Спорт, зарядка или прогулка (30 мин)', icon: '⚽', category: 'health', coins: 20, xp: 30, requiresApproval: false, status: 'pending' },
  { id: 't8', title: 'Съесть свежие фрукты или овощи', icon: '🍎', category: 'health', coins: 10, xp: 15, requiresApproval: false, status: 'pending' },
  { id: 't9', title: 'Собрать рюкзак на завтра', icon: '🎒', category: 'evening', coins: 15, xp: 20, requiresApproval: false, status: 'pending' },
  { id: 't10', title: 'Почистить зубы и вовремя лечь спать', icon: '🌙', category: 'evening', coins: 15, xp: 25, requiresApproval: true, status: 'pending' }
];

// Стартовые награды магазина
const DEFAULT_REWARDS = [
  { id: 'r1', title: '30 минут на компьютере / приставке', icon: '🎮', type: 'screen_time', cost: 30, duration: 30 },
  { id: 'r2', title: '45 минут YouTube или игр на телефоне', icon: '📱', type: 'screen_time', cost: 40, duration: 45 },
  { id: 'r3', title: '1 час свободного экранного времени', icon: '🕹️', type: 'screen_time', cost: 55, duration: 60 },
  { id: 'r4', title: '100 ₽ наличными или в копилку', icon: '💵', type: 'money', cost: 50, duration: 0 },
  { id: 'r5', title: '250 ₽ на карманные расходы', icon: '💰', type: 'money', cost: 110, duration: 0 },
  { id: 'r6', title: 'Выбрать любимый десерт / мороженое', icon: '🍦', type: 'fun', cost: 35, duration: 0 },
  { id: 'r7', title: 'Семейная пицца или бургеры', icon: '🍕', type: 'fun', cost: 80, duration: 0 },
  { id: 'r8', title: 'Поход в кино / парк развлечений', icon: '🎟️', type: 'fun', cost: 160, duration: 0 },
  { id: 'r9', title: 'Поздний отбой на 30 минут в выходной', icon: '😴', type: 'fun', cost: 30, duration: 0 }
];

// Достижения (Ачивки)
const DEFAULT_BADGES = [
  { id: 'b_first', title: 'Первый подвиг', icon: '🌱', desc: 'Выполни свой самый первый квест', unlocked: false },
  { id: 'b_streak3', title: 'В ударе!', icon: '🔥', desc: 'Удержи стрик выполнения 3 дня подряд', unlocked: false },
  { id: 'b_streak7', title: 'Супергерой недели', icon: '⚡', desc: 'Дисциплина 7 дней без единого пропуска!', unlocked: false },
  { id: 'b_study', title: 'Профессор', icon: '🎓', desc: 'Выполни 5 квестов по учёбе', count: 0, target: 5, unlocked: false },
  { id: 'b_chores', title: 'Хозяин дома', icon: '🧹', desc: 'Выполни 5 дел по дому', count: 0, target: 5, unlocked: false },
  { id: 'b_coins100', title: 'Юный Магнат', icon: '🪙', desc: 'Заработай суммарно 100 монет', unlocked: false },
  { id: 'b_level5', title: 'Легендарный Герой', icon: '👑', desc: 'Достигни 5-го уровня мастерства', unlocked: false }
];

// Уровни и звания
const LEVEL_TITLES = [
  'Новичок-Искатель',
  'Мастер привычек',
  'Хранитель порядка',
  'Звездный Чемпион',
  'Повелитель Квестов',
  'Легендарный Супергерой'
];

class QuestHeroApp {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
    this.currentTheme = 'hero';
    this.currentKidTab = 'tasks';
    this.currentTaskFilter = 'all';
    this.currentParentTab = 'kids';
    this.currentParentKidFilter = 'all';
    this.inviteAvatarChoice = '🦁';
    this.pinBuffer = '';
    this.activeTimerInterval = null;
    this.activeTimerCoupon = null;
    this.midnightTimeout = null;
    this.midnightInterval = null;

    this.state = this.loadState();
    this.initAudio();
    this.startMidnightWatcher();
  }

  // ------------------------------------------------------------------------
  // МОСКОВСКОЕ ВРЕМЯ (МСК, UTC+3) И СБРОС В 00:00
  // ------------------------------------------------------------------------
  getMoscowParts(date = new Date()) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Moscow',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      });
      const parts = formatter.formatToParts(date);
      const map = {};
      parts.forEach(p => { map[p.type] = p.value; });
      return {
        year: parseInt(map.year, 10),
        month: parseInt(map.month, 10),
        day: parseInt(map.day, 10),
        hour: parseInt(map.hour, 10) === 24 ? 0 : parseInt(map.hour, 10),
        minute: parseInt(map.minute, 10),
        second: parseInt(map.second, 10)
      };
    } catch (e) {
      // Резерв: UTC + 3 часа (МСК)
      const msk = new Date(date.getTime() + (3 * 60 + date.getTimezoneOffset()) * 60000);
      return {
        year: msk.getUTCFullYear(),
        month: msk.getUTCMonth() + 1,
        day: msk.getUTCDate(),
        hour: msk.getUTCHours(),
        minute: msk.getUTCMinutes(),
        second: msk.getUTCSeconds()
      };
    }
  }

  getMoscowDateString(date = new Date()) {
    const p = this.getMoscowParts(date);
    return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
  }

  getMoscowTimeString(date = new Date()) {
    const p = this.getMoscowParts(date);
    return `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
  }

  getMsUntilNextMoscowMidnight() {
    const now = new Date();
    const p = this.getMoscowParts(now);
    const remainingSecs = (23 - p.hour) * 3600 + (59 - p.minute) * 60 + (59 - p.second);
    const remainingMs = 1000 - now.getMilliseconds();
    return Math.max(500, remainingSecs * 1000 + remainingMs);
  }

  updateMidnightCountdown() {
    const el = document.getElementById('nextResetTimer');
    if (!el) return;
    const ms = this.getMsUntilNextMoscowMidnight();
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    el.textContent = `до сброса: ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  startMidnightWatcher() {
    // 1. Точный таймер до 00:00:00 МСК
    const scheduleNext = () => {
      if (this.midnightTimeout) clearTimeout(this.midnightTimeout);
      const ms = this.getMsUntilNextMoscowMidnight();
      this.midnightTimeout = setTimeout(() => {
        this.checkDayRollover(this.state, true);
        scheduleNext();
      }, ms + 250);
    };
    scheduleNext();

    // 2. Секундный таймер для счетчика и резервной проверки смены суток
    if (this.midnightInterval) clearInterval(this.midnightInterval);
    this.midnightInterval = setInterval(() => {
      this.updateMidnightCountdown();
      const currentMsk = this.getMoscowDateString();
      if (this.state && this.state.kids) {
        const anyExpired = this.state.kids.some(k => k.lastActiveDate !== currentMsk);
        if (anyExpired) {
          this.checkDayRollover(this.state, true);
        }
      }
    }, 1000);

    // 3. Проверка при переключении вкладки / пробуждении устройства
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkDayRollover(this.state, true);
        this.updateMidnightCountdown();
      }
    });

    window.addEventListener('focus', () => {
      this.checkDayRollover(this.state, true);
      this.updateMidnightCountdown();
    });
  }

  // ------------------------------------------------------------------------
  // ИНИЦИАЛИЗАЦИЯ И ХРАНИЛИЩЕ (СИСТЕМА МУЛЬТИ-ПРОФИЛЕЙ И СЕМЬИ)
  // ------------------------------------------------------------------------
  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);

        // Миграция со старого формата (один hero) в многопользовательский (массив kids)
        if (parsed.hero && (!parsed.kids || parsed.kids.length === 0)) {
          const legacyKid = {
            id: 'kid_1',
            name: parsed.hero.name || 'Артём',
            avatar: parsed.hero.avatar || '🦁',
            avatarPhoto: parsed.hero.avatarPhoto || null,
            inviteCode: 'HERO-101',
            level: parsed.hero.level || 1,
            xp: parsed.hero.xp || 0,
            xpNext: parsed.hero.xpNext || 100,
            coins: parsed.hero.coins || 0,
            streak: parsed.hero.streak || 1,
            lastActiveDate: parsed.hero.lastActiveDate || this.getMoscowDateString(),
            totalCoinsEarned: parsed.hero.totalCoinsEarned || parsed.hero.coins || 0,
            tasks: parsed.tasks || JSON.parse(JSON.stringify(DEFAULT_TASKS)),
            coupons: parsed.coupons || [],
            badges: parsed.badges || JSON.parse(JSON.stringify(DEFAULT_BADGES))
          };
          parsed.kids = [legacyKid];
          parsed.activeKidId = 'kid_1';
          parsed.currentRole = 'kid';
          delete parsed.hero;
          delete parsed.tasks;
          delete parsed.coupons;
          delete parsed.badges;
        }

        if (!parsed.kids || parsed.kids.length === 0) {
          return this.getInitialState();
        }

        if (!parsed.activeKidId || !parsed.kids.some(k => k.id === parsed.activeKidId)) {
          parsed.activeKidId = parsed.kids[0].id;
        }

        // Проверяем смену календарного дня по МСК для всех детей
        this.checkDayRollover(parsed);
        return parsed;
      }
    } catch (e) {
      console.warn('Ошибка чтения localStorage, загрузка defaults:', e);
    }
    return this.getInitialState();
  }

  getInitialState() {
    const today = this.getMoscowDateString();
    const kid1 = {
      id: 'kid_1',
      name: 'Артём',
      avatar: '🦁',
      avatarPhoto: null,
      inviteCode: 'HERO-101',
      level: 1,
      xp: 0,
      xpNext: 100,
      coins: 25,
      streak: 1,
      lastActiveDate: today,
      totalCoinsEarned: 25,
      tasks: JSON.parse(JSON.stringify(DEFAULT_TASKS)),
      coupons: [],
      badges: JSON.parse(JSON.stringify(DEFAULT_BADGES))
    };
    const kid2 = {
      id: 'kid_2',
      name: 'Алиса',
      avatar: '🦄',
      avatarPhoto: null,
      inviteCode: 'HERO-202',
      level: 2,
      xp: 45,
      xpNext: 135,
      coins: 60,
      streak: 2,
      lastActiveDate: today,
      totalCoinsEarned: 110,
      tasks: JSON.parse(JSON.stringify(DEFAULT_TASKS)),
      coupons: [],
      badges: JSON.parse(JSON.stringify(DEFAULT_BADGES))
    };

    return {
      currentRole: 'kid',
      activeKidId: 'kid_1',
      parent: {
        name: 'Родители',
        pin: '1234'
      },
      kids: [kid1, kid2],
      rewards: JSON.parse(JSON.stringify(DEFAULT_REWARDS)),
      history: [
        { id: 'h0', time: this.getMoscowTimeString(), text: 'Приключение началось! Семья подключена.', type: 'bonus' }
      ],
      settings: {
        pin: '1234',
        theme: 'hero',
        sound: true
      }
    };
  }

  getActiveKid() {
    if (!this.state || !this.state.kids || this.state.kids.length === 0) {
      return null;
    }
    let kid = this.state.kids.find(k => k.id === this.state.activeKidId);
    if (!kid) {
      kid = this.state.kids[0];
      this.state.activeKidId = kid.id;
    }
    return kid;
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Ошибка сохранения state:', e);
    }
  }

  checkDayRollover(state, isLive = false) {
    if (!state || !state.kids) return false;
    const today = this.getMoscowDateString();
    let anyChanged = false;

    state.kids.forEach(kid => {
      if (kid.lastActiveDate !== today) {
        anyChanged = true;
        const last = kid.lastActiveDate ? new Date(kid.lastActiveDate + 'T00:00:00Z') : new Date(today + 'T00:00:00Z');
        const now = new Date(today + 'T00:00:00Z');
        const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          kid.streak = (kid.streak || 1) + 1;
        } else if (diffDays > 1) {
          kid.streak = 1;
        }
        kid.lastActiveDate = today;

        // Сбрасываем ежедневные квесты для каждого ребёнка
        if (kid.tasks) {
          kid.tasks.forEach(t => {
            t.status = 'pending';
          });
        }
      }
    });

    if (anyChanged) {
      const mskTime = this.getMoscowTimeString();
      state.history.unshift({
        id: 'h_' + Date.now(),
        time: mskTime,
        text: `🌅 00:00 МСК — Наступил новый день! Дневной прогресс всех детей сброшен.`,
        type: 'info'
      });

      if (isLive) {
        this.saveState();
        this.render();
        this.playSound('levelUp');
        this.triggerConfetti();
      }
      return true;
    }
    return false;
  }

  startNewDay(manual = false) {
    if (!this.state || !this.state.kids) return;
    this.state.kids.forEach(kid => {
      if (kid.tasks) {
        kid.tasks.forEach(t => {
          t.status = 'pending';
        });
      }
      if (manual) {
        kid.streak = (kid.streak || 1) + 1;
      }
    });
    if (manual) {
      this.playSound('levelUp');
      this.triggerConfetti();
      this.addHistory(`🌅 Родители перезапустили день вручную для всех детей.`);
    }
    this.saveState();
    this.render();
    if (manual) {
      alert('Новый день начался! Все квесты снова открыты для всех детей.');
    }
  }

  resetAllProgress() {
    if (confirm('Внимание! Это сбросит весь прогресс, монеты и уровень к начальным настройкам. Продолжить?')) {
      localStorage.removeItem(STORAGE_KEY);
      this.state = this.getInitialState();
      this.saveState();
      this.render();
      alert('Весь прогресс успешно сброшен к началу!');
    }
  }

  // ------------------------------------------------------------------------
  // ЗВУКОВОЙ ДВИЖОК (WEB AUDIO API — ТЕМАТИЧЕСКИЙ СИНТЕЗАТОР)
  // ------------------------------------------------------------------------
  initAudio() {
    this.soundEnabled = this.state.settings.sound !== false;
    this.updateSoundBtn();
    
    // Ленивая инициализация AudioContext по первому клику
    const unlockAudio = () => {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.state.settings.sound = this.soundEnabled;
    this.saveState();
    this.updateSoundBtn();
    if (this.soundEnabled) {
      this.playSound('coin');
    }
  }

  updateSoundBtn() {
    const icon = document.getElementById('soundIcon');
    if (icon) {
      icon.textContent = this.soundEnabled ? '🔊' : '🔇';
    }
  }

  playSound(type) {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.audioCtx = new AudioContext();
      }
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const theme = this.state.settings.theme || 'hero';

      if (theme === 'minecraft') {
        this.playMinecraftSound(type, now);
      } else if (theme === 'roblox') {
        this.playRobloxSound(type, now);
      } else if (theme === 'brawl') {
        this.playBrawlSound(type, now);
      } else {
        this.playHeroSound(type, now);
      }
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Звуки для темы Minecraft (8-битные пиксельные квадратные волны)
  playMinecraftSound(type, now) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.type = 'square';

    if (type === 'coin') {
      // Аутентичный звук шарика опыта (XP Orb ding)
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.setValueAtTime(1400, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'click') {
      // Деревянный клик кнопки Minecraft
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.05);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'levelUp') {
      // 8-bit победная мелодия достижения
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const subOsc = this.audioCtx.createOscillator();
        const subGain = this.audioCtx.createGain();
        subOsc.connect(subGain);
        subGain.connect(this.audioCtx.destination);
        subOsc.type = 'square';
        subOsc.frequency.value = freq;
        const noteStart = now + idx * 0.12;
        subGain.gain.setValueAtTime(0.2, noteStart);
        subGain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.25);
        subOsc.start(noteStart);
        subOsc.stop(noteStart + 0.25);
      });
    } else {
      // Покупка / наковальня
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  }

  // Звуки для темы Roblox (аркадный четкий синтезатор)
  playRobloxSound(type, now) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    if (type === 'coin') {
      // Металлический звон монеты
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.12);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(400, now + 0.04);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'levelUp') {
      // Футуристичный подъем уровня
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  // Звуки для темы Brawl Stars (мультяшные, сочные)
  playBrawlSound(type, now) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    if (type === 'coin') {
      // Сочный мультяшный подбор кристалла
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.15);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'levelUp') {
      // Фанфары победы
      [587, 740, 880, 1174].forEach((freq, idx) => {
        const subOsc = this.audioCtx.createOscillator();
        const subGain = this.audioCtx.createGain();
        subOsc.connect(subGain);
        subGain.connect(this.audioCtx.destination);
        subOsc.type = 'triangle';
        subOsc.frequency.value = freq;
        const noteStart = now + idx * 0.1;
        subGain.gain.setValueAtTime(0.25, noteStart);
        subGain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);
        subOsc.start(noteStart);
        subOsc.stop(noteStart + 0.3);
      });
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  // Звуки по умолчанию (Супергерой)
  playHeroSound(type, now) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    if (type === 'coin') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'levelUp') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const subOsc = this.audioCtx.createOscillator();
        const subGain = this.audioCtx.createGain();
        subOsc.connect(subGain);
        subGain.connect(this.audioCtx.destination);
        subOsc.type = 'sine';
        subOsc.frequency.value = freq;
        const noteStart = now + idx * 0.1;
        subGain.gain.setValueAtTime(0.25, noteStart);
        subGain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);
        subOsc.start(noteStart);
        subOsc.stop(noteStart + 0.35);
      });
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  }

  // ------------------------------------------------------------------------
  // САЛЮТ КОНФЕТТИ (CANVAS PARTICLES)
  // ------------------------------------------------------------------------
  triggerConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f59e0b', '#6366f1', '#10b981', '#ec4899', '#06b6d4', '#eab308'];
    const particles = [];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let animationFrame;
    const renderParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // гравитация
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        }
      });

      if (alive) {
        animationFrame = requestAnimationFrame(renderParticles);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    };

    renderParticles();
  }

  // ------------------------------------------------------------------------
  // ТЕМЫ ОФОРМЛЕНИЯ
  // ------------------------------------------------------------------------
  setTheme(theme, isSilent = false) {
    this.currentTheme = theme;
    this.state.settings.theme = theme;
    this.saveState();

    document.body.className = '';
    if (theme && theme !== 'hero') {
      document.body.classList.add(`theme-${theme}`);
    }

    // Синхронизируем селект в настройках родителя
    const select = document.getElementById('parentThemeSelect');
    if (select) select.value = theme;

    // Подсветка карточки в модалке тем
    document.querySelectorAll('.theme-card').forEach(card => {
      if (card.dataset.theme === theme) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    if (!isSilent) {
      this.playSound('click');
      this.closeModal('themeModal');
    }
  }

  openThemeModal() {
    this.openModal('themeModal');
  }

  // ------------------------------------------------------------------------
  // НАВИГАЦИЯ И ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ
  // ------------------------------------------------------------------------
  showKidView() {
    document.getElementById('kidView').classList.add('active');
    document.getElementById('parentView').classList.remove('active');
    this.playSound('click');
  }

  openParentPinModal() {
    this.pinBuffer = '';
    this.updatePinDots();
    document.getElementById('pinErrorMsg').style.display = 'none';
    this.openModal('pinModal');
    this.playSound('click');
  }

  exitParentMode() {
    this.showKidView();
  }

  switchKidTab(tab) {
    this.currentKidTab = tab;
    document.querySelectorAll('.nav-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#kidView .tab-content').forEach(c => c.classList.remove('active'));

    const tabMap = {
      tasks: { btn: 'tabTasksBtn', content: 'kidTasksTab' },
      shop: { btn: 'tabShopBtn', content: 'kidShopTab' },
      coupons: { btn: 'tabActiveCouponsBtn', content: 'kidCouponsTab' },
      badges: { btn: 'tabBadgesBtn', content: 'kidBadgesTab' }
    };

    if (tabMap[tab]) {
      const b = document.getElementById(tabMap[tab].btn);
      const c = document.getElementById(tabMap[tab].content);
      if (b) b.classList.add('active');
      if (c) c.classList.add('active');
    }

    this.playSound('click');
  }

  switchParentTab(tab) {
    this.currentParentTab = tab;
    document.querySelectorAll('.parent-nav-tabs .ptab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#parentView .parent-tab-content').forEach(c => c.classList.remove('active'));

    const tabMap = {
      kids: { btn: 'ptabKidsBtn', content: 'parentKidsTab' },
      queue: { btn: 'ptabQueueBtn', content: 'parentQueueTab' },
      tasks: { btn: 'ptabTasksBtn', content: 'parentTasksTab' },
      rewards: { btn: 'ptabRewardsBtn', content: 'parentRewardsTab' },
      history: { btn: 'ptabHistoryBtn', content: 'parentHistoryTab' },
      settings: { btn: 'ptabSettingsBtn', content: 'parentSettingsTab' }
    };

    if (tabMap[tab]) {
      const b = document.getElementById(tabMap[tab].btn);
      const c = document.getElementById(tabMap[tab].content);
      if (b) b.classList.add('active');
      if (c) c.classList.add('active');
    }

    this.playSound('click');
  }

  filterTasks(cat, btn = null) {
    this.currentTaskFilter = cat;
    document.querySelectorAll('#categoryChips .chip').forEach(ch => {
      if (btn) {
        ch.classList.toggle('active', ch === btn);
      } else {
        ch.classList.toggle('active', ch.getAttribute('data-category') === cat);
      }
    });
    this.renderTasks();
    this.playSound('click');
  }

  // ------------------------------------------------------------------------
  // РОДИТЕЛЬСКИЙ ПИН-КОД И НУМПАД
  // ------------------------------------------------------------------------
  numpadPress(digit) {
    if (this.pinBuffer.length < 4) {
      this.pinBuffer += digit;
      this.playSound('click');
      this.updatePinDots();
      if (this.pinBuffer.length === 4) {
        setTimeout(() => this.validatePin(), 120);
      }
    }
  }

  numpadClear() {
    this.pinBuffer = '';
    this.updatePinDots();
    this.playSound('click');
  }

  numpadBackspace() {
    this.pinBuffer = this.pinBuffer.slice(0, -1);
    this.updatePinDots();
    this.playSound('click');
  }

  updatePinDots() {
    for (let i = 1; i <= 4; i++) {
      const dot = document.getElementById(`pdot${i}`);
      if (dot) {
        dot.classList.toggle('filled', i <= this.pinBuffer.length);
      }
    }
  }

  validatePin() {
    const parentPin = (this.state.parent && this.state.parent.pin) || this.state.settings.pin || '1234';
    if (this.pinBuffer === parentPin) {
      this.closeModal('pinModal');
      this.closeModal('loginModal');
      this.state.currentRole = 'parent';
      document.getElementById('kidView').classList.remove('active');
      document.getElementById('parentView').classList.add('active');
      this.playSound('levelUp');
      this.renderParentView();
    } else {
      const err = document.getElementById('pinErrorMsg');
      if (err) err.style.display = 'block';
      this.playSound('click');
      this.pinBuffer = '';
      this.updatePinDots();
    }
  }

  exitParentMode() {
    this.state.currentRole = 'kid';
    this.showKidView();
  }

  saveNewPin() {
    const input = document.getElementById('newPinInput');
    if (!input) return;
    const val = input.value.trim();
    if (/^\d{4}$/.test(val)) {
      this.state.settings.pin = val;
      if (this.state.parent) this.state.parent.pin = val;
      this.saveState();
      input.value = '';
      alert('Новый 4-значный ПИН успешно сохранен!');
      this.addHistory(`🔐 Родитель изменил защитный PIN-код`);
    } else {
      alert('ПИН-код должен состоять ровно из 4 цифр!');
    }
  }

  // ------------------------------------------------------------------------
  // ЛОГИКА ВЫПОЛНЕНИЯ КВЕСТОВ (TASKS)
  // ------------------------------------------------------------------------
  completeTask(taskId) {
    const kid = this.getActiveKid();
    if (!kid || !kid.tasks) return;
    const task = kid.tasks.find(t => t.id === taskId);
    if (!task || task.status === 'done' || task.status === 'review') return;

    if (task.requiresApproval) {
      task.status = 'review';
      this.playSound('click');
      this.addHistory(`⏳ ${kid.name}: Квест «${task.title}» отправлен на проверку родителям`);
    } else {
      task.status = 'done';
      this.awardReward(task.coins, task.xp, `${kid.name}: выполнен квест «${task.title}»`, kid);
      this.checkBadgesAfterTask(task, kid);
    }

    this.saveState();
    this.render();
  }

  awardReward(coins, xp, reason, targetKid = null) {
    const kid = targetKid || this.getActiveKid();
    if (!kid) return;
    kid.coins += coins;
    kid.totalCoinsEarned += coins;
    this.addXp(xp, kid);
    this.playSound('coin');
    this.triggerConfetti();
    this.addHistory(`⭐ ${reason} (+${coins} 🪙, +${xp} XP)`);
  }

  addXp(amount, targetKid = null) {
    const kid = targetKid || this.getActiveKid();
    if (!kid) return;
    kid.xp += amount;
    while (kid.xp >= kid.xpNext) {
      kid.xp -= kid.xpNext;
      kid.level += 1;
      kid.xpNext = Math.round(kid.xpNext * 1.35);
      
      // Бонус за уровень: +50 монет
      const bonusCoins = 50;
      kid.coins += bonusCoins;
      kid.totalCoinsEarned += bonusCoins;

      if (kid.id === this.state.activeKidId) {
        this.triggerLevelUpModal(kid);
      }
    }
  }

  triggerLevelUpModal(targetKid = null) {
    const kid = targetKid || this.getActiveKid();
    if (!kid) return;
    const level = kid.level;
    const titleIndex = Math.min(level - 1, LEVEL_TITLES.length - 1);
    const title = LEVEL_TITLES[titleIndex];

    const numEl = document.getElementById('levelUpNumber');
    const textEl = document.getElementById('levelUpTitleText');
    if (numEl) numEl.textContent = `УРОВЕНЬ ${level}`;
    if (textEl) textEl.textContent = `${kid.name} — ${title}`;

    this.openModal('levelUpModal');
    this.playSound('levelUp');
    this.triggerConfetti();
    this.addHistory(`🎉 ПОВЫШЕНИЕ УРОВНЯ! ${kid.name} достиг ${level} уровня («${title}»)! Бонус +50 🪙`);
  }

  // Одобрение квестов родителями
  approveTask(taskId, kidId = null) {
    let targetKid = kidId ? this.state.kids.find(k => k.id === kidId) : null;
    if (!targetKid) {
      targetKid = this.state.kids.find(k => k.tasks && k.tasks.some(t => t.id === taskId && t.status === 'review'));
    }
    if (!targetKid) return;
    const task = targetKid.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.status = 'done';
    this.awardReward(task.coins, task.xp, `Родители одобрили: «${task.title}» для ${targetKid.name}`, targetKid);
    this.checkBadgesAfterTask(task, targetKid);
    this.saveState();
    this.render();
  }

  rejectTask(taskId, kidId = null) {
    let targetKid = kidId ? this.state.kids.find(k => k.id === kidId) : null;
    if (!targetKid) {
      targetKid = this.state.kids.find(k => k.tasks && k.tasks.some(t => t.id === taskId && t.status === 'review'));
    }
    if (!targetKid) return;
    const task = targetKid.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.status = 'pending';
    this.addHistory(`❌ Родители вернули квест «${task.title}» для ${targetKid.name} на доработку`);
    this.saveState();
    this.render();
  }

  approveAllPendingTasks() {
    let count = 0;
    this.state.kids.forEach(kid => {
      if (!kid.tasks) return;
      kid.tasks.filter(t => t.status === 'review').forEach(t => {
        t.status = 'done';
        kid.coins += t.coins;
        kid.totalCoinsEarned += t.coins;
        this.addXp(t.xp, kid);
        count++;
      });
    });

    if (count > 0) {
      this.playSound('levelUp');
      this.triggerConfetti();
      this.addHistory(`⭐ Родители одобрили все квесты (${count} шт.)`);
      this.saveState();
      this.render();
      alert(`Одобрено заданий: ${count}! Награды начислены юным героям.`);
    }
  }

  // ------------------------------------------------------------------------
  // МАГАЗИН И КУПОНЫ НАГРАД (SHOP & REWARDS)
  // ------------------------------------------------------------------------
  buyReward(rewardId) {
    const kid = this.getActiveKid();
    if (!kid) return;
    const reward = this.state.rewards.find(r => r.id === rewardId);
    if (!reward) return;

    if (kid.coins < reward.cost) {
      alert('Недостаточно монет! Выполняй квесты, чтобы накопить больше 🪙');
      return;
    }

    kid.coins -= reward.cost;
    const coupon = {
      id: 'c_' + Date.now(),
      kidId: kid.id,
      kidName: kid.name,
      rewardId: reward.id,
      title: reward.title,
      icon: reward.icon,
      type: reward.type,
      cost: reward.cost,
      duration: reward.duration || 0,
      secondsLeft: (reward.duration || 0) * 60,
      timerRunning: false,
      status: 'active',
      createdAt: this.getMoscowTimeString()
    };

    if (!kid.coupons) kid.coupons = [];
    kid.coupons.unshift(coupon);

    this.playSound('coin');
    this.triggerConfetti();
    this.addHistory(`🎁 ${kid.name}: куплена награда «${reward.title}» (-${reward.cost} 🪙)`);
    this.saveState();
    this.render();

    this.switchKidTab('coupons');
  }

  useCoupon(couponId) {
    const kid = this.getActiveKid();
    if (!kid || !kid.coupons) return;
    const coupon = kid.coupons.find(c => c.id === couponId);
    if (!coupon) return;

    if (coupon.type === 'screen_time') {
      this.openTimerModal(coupon);
    } else if (coupon.type === 'money') {
      alert(`Покажи этот купон родителям! Они выдадут тебе ${coupon.title}.`);
    } else {
      if (confirm(`Использовать награду «${coupon.title}» сейчас?`)) {
        coupon.status = 'used';
        this.addHistory(`🎉 ${kid.name} использовал награду «${coupon.title}»`);
        this.saveState();
        this.render();
      }
    }
  }

  confirmCouponPaid(couponId, kidId = null) {
    let targetKid = kidId ? this.state.kids.find(k => k.id === kidId) : null;
    if (!targetKid) {
      targetKid = this.state.kids.find(k => k.coupons && k.coupons.some(c => c.id === couponId));
    }
    if (!targetKid || !targetKid.coupons) return;
    const coupon = targetKid.coupons.find(c => c.id === couponId);
    if (!coupon) return;

    coupon.status = 'paid';
    this.addHistory(`💵 Родители подтвердили выдачу по купону «${coupon.title}» для ${targetKid.name}`);
    this.saveState();
    this.render();
  }

  // ------------------------------------------------------------------------
  // ТАЙМЕР ЭКРАННОГО ВРЕМЕНИ
  // ------------------------------------------------------------------------
  openTimerModal(coupon) {
    this.activeTimerCoupon = coupon;
    const titleEl = document.getElementById('timerModalTitle');
    const descEl = document.getElementById('timerModalDesc');
    if (titleEl) titleEl.textContent = `${coupon.title} ⏱️`;
    if (descEl) descEl.textContent = `Экранное время: ${coupon.duration} мин. Покажи этот таймер родителям!`;

    this.updateTimerDisplay();
    this.openModal('timerModal');
    this.playSound('click');

    if (!coupon.timerRunning && coupon.secondsLeft > 0) {
      this.startTimer(coupon);
    }
  }

  startTimer(coupon) {
    coupon.timerRunning = true;
    if (this.activeTimerInterval) clearInterval(this.activeTimerInterval);

    this.activeTimerInterval = setInterval(() => {
      if (coupon.secondsLeft > 0) {
        coupon.secondsLeft -= 1;
        this.updateTimerDisplay();
        this.saveState();
      } else {
        clearInterval(this.activeTimerInterval);
        coupon.timerRunning = false;
        coupon.status = 'used';
        this.saveState();
        this.render();
        this.playSound('levelUp');
        alert('⏱️ Время вышло! Пора отдохнуть от экрана и вернуться к супер-делам!');
      }
    }, 1000);

    const pauseBtn = document.getElementById('timerPauseBtn');
    if (pauseBtn) pauseBtn.textContent = 'Пауза ⏸️';
  }

  toggleActiveTimer() {
    if (!this.activeTimerCoupon) return;
    const coupon = this.activeTimerCoupon;
    if (coupon.timerRunning) {
      clearInterval(this.activeTimerInterval);
      coupon.timerRunning = false;
      const pauseBtn = document.getElementById('timerPauseBtn');
      if (pauseBtn) pauseBtn.textContent = 'Продолжить ▶️';
      this.playSound('click');
    } else {
      this.startTimer(coupon);
      this.playSound('click');
    }
    this.saveState();
  }

  updateTimerDisplay() {
    const disp = document.getElementById('countdownTimerDisplay');
    if (!disp || !this.activeTimerCoupon) return;
    const s = this.activeTimerCoupon.secondsLeft;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    disp.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // ------------------------------------------------------------------------
  // ДОСТИЖЕНИЯ (BADGES)
  // ------------------------------------------------------------------------
  checkBadgesAfterTask(task, targetKid = null) {
    const kid = targetKid || this.getActiveKid();
    if (!kid || !kid.badges) return;
    const badges = kid.badges;

    const bFirst = badges.find(b => b.id === 'b_first');
    if (bFirst && !bFirst.unlocked) this.unlockBadge(bFirst, kid);

    const bStreak3 = badges.find(b => b.id === 'b_streak3');
    if (bStreak3 && !bStreak3.unlocked && kid.streak >= 3) this.unlockBadge(bStreak3, kid);

    const bStreak7 = badges.find(b => b.id === 'b_streak7');
    if (bStreak7 && !bStreak7.unlocked && kid.streak >= 7) this.unlockBadge(bStreak7, kid);

    const bStudy = badges.find(b => b.id === 'b_study');
    if (bStudy && !bStudy.unlocked && task.category === 'study') {
      bStudy.count = (bStudy.count || 0) + 1;
      if (bStudy.count >= bStudy.target) this.unlockBadge(bStudy, kid);
    }

    const bChores = badges.find(b => b.id === 'b_chores');
    if (bChores && !bChores.unlocked && task.category === 'chores') {
      bChores.count = (bChores.count || 0) + 1;
      if (bChores.count >= bChores.target) this.unlockBadge(bChores, kid);
    }

    const bCoins = badges.find(b => b.id === 'b_coins100');
    if (bCoins && !bCoins.unlocked && kid.totalCoinsEarned >= 100) this.unlockBadge(bCoins, kid);

    const bLvl5 = badges.find(b => b.id === 'b_level5');
    if (bLvl5 && !bLvl5.unlocked && kid.level >= 5) this.unlockBadge(bLvl5, kid);
  }

  unlockBadge(badge, kid) {
    badge.unlocked = true;
    this.playSound('levelUp');
    this.triggerConfetti();
    this.addHistory(`🏆 ${kid.name}: новое достижение открыто: «${badge.title}»!`);
  }

  // ------------------------------------------------------------------------
  // РЕДАКТОРЫ ЗАДАНИЙ И НАГРАД (PARENT EDITORS)
  // ------------------------------------------------------------------------
  openTaskEditorModal(taskId = null) {
    const modal = document.getElementById('taskEditorModal');
    const titleEl = document.getElementById('taskEditorModalTitle');
    const idInput = document.getElementById('editTaskId');
    const targetSelect = document.getElementById('taskTargetKidSelect');
    const titleInput = document.getElementById('taskTitleInput');
    const iconInput = document.getElementById('taskIconInput');
    const catSelect = document.getElementById('taskCategorySelect');
    const coinsInput = document.getElementById('taskCoinsInput');
    const xpInput = document.getElementById('taskXpInput');
    const checkInput = document.getElementById('taskRequiresApprovalCheck');

    if (targetSelect && this.state.kids) {
      targetSelect.innerHTML = `
        <option value="all">👨‍👩‍👧 Для всех детей в семье</option>
        ${this.state.kids.map(k => `
          <option value="${k.id}" ${k.id === this.state.activeKidId ? 'selected' : ''}>${k.avatar} Только для ${k.name}</option>
        `).join('')}
      `;
    }

    if (taskId) {
      let foundTask = null;
      for (const k of this.state.kids) {
        foundTask = (k.tasks || []).find(t => t.id === taskId);
        if (foundTask) break;
      }
      if (!foundTask) return;
      titleEl.textContent = 'Редактировать задание';
      idInput.value = foundTask.id;
      titleInput.value = foundTask.title;
      iconInput.value = foundTask.icon;
      catSelect.value = foundTask.category;
      coinsInput.value = foundTask.coins;
      xpInput.value = foundTask.xp;
      checkInput.checked = foundTask.requiresApproval;
    } else {
      titleEl.textContent = 'Добавить новое задание';
      idInput.value = '';
      titleInput.value = '';
      iconInput.value = '⭐';
      catSelect.value = 'morning';
      coinsInput.value = '15';
      xpInput.value = '20';
      checkInput.checked = true;
    }

    this.openModal('taskEditorModal');
    this.playSound('click');
  }

  saveTaskFromEditor() {
    const idInput = document.getElementById('editTaskId').value;
    const target = document.getElementById('taskTargetKidSelect') ? document.getElementById('taskTargetKidSelect').value : 'all';
    const title = document.getElementById('taskTitleInput').value.trim();
    const icon = document.getElementById('taskIconInput').value.trim() || '⭐';
    const category = document.getElementById('taskCategorySelect').value;
    const coins = parseInt(document.getElementById('taskCoinsInput').value, 10) || 10;
    const xp = parseInt(document.getElementById('taskXpInput').value, 10) || 15;
    const requiresApproval = document.getElementById('taskRequiresApprovalCheck').checked;

    if (!title) {
      alert('Пожалуйста, укажите название задания!');
      return;
    }

    if (idInput) {
      this.state.kids.forEach(kid => {
        const task = (kid.tasks || []).find(t => t.id === idInput);
        if (task) {
          task.title = title;
          task.icon = icon;
          task.category = category;
          task.coins = coins;
          task.xp = xp;
          task.requiresApproval = requiresApproval;
        }
      });
      this.addHistory(`✏️ Родители обновили задание: «${title}»`);
    } else {
      const taskId = 't_' + Date.now();
      const newTask = {
        id: taskId,
        title,
        icon,
        category,
        coins,
        xp,
        requiresApproval,
        status: 'pending'
      };

      if (target === 'all') {
        this.state.kids.forEach(kid => {
          if (!kid.tasks) kid.tasks = [];
          kid.tasks.push(JSON.parse(JSON.stringify(newTask)));
        });
        this.addHistory(`➕ Родители добавили задание для всех детей: «${title}»`);
      } else {
        const kid = this.state.kids.find(k => k.id === target);
        if (kid) {
          if (!kid.tasks) kid.tasks = [];
          kid.tasks.push(newTask);
          this.addHistory(`➕ Родители добавили задание для ${kid.name}: «${title}»`);
        }
      }
    }

    this.saveState();
    this.closeModal('taskEditorModal');
    this.render();
  }

  deleteTask(taskId) {
    if (confirm(`Удалить это задание?`)) {
      this.state.kids.forEach(kid => {
        if (kid.tasks) {
          kid.tasks = kid.tasks.filter(t => t.id !== taskId);
        }
      });
      this.addHistory(`🗑️ Родители удалили задание`);
      this.saveState();
      this.render();
    }
  }

  openRewardEditorModal(rewardId = null) {
    const titleEl = document.getElementById('rewardEditorModalTitle');
    const idInput = document.getElementById('editRewardId');
    const titleInput = document.getElementById('rewardTitleInput');
    const iconInput = document.getElementById('rewardIconInput');
    const typeSelect = document.getElementById('rewardTypeSelect');
    const costInput = document.getElementById('rewardCostInput');
    const durInput = document.getElementById('rewardDurationInput');

    if (rewardId) {
      const reward = this.state.rewards.find(r => r.id === rewardId);
      if (!reward) return;
      titleEl.textContent = 'Редактировать награду';
      idInput.value = reward.id;
      titleInput.value = reward.title;
      iconInput.value = reward.icon;
      typeSelect.value = reward.type;
      costInput.value = reward.cost;
      durInput.value = reward.duration || 30;
    } else {
      titleEl.textContent = 'Добавить награду';
      idInput.value = '';
      titleInput.value = '';
      iconInput.value = '🎁';
      typeSelect.value = 'screen_time';
      costInput.value = '30';
      durInput.value = '30';
    }

    this.onRewardTypeChange();
    this.openModal('rewardEditorModal');
    this.playSound('click');
  }

  onRewardTypeChange() {
    const type = document.getElementById('rewardTypeSelect').value;
    const durGroup = document.getElementById('rewardDurationGroup');
    if (durGroup) {
      durGroup.style.display = (type === 'screen_time') ? 'block' : 'none';
    }
  }

  saveRewardFromEditor() {
    const idInput = document.getElementById('editRewardId').value;
    const title = document.getElementById('rewardTitleInput').value.trim();
    const icon = document.getElementById('rewardIconInput').value.trim() || '🎁';
    const type = document.getElementById('rewardTypeSelect').value;
    const cost = parseInt(document.getElementById('rewardCostInput').value, 10) || 20;
    const duration = parseInt(document.getElementById('rewardDurationInput').value, 10) || 30;

    if (!title) {
      alert('Пожалуйста, введите название награды!');
      return;
    }

    if (idInput) {
      const reward = this.state.rewards.find(r => r.id === idInput);
      if (reward) {
        reward.title = title;
        reward.icon = icon;
        reward.type = type;
        reward.cost = cost;
        reward.duration = duration;
        this.addHistory(`✏️ Родители обновили награду: «${title}»`);
      }
    } else {
      const newReward = {
        id: 'r_' + Date.now(),
        title,
        icon,
        type,
        cost,
        duration: type === 'screen_time' ? duration : 0
      };
      this.state.rewards.push(newReward);
      this.addHistory(`➕ Родители добавили награду: «${title}»`);
    }

    this.saveState();
    this.closeModal('rewardEditorModal');
    this.render();
  }

  deleteReward(rewardId) {
    const reward = this.state.rewards.find(r => r.id === rewardId);
    if (!reward) return;
    if (confirm(`Удалить награду «${reward.title}» из магазина?`)) {
      this.state.rewards = this.state.rewards.filter(r => r.id !== rewardId);
      this.addHistory(`🗑️ Удалена награда «${reward.title}»`);
      this.saveState();
      this.render();
    }
  }

  // Изменение баланса родителями
  openAdjustBalanceModal(presetKidId = null) {
    const sel = document.getElementById('adjustKidSelect');
    if (sel && this.state.kids) {
      const targetId = presetKidId || (this.currentParentKidFilter !== 'all' ? this.currentParentKidFilter : this.state.activeKidId);
      sel.innerHTML = this.state.kids.map(k => `
        <option value="${k.id}" ${k.id === targetId ? 'selected' : ''}>
          ${k.avatar} ${k.name} (баланс: ${k.coins} 🪙)
        </option>
      `).join('');
    }
    this.openModal('adjustBalanceModal');
    this.playSound('click');
  }

  applyBalanceAdjustment() {
    const sel = document.getElementById('adjustKidSelect');
    const kidId = sel ? sel.value : this.state.activeKidId;
    const kid = this.state.kids.find(k => k.id === kidId) || this.getActiveKid();
    if (!kid) return;

    const type = document.getElementById('adjustTypeSelect').value;
    const amount = parseInt(document.getElementById('adjustAmountInput').value, 10) || 0;
    const reason = document.getElementById('adjustReasonInput').value.trim() || 'Корректировка баланса';

    if (amount <= 0) {
      alert('Количество монет должно быть больше нуля!');
      return;
    }

    if (type === 'add') {
      kid.coins += amount;
      kid.totalCoinsEarned += amount;
      this.addHistory(`➕ Родитель начислил бонус для ${kid.name}: +${amount} 🪙 (${reason})`);
      this.playSound('coin');
    } else {
      kid.coins = Math.max(0, kid.coins - amount);
      this.addHistory(`➖ Родитель списал монеты у ${kid.name}: -${amount} 🪙 (${reason})`);
      this.playSound('click');
    }

    this.saveState();
    this.closeModal('adjustBalanceModal');
    this.render();
  }

  // ------------------------------------------------------------------------
  // АВАТАРЫ, ФОТО И ИМЯ РЕБЕНКА
  // ------------------------------------------------------------------------
  openAvatarModal() {
    const kid = this.getActiveKid();
    if (!kid) return;

    const grid = document.getElementById('avatarSelectGrid');
    if (grid) {
      const currentAvatar = kid.avatar;
      grid.innerHTML = AVATARS.map(emoji => `
        <button class="avatar-opt ${!kid.avatarPhoto && emoji === currentAvatar ? 'active' : ''}" onclick="app.selectAvatar('${emoji}')">
          ${emoji}
        </button>
      `).join('');
    }

    const preview = document.getElementById('avatarPhotoPreview');
    const removeBtn = document.getElementById('removePhotoBtn');
    if (preview) {
      if (kid.avatarPhoto) {
        preview.innerHTML = `<img src="${kid.avatarPhoto}" alt="Моё фото">`;
        if (removeBtn) removeBtn.style.display = 'inline-flex';
      } else {
        preview.innerHTML = `<span class="photo-placeholder-icon">📷</span>`;
        if (removeBtn) removeBtn.style.display = 'none';
      }
    }

    this.openModal('avatarModal');
    this.playSound('click');
  }

  selectAvatar(emoji) {
    const kid = this.getActiveKid();
    if (!kid) return;
    kid.avatar = emoji;
    kid.avatarPhoto = null;
    this.saveState();
    this.closeModal('avatarModal');
    this.playSound('coin');
    this.render();
  }

  handleAvatarPhotoUpload(event) {
    const kid = this.getActiveKid();
    if (!kid) return;
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выбери файл с изображением (JPG, PNG и т.д.)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Фото слишком большое! Максимальный размер — 2 МБ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        kid.avatarPhoto = dataUrl;
        this.saveState();
        this.render();

        const preview = document.getElementById('avatarPhotoPreview');
        const removeBtn = document.getElementById('removePhotoBtn');
        if (preview) preview.innerHTML = `<img src="${dataUrl}" alt="Моё фото">`;
        if (removeBtn) removeBtn.style.display = 'inline-flex';

        document.querySelectorAll('.avatar-opt').forEach(opt => opt.classList.remove('active'));

        this.playSound('coin');
        this.triggerConfetti();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  removeAvatarPhoto() {
    const kid = this.getActiveKid();
    if (!kid) return;
    kid.avatarPhoto = null;
    this.saveState();
    this.render();

    const preview = document.getElementById('avatarPhotoPreview');
    const removeBtn = document.getElementById('removePhotoBtn');
    if (preview) preview.innerHTML = `<span class="photo-placeholder-icon">📷</span>`;
    if (removeBtn) removeBtn.style.display = 'none';

    document.querySelectorAll('.avatar-opt').forEach(opt => {
      opt.classList.toggle('active', opt.textContent.trim() === kid.avatar);
    });

    this.playSound('click');
  }

  saveHeroName() {
    const kid = this.getActiveKid();
    if (!kid) return;
    const input = document.getElementById('settingHeroName');
    if (!input) return;
    const name = input.value.trim();
    if (name) {
      kid.name = name;
      this.saveState();
      this.render();
      alert(`Имя героя сохранено: ${name}!`);
    }
  }

  // ------------------------------------------------------------------------
  // СИСТЕМА ВХОДА, СЕМЬИ И ИНВАЙТОВ
  // ------------------------------------------------------------------------
  openLoginModal() {
    this.renderLoginModalKids();
    this.openModal('loginModal');
    this.playSound('click');
  }

  renderLoginModalKids() {
    const grid = document.getElementById('loginKidsGrid');
    if (!grid || !this.state.kids) return;

    grid.innerHTML = this.state.kids.map(kid => {
      const isActive = kid.id === this.state.activeKidId && this.state.currentRole !== 'parent';
      const avatarHtml = kid.avatarPhoto
        ? `<img src="${kid.avatarPhoto}" alt="${kid.name}">`
        : kid.avatar;

      return `
        <div class="user-select-card ${isActive ? 'user-card-active' : ''}" onclick="app.loginAsKid('${kid.id}')">
          <div class="user-card-avatar">${avatarHtml}</div>
          <div class="user-card-info">
            <h4>${kid.name}</h4>
            <span class="user-card-sub">Уровень ${kid.level} · <strong>${kid.coins} 🪙</strong></span>
          </div>
          ${isActive ? '<span class="kid-active-badge">Сейчас</span>' : '<span class="role-arrow">➔</span>'}
        </div>
      `;
    }).join('');
  }

  loginAsKid(kidId) {
    const kid = this.state.kids.find(k => k.id === kidId);
    if (!kid) return;

    this.state.activeKidId = kidId;
    this.state.currentRole = 'kid';
    this.saveState();

    this.closeModal('loginModal');
    this.showKidView();
    this.playSound('coin');
    this.render();
  }

  loginAsParent() {
    this.closeModal('loginModal');
    this.openParentPinModal();
  }

  openInviteKidModal(kidId = null) {
    const titleEl = document.getElementById('inviteKidModalTitle');
    const idInput = document.getElementById('editKidId');
    const nameInput = document.getElementById('inviteKidNameInput');
    const coinsInput = document.getElementById('inviteKidCoinsInput');
    const codeInput = document.getElementById('inviteKidCodeInput');

    if (kidId) {
      const kid = this.state.kids.find(k => k.id === kidId);
      if (!kid) return;
      if (titleEl) titleEl.textContent = `Редактировать профиль: ${kid.name}`;
      if (idInput) idInput.value = kid.id;
      if (nameInput) nameInput.value = kid.name;
      if (coinsInput) coinsInput.value = kid.coins;
      if (codeInput) codeInput.value = kid.inviteCode || ('HERO-' + Math.floor(1000 + Math.random() * 9000));
      this.inviteAvatarChoice = kid.avatar || '🦁';
    } else {
      if (titleEl) titleEl.textContent = 'Пригласить ребёнка в семью 👨‍👩‍👧';
      if (idInput) idInput.value = '';
      if (nameInput) nameInput.value = '';
      if (coinsInput) coinsInput.value = '25';
      const randomCode = 'HERO-' + Math.floor(1000 + Math.random() * 9000);
      if (codeInput) codeInput.value = randomCode;
      this.inviteAvatarChoice = '🦁';
    }

    this.renderInviteAvatarSelect();
    this.openModal('inviteKidModal');
    this.playSound('click');
  }

  renderInviteAvatarSelect() {
    const container = document.getElementById('inviteAvatarSelect');
    if (!container) return;
    const popularEmojis = ['🦁', '🦄', '🚀', '🦸‍♂️', '🦸‍♀️', '🥷', '🤖', '🦊', '🦖', '👑'];
    container.innerHTML = popularEmojis.map(emoji => `
      <button type="button" class="avatar-quick-opt ${emoji === this.inviteAvatarChoice ? 'active' : ''}" onclick="app.selectInviteAvatar('${emoji}')">
        ${emoji}
      </button>
    `).join('');
  }

  selectInviteAvatar(emoji) {
    this.inviteAvatarChoice = emoji;
    this.renderInviteAvatarSelect();
    this.playSound('click');
  }

  saveKidProfile() {
    const id = document.getElementById('editKidId').value;
    const name = document.getElementById('inviteKidNameInput').value.trim();
    const coins = parseInt(document.getElementById('inviteKidCoinsInput').value, 10) || 0;
    const code = document.getElementById('inviteKidCodeInput').value.trim() || ('HERO-' + Math.floor(1000 + Math.random() * 9000));

    if (!name) {
      alert('Пожалуйста, введите имя ребёнка!');
      return;
    }

    if (id) {
      const kid = this.state.kids.find(k => k.id === id);
      if (kid) {
        kid.name = name;
        kid.avatar = this.inviteAvatarChoice;
        kid.inviteCode = code;
        this.addHistory(`✏️ Родители обновили профиль ребёнка: ${name}`);
      }
    } else {
      const newKid = {
        id: 'kid_' + Date.now(),
        name,
        avatar: this.inviteAvatarChoice,
        avatarPhoto: null,
        inviteCode: code,
        level: 1,
        xp: 0,
        xpNext: 100,
        coins,
        streak: 1,
        lastActiveDate: this.getMoscowDateString(),
        totalCoinsEarned: coins,
        tasks: JSON.parse(JSON.stringify(DEFAULT_TASKS)),
        coupons: [],
        badges: JSON.parse(JSON.stringify(DEFAULT_BADGES))
      };
      this.state.kids.push(newKid);
      this.addHistory(`🎉 В семью добавлен новый герой: ${name}! Инвайт-код: ${code}`);
      this.playSound('levelUp');
      this.triggerConfetti();
    }

    this.saveState();
    this.closeModal('inviteKidModal');
    this.render();
  }

  deleteKid(kidId) {
    if (this.state.kids.length <= 1) {
      alert('В семье должен оставаться хотя бы один ребёнок!');
      return;
    }
    const kid = this.state.kids.find(k => k.id === kidId);
    if (!kid) return;

    if (confirm(`Вы уверены, что хотите удалить профиль «${kid.name}» и все его квесты?`)) {
      this.state.kids = this.state.kids.filter(k => k.id !== kidId);
      if (this.state.activeKidId === kidId) {
        this.state.activeKidId = this.state.kids[0].id;
      }
      this.addHistory(`🗑️ Удалён профиль ребёнка: ${kid.name}`);
      this.saveState();
      this.render();
    }
  }

  copyGeneratedInviteLink() {
    const code = document.getElementById('inviteKidCodeInput').value;
    const link = window.location.origin + window.location.pathname + '#invite=' + code;
    navigator.clipboard.writeText(link).then(() => {
      alert(`Ссылка для приглашения скопирована в буфер обмена!\n\n${link}\n\nРебёнок может открыть её в браузере своего планшета или смартфона.`);
    }).catch(() => {
      prompt('Скопируйте ссылку для ребёнка:', link);
    });
  }

  copyInviteCode(kidId) {
    const kid = this.state.kids.find(k => k.id === kidId);
    if (!kid) return;
    const text = kid.inviteCode || 'HERO-101';
    navigator.clipboard.writeText(text).then(() => {
      alert(`Инвайт-код скопирован: ${text}\n\nДайте его ребёнку для входа с его устройства!`);
    }).catch(() => {
      prompt('Инвайт-код ребёнка:', text);
    });
  }

  openEnterInviteModal() {
    this.closeModal('loginModal');
    const input = document.getElementById('inputInviteCode');
    if (input) input.value = '';
    this.openModal('enterInviteCodeModal');
    this.playSound('click');
  }

  submitInviteCode() {
    const input = document.getElementById('inputInviteCode');
    if (!input) return;
    const code = input.value.trim().toUpperCase();

    if (!code) {
      alert('Пожалуйста, введите инвайт-код!');
      return;
    }

    const kid = this.state.kids.find(k => (k.inviteCode || '').toUpperCase() === code);
    if (kid) {
      this.loginAsKid(kid.id);
      this.closeModal('enterInviteCodeModal');
      this.playSound('levelUp');
      this.triggerConfetti();
      alert(`Добро пожаловать, ${kid.name}! Ты вошёл как юный супергерой! 🚀`);
    } else {
      alert(`Код «${code}» не найден. Пожалуйста, уточните код у родителей.`);
    }
  }

  setParentKidFilter(kidId) {
    this.currentParentKidFilter = kidId;
    this.renderParentView();
    this.playSound('click');
  }

  // ------------------------------------------------------------------------
  // ЖУРНАЛ И ИСТОРИЯ
  // ------------------------------------------------------------------------
  addHistory(text, type = 'info') {
    const time = this.getMoscowTimeString();
    this.state.history.unshift({
      id: 'h_' + Date.now(),
      time,
      text,
      type
    });
    if (this.state.history.length > 100) {
      this.state.history.pop();
    }
  }

  clearHistory() {
    if (confirm('Очистить журнал активности?')) {
      this.state.history = [];
      this.saveState();
      this.render();
    }
  }

  // ------------------------------------------------------------------------
  // ЭКСПОРТ И ИМПОРТ JSON
  // ------------------------------------------------------------------------
  exportData() {
    const jsonStr = JSON.stringify(this.state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questhero_family_backup_${this.getMoscowDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.playSound('coin');
  }

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.kids || imported.hero) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
          this.state = this.loadState();
          this.saveState();
          this.render();
          alert('Данные семьи успешно загружены!');
          this.playSound('levelUp');
        } else {
          alert('Неверный формат файла резервной копии!');
        }
      } catch (err) {
        alert('Ошибка при чтении файла JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // ------------------------------------------------------------------------
  // УТИЛИТЫ МОДАЛЬНЫХ ОКОН
  // ------------------------------------------------------------------------
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  // ------------------------------------------------------------------------
  // РЕНДЕРИНГ ВСЕХ ЭЛЕМЕНТОВ ИНТЕРФЕЙСА
  // ------------------------------------------------------------------------
  render() {
    this.renderHeader();
    this.renderProfile();
    this.renderTasks();
    this.renderShop();
    this.renderCoupons();
    this.renderBadges();
    this.renderParentView();
    this.updateMidnightCountdown();
  }

  renderHeader() {
    const kid = this.getActiveKid();
    const streakEl = document.getElementById('headerStreak');
    const coinsEl = document.getElementById('headerCoins');
    const avatarEl = document.getElementById('headerUserAvatar');
    const nameEl = document.getElementById('headerUserName');

    if (this.state.currentRole === 'parent') {
      if (avatarEl) avatarEl.textContent = '🛡️';
      if (nameEl) nameEl.textContent = 'Родители';
    } else if (kid) {
      if (avatarEl) {
        if (kid.avatarPhoto) {
          avatarEl.innerHTML = `<img src="${kid.avatarPhoto}" style="width: 22px; height: 22px; border-radius: 50%; object-fit: cover; vertical-align: middle;">`;
        } else {
          avatarEl.textContent = kid.avatar || '🦁';
        }
      }
      if (nameEl) nameEl.textContent = kid.name || 'Герой';
    }

    if (kid) {
      if (streakEl) streakEl.textContent = kid.streak || 1;
      if (coinsEl) coinsEl.textContent = kid.coins || 0;
    }
  }

  renderProfile() {
    const kid = this.getActiveKid();
    if (!kid) return;

    const emojiEl = document.getElementById('heroAvatarEmoji');
    const photoEl = document.getElementById('heroAvatarPhoto');
    const nameEl = document.getElementById('heroName');
    const rankEl = document.getElementById('heroRankTag');
    const titleEl = document.getElementById('heroTitle');
    const xpNumEl = document.getElementById('xpNumbers');
    const xpFillEl = document.getElementById('xpProgressFill');

    if (kid.avatarPhoto) {
      if (photoEl) {
        photoEl.src = kid.avatarPhoto;
        photoEl.style.display = 'block';
      }
      if (emojiEl) emojiEl.style.display = 'none';
    } else {
      if (emojiEl) {
        emojiEl.textContent = kid.avatar || '🦁';
        emojiEl.style.display = 'block';
      }
      if (photoEl) photoEl.style.display = 'none';
    }

    if (nameEl) nameEl.textContent = kid.name || 'Супер-Герой';
    
    const level = kid.level || 1;
    if (rankEl) rankEl.textContent = `Уровень ${level}`;

    const titleIndex = Math.min(level - 1, LEVEL_TITLES.length - 1);
    if (titleEl) titleEl.textContent = LEVEL_TITLES[titleIndex];

    const xp = kid.xp || 0;
    const xpNext = kid.xpNext || 100;
    if (xpNumEl) xpNumEl.textContent = `${xp} / ${xpNext} XP`;
    const pct = Math.min(100, Math.round((xp / xpNext) * 100));
    if (xpFillEl) xpFillEl.style.width = `${pct}%`;

    const tasks = kid.tasks || [];
    const totalToday = tasks.length;
    const doneToday = tasks.filter(t => t.status === 'done').length;
    const todayCountEl = document.getElementById('todayTasksCount');
    if (todayCountEl) todayCountEl.textContent = `${doneToday} из ${totalToday}`;

    const earnedToday = tasks
      .filter(t => t.status === 'done')
      .reduce((sum, t) => sum + t.coins, 0);
    const todayCoinsEl = document.getElementById('todayCoinsEarned');
    if (todayCoinsEl) todayCoinsEl.textContent = `+${earnedToday} 🪙`;

    const affordable = this.state.rewards.filter(r => r.cost <= kid.coins).length;
    const affordableEl = document.getElementById('affordableRewardsCount');
    if (affordableEl) affordableEl.textContent = `${affordable}`;

    const pendingCount = tasks.filter(t => t.status === 'pending').length;
    const pendingCounterEl = document.getElementById('pendingTasksCounter');
    if (pendingCounterEl) pendingCounterEl.textContent = pendingCount;

    const activeCoupons = (kid.coupons || []).filter(c => c.status === 'active').length;
    const couponsCounterEl = document.getElementById('activeCouponsCounter');
    if (couponsCounterEl) couponsCounterEl.textContent = activeCoupons;
  }

  renderTasks() {
    const list = document.getElementById('tasksList');
    const allDoneBanner = document.getElementById('allDoneBanner');
    if (!list) return;

    const kid = this.getActiveKid();
    if (!kid || !kid.tasks) {
      list.innerHTML = '';
      return;
    }

    let filtered = kid.tasks;
    if (this.currentTaskFilter !== 'all') {
      filtered = filtered.filter(t => t.category === this.currentTaskFilter);
    }

    const categoryNames = {
      morning: '🌅 Утро',
      study: '📚 Учёба',
      chores: '🧹 Дела по дому',
      health: '⚽ Здоровье и спорт',
      evening: '🌙 Вечер'
    };

    list.innerHTML = filtered.map(t => {
      let cardClass = 'task-card';
      let actionBtn = '';

      if (t.status === 'done') {
        cardClass += ' completed';
        actionBtn = `<button class="task-action-btn btn-done">✅ Выполнено</button>`;
      } else if (t.status === 'review') {
        cardClass += ' pending-review';
        actionBtn = `<button class="task-action-btn btn-pending">⏳ На проверке у родителей</button>`;
      } else {
        actionBtn = `<button class="task-action-btn btn-claim" onclick="app.completeTask('${t.id}')">⚡ Сделано! Забрать награду</button>`;
      }

      return `
        <div class="${cardClass}">
          <div class="task-top">
            <div class="task-icon-box">${t.icon}</div>
            <div class="task-details">
              <span class="task-category-badge">${categoryNames[t.category] || t.category}</span>
              <h4 class="task-title">${t.title}</h4>
            </div>
          </div>
          <div class="task-rewards-row">
            <span class="reward-tag coins">+${t.coins} 🪙</span>
            <span class="reward-tag xp">+${t.xp} XP</span>
            ${t.requiresApproval ? '<span class="reward-tag" style="background: rgba(255,255,255,0.08); font-size: 0.75rem;">🛡️ С проверкой</span>' : ''}
          </div>
          ${actionBtn}
        </div>
      `;
    }).join('');

    const allTasksDone = kid.tasks.length > 0 && kid.tasks.every(t => t.status === 'done');
    if (allDoneBanner) {
      allDoneBanner.style.display = allTasksDone ? 'block' : 'none';
    }
  }

  renderShop() {
    const kid = this.getActiveKid();
    const balEl = document.getElementById('shopBalanceLabel');
    if (balEl && kid) balEl.textContent = `${kid.coins} 🪙`;

    const screenTimeList = document.getElementById('rewardsScreenTime');
    const moneyList = document.getElementById('rewardsMoney');
    const funList = document.getElementById('rewardsFun');

    const renderCategory = (type) => {
      return this.state.rewards
        .filter(r => r.type === type)
        .map(r => {
          const canAfford = kid ? kid.coins >= r.cost : false;
          return `
            <div class="reward-card">
              <div class="reward-info">
                <span class="reward-icon">${r.icon}</span>
                <div>
                  <h5 class="reward-title">${r.title}</h5>
                  <span class="reward-sub">${r.type === 'screen_time' ? `Таймер на ${r.duration} мин.` : 'Реальный приз'}</span>
                </div>
              </div>
              <button class="btn-buy-reward" ${canAfford ? '' : 'disabled'} onclick="app.buyReward('${r.id}')">
                Купить за ${r.cost} 🪙
              </button>
            </div>
          `;
        }).join('');
    };

    if (screenTimeList) screenTimeList.innerHTML = renderCategory('screen_time');
    if (moneyList) moneyList.innerHTML = renderCategory('money');
    if (funList) funList.innerHTML = renderCategory('fun');
  }

  renderCoupons() {
    const list = document.getElementById('activeCouponsList');
    if (!list) return;

    const kid = this.getActiveKid();
    const coupons = kid && kid.coupons ? kid.coupons : [];

    if (coupons.length === 0) {
      list.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--border-radius-md); border: var(--border-card);">
          <span style="font-size: 3rem;">🎟️</span>
          <h4 style="margin: 0.8rem 0 0.3rem 0;">У тебя пока нет купленных наград</h4>
          <p style="color: var(--text-sub); font-size: 0.9rem;">Загляни в Магазин Наград и обменяй свои заработанные монеты!</p>
          <button class="primary-btn" style="margin-top: 1rem;" onclick="app.switchKidTab('shop')">В Магазин 🎁</button>
        </div>
      `;
      return;
    }

    list.innerHTML = coupons.map(c => {
      let statusHtml = '';
      let actionBtn = '';

      if (c.status === 'used') {
        statusHtml = `<span class="coupon-status-tag" style="background: rgba(255,255,255,0.1); color: var(--text-muted);">Использован</span>`;
      } else if (c.status === 'paid') {
        statusHtml = `<span class="coupon-status-tag status-paid">Выплачено родителями ✅</span>`;
      } else {
        if (c.type === 'screen_time') {
          const mins = Math.floor(c.secondsLeft / 60);
          statusHtml = `<span class="coupon-status-tag status-running">Осталось: ${mins} мин</span>`;
          actionBtn = `<button class="primary-btn btn-small" onclick="app.useCoupon('${c.id}')">${c.timerRunning ? 'Открыть таймер ⏱️' : 'Запустить время ▶️'}</button>`;
        } else if (c.type === 'money') {
          statusHtml = `<span class="coupon-status-tag status-ready">Ждёт выплаты от родителей</span>`;
          actionBtn = `<button class="secondary-btn btn-small" onclick="app.useCoupon('${c.id}')">Показать родителям 💵</button>`;
        } else {
          statusHtml = `<span class="coupon-status-tag status-ready">Готов к использованию</span>`;
          actionBtn = `<button class="primary-btn btn-small" onclick="app.useCoupon('${c.id}')">Использовать приз 🎉</button>`;
        }
      }

      return `
        <div class="coupon-ticket ${c.timerRunning ? 'active-timer' : ''}">
          <div class="coupon-top">
            <span class="coupon-icon">${c.icon}</span>
            <div>
              <h4 class="coupon-title">${c.title}</h4>
              ${statusHtml}
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 0.75rem;">
            <span style="font-size: 0.8rem; color: var(--text-muted);">Куплен в ${c.createdAt || 'сегодня'}</span>
            ${actionBtn}
          </div>
        </div>
      `;
    }).join('');
  }

  renderBadges() {
    const list = document.getElementById('badgesList');
    if (!list) return;

    const kid = this.getActiveKid();
    const badges = kid && kid.badges ? kid.badges : [];

    list.innerHTML = badges.map(b => `
      <div class="badge-card ${b.unlocked ? '' : 'locked'}">
        <span class="badge-icon">${b.icon}</span>
        <h4 class="badge-title">${b.title}</h4>
        <p class="badge-desc">${b.desc}</p>
        <span class="badge-status">${b.unlocked ? '✨ Получено!' : '🔒 Заблокировано'}</span>
      </div>
    `).join('');
  }

  renderParentView() {
    if (!this.state.kids) return;

    // 1. Бейдж количества детей на вкладке
    const kidsBadge = document.getElementById('parentKidsBadge');
    if (kidsBadge) kidsBadge.textContent = this.state.kids.length;

    // 2. Рендеринг списка детей в первой вкладке
    this.renderParentKidsList();

    // 3. Рендеринг чипсов фильтра детей
    this.renderParentChildChips();

    // 4. Сводный дашборд
    const filter = this.currentParentKidFilter;
    const filterSummaryEl = document.getElementById('parentKidFilterSummary');

    let relevantKids = this.state.kids;
    if (filter !== 'all') {
      const selected = this.state.kids.find(k => k.id === filter);
      if (selected) {
        relevantKids = [selected];
        if (filterSummaryEl) filterSummaryEl.textContent = `Данные: ${selected.name}`;
      }
    } else {
      if (filterSummaryEl) filterSummaryEl.textContent = `Все дети (${this.state.kids.length})`;
    }

    // Подсчет очереди на проверку
    let pendingReviews = [];
    relevantKids.forEach(kid => {
      (kid.tasks || []).filter(t => t.status === 'review').forEach(t => {
        pendingReviews.push({ task: t, kid });
      });
    });

    const pReviewCount = document.getElementById('parentPendingReviewCount');
    const pBadge = document.getElementById('parentQueueBadge');
    if (pReviewCount) pReviewCount.textContent = pendingReviews.length;
    if (pBadge) pBadge.textContent = pendingReviews.length;

    const pBal = document.getElementById('parentCurrentBalance');
    if (pBal) {
      if (filter === 'all') {
        const totalCoins = this.state.kids.reduce((sum, k) => sum + (k.coins || 0), 0);
        pBal.textContent = `${totalCoins} 🪙`;
      } else {
        pBal.textContent = `${relevantKids[0].coins || 0} 🪙`;
      }
    }

    const pLvl = document.getElementById('parentCurrentLevel');
    const pXp = document.getElementById('parentCurrentXP');
    if (pLvl) {
      if (filter === 'all') {
        pLvl.textContent = `Героев: ${this.state.kids.length}`;
        if (pXp) pXp.textContent = `Вся семья`;
      } else {
        pLvl.textContent = `Уровень ${relevantKids[0].level || 1}`;
        if (pXp) pXp.textContent = `${relevantKids[0].xp || 0} / ${relevantKids[0].xpNext || 100} XP`;
      }
    }

    const pStreak = document.getElementById('parentStreakCount');
    if (pStreak) {
      if (filter === 'all') {
        const maxStreak = Math.max(...this.state.kids.map(k => k.streak || 1));
        pStreak.textContent = maxStreak;
      } else {
        pStreak.textContent = relevantKids[0].streak || 1;
      }
    }

    // 5. Очередь квестов на проверку
    const queueList = document.getElementById('parentQueueList');
    if (queueList) {
      if (pendingReviews.length === 0) {
        queueList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem; padding: 1rem 0;">Все задания проверены! Новых запросов нет.</p>`;
      } else {
        queueList.innerHTML = pendingReviews.map(item => `
          <div class="queue-item">
            <div class="queue-item-left">
              <span class="queue-icon">${item.task.icon}</span>
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="badge-pill" style="background: var(--c-accent);">${item.kid.avatar} ${item.kid.name}</span>
                  <h4 class="queue-title" style="margin: 0;">${item.task.title}</h4>
                </div>
                <span class="queue-meta">Награда: +${item.task.coins} 🪙, +${item.task.xp} XP</span>
              </div>
            </div>
            <div class="queue-actions">
              <button class="primary-btn btn-small" onclick="app.approveTask('${item.task.id}', '${item.kid.id}')">✅ Одобрить</button>
              <button class="danger-btn btn-small" onclick="app.rejectTask('${item.task.id}', '${item.kid.id}')">❌ Отклонить</button>
            </div>
          </div>
        `).join('');
      }
    }

    // 6. Активные купоны на деньги / экранное время
    const couponsQueue = document.getElementById('parentCouponsQueueList');
    if (couponsQueue) {
      let activeCoupons = [];
      relevantKids.forEach(kid => {
        (kid.coupons || []).filter(c => c.status === 'active').forEach(c => {
          activeCoupons.push({ coupon: c, kid });
        });
      });

      if (activeCoupons.length === 0) {
        couponsQueue.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem; padding: 1rem 0;">Нет активных купонов, ожидающих выдачи.</p>`;
      } else {
        couponsQueue.innerHTML = activeCoupons.map(item => `
          <div class="queue-item">
            <div class="queue-item-left">
              <span class="queue-icon">${item.coupon.icon}</span>
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="badge-pill" style="background: var(--c-accent);">${item.kid.avatar} ${item.kid.name}</span>
                  <h4 class="queue-title" style="margin: 0;">${item.coupon.title}</h4>
                </div>
                <span class="queue-meta">${item.coupon.type === 'money' ? 'Карманные деньги' : item.coupon.type === 'screen_time' ? `Экранное время (${item.coupon.duration} мин)` : 'Приз'}</span>
              </div>
            </div>
            <div class="queue-actions">
              <button class="primary-btn btn-small" onclick="app.confirmCouponPaid('${item.coupon.id}', '${item.kid.id}')">Отметить выполненным ✅</button>
            </div>
          </div>
        `).join('');
      }
    }

    // 7. Таблица заданий
    const tasksTableBody = document.getElementById('parentTasksTableBody');
    if (tasksTableBody) {
      const displayKid = filter !== 'all'
        ? (this.state.kids.find(k => k.id === filter) || this.getActiveKid())
        : this.getActiveKid();

      const tasks = displayKid && displayKid.tasks ? displayKid.tasks : [];

      tasksTableBody.innerHTML = tasks.map(t => `
        <tr>
          <td style="font-size: 1.5rem;">${t.icon}</td>
          <td><strong>${t.title}</strong></td>
          <td>${t.category}</td>
          <td class="text-gold"><strong>+${t.coins} 🪙</strong></td>
          <td class="text-cyan">+${t.xp} XP</td>
          <td>${t.requiresApproval ? '🛡️ Требуется' : '⚡ Авто'}</td>
          <td>
            <div class="action-btns-group">
              <button class="btn-tiny" onclick="app.openTaskEditorModal('${t.id}')">✏️</button>
              <button class="btn-tiny" style="color: #f87171;" onclick="app.deleteTask('${t.id}')">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    // 8. Таблица наград
    const rewardsTableBody = document.getElementById('parentRewardsTableBody');
    if (rewardsTableBody) {
      rewardsTableBody.innerHTML = this.state.rewards.map(r => `
        <tr>
          <td style="font-size: 1.5rem;">${r.icon}</td>
          <td><strong>${r.title}</strong></td>
          <td>${r.type === 'screen_time' ? '📱 Экран' : r.type === 'money' ? '💵 Деньги' : '🎉 Приз'}</td>
          <td class="text-gold"><strong>${r.cost} 🪙</strong></td>
          <td>${r.type === 'screen_time' ? `${r.duration} мин.` : '—'}</td>
          <td>
            <div class="action-btns-group">
              <button class="btn-tiny" onclick="app.openRewardEditorModal('${r.id}')">✏️</button>
              <button class="btn-tiny" style="color: #f87171;" onclick="app.deleteReward('${r.id}')">🗑️</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    // 9. Журнал активности
    const historyList = document.getElementById('parentHistoryList');
    if (historyList) {
      if (this.state.history.length === 0) {
        historyList.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">Журнал пуст.</p>`;
      } else {
        historyList.innerHTML = this.state.history.map(h => `
          <div class="history-item">
            <div class="history-left">
              <span>${h.text}</span>
            </div>
            <span class="history-time">${h.time}</span>
          </div>
        `).join('');
      }
    }

    // 10. Настройки
    const settingNameInput = document.getElementById('settingHeroName');
    const activeKid = this.getActiveKid();
    if (settingNameInput && activeKid) settingNameInput.value = activeKid.name || '';

    const themeSelect = document.getElementById('parentThemeSelect');
    if (themeSelect) themeSelect.value = this.state.settings.theme || 'hero';
  }

  renderParentKidsList() {
    const list = document.getElementById('parentKidsList');
    if (!list || !this.state.kids) return;

    list.innerHTML = this.state.kids.map(kid => {
      const isActive = kid.id === this.state.activeKidId;
      const avatarHtml = kid.avatarPhoto
        ? `<img src="${kid.avatarPhoto}" alt="${kid.name}">`
        : kid.avatar;

      const tasks = kid.tasks || [];
      const totalTasks = tasks.length;
      const doneTasks = tasks.filter(t => t.status === 'done').length;

      return `
        <div class="kid-card ${isActive ? 'is-active-kid' : ''}">
          <div class="kid-card-header">
            <div class="kid-avatar-box">${avatarHtml}</div>
            <div class="kid-info-box">
              <div class="kid-name-row">
                <h4>${kid.name}</h4>
                ${isActive ? '<span class="kid-active-badge">Активен</span>' : ''}
              </div>
              <span class="kid-rank-text">Уровень ${kid.level} · ${LEVEL_TITLES[Math.min(kid.level - 1, LEVEL_TITLES.length - 1)]}</span>
            </div>
          </div>

          <div class="kid-stats-row">
            <div class="kid-stat-mini">
              <span>Баланс:</span>
              <strong class="text-gold">${kid.coins} 🪙</strong>
            </div>
            <div class="kid-stat-mini">
              <span>Стрик:</span>
              <strong class="text-red">🔥 ${kid.streak} дн.</strong>
            </div>
            <div class="kid-stat-mini">
              <span>Квесты:</span>
              <strong class="text-emerald">${doneTasks}/${totalTasks}</strong>
            </div>
          </div>

          <div class="kid-invite-box">
            <span>🔑 Инвайт: <strong class="kid-invite-code">${kid.inviteCode || 'HERO-101'}</strong></span>
            <button class="btn-tiny" onclick="app.copyInviteCode('${kid.id}')">Копировать</button>
          </div>

          <div class="kid-card-actions">
            <button class="primary-btn btn-small" onclick="app.loginAsKid('${kid.id}')">
              <span>🚀</span> Войти как ${kid.name}
            </button>
            <button class="secondary-btn btn-small" onclick="app.openAdjustBalanceModal('${kid.id}')">
              <span>🪙</span> Баланс
            </button>
            <button class="secondary-btn btn-small" onclick="app.openInviteKidModal('${kid.id}')">
              <span>✏️</span>
            </button>
            ${this.state.kids.length > 1 ? `
              <button class="secondary-btn btn-small" style="color: #f87171;" onclick="app.deleteKid('${kid.id}')">
                <span>🗑️</span>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  renderParentChildChips() {
    const container = document.getElementById('parentChildChips');
    if (!container || !this.state.kids) return;

    const allActive = this.currentParentKidFilter === 'all';
    let html = `
      <button class="pchild-chip ${allActive ? 'active' : ''}" onclick="app.setParentKidFilter('all')">
        ✨ Все дети (${this.state.kids.length})
      </button>
    `;

    html += this.state.kids.map(kid => {
      const isActive = this.currentParentKidFilter === kid.id;
      return `
        <button class="pchild-chip ${isActive ? 'active' : ''}" onclick="app.setParentKidFilter('${kid.id}')">
          <span>${kid.avatar}</span>
          <span>${kid.name}</span>
          <span style="opacity: 0.7; font-size: 0.75rem;">(${kid.coins}🪙)</span>
        </button>
      `;
    }).join('');

    container.innerHTML = html;
  }
}

// --------------------------------------------------------------------------
// ЗАПУСК ПРИЛОЖЕНИЯ ПОСЛЕ ЗАГРУЗКИ DOM
// --------------------------------------------------------------------------
let app;
window.addEventListener('DOMContentLoaded', () => {
  app = new QuestHeroApp();
  window.app = app; // Доступно для инлайн onclick в HTML

  // Установка сохраненной темы оформления
  app.setTheme(app.state.settings.theme || 'hero', true);
  app.render();

  // Автоматический вход по инвайт-ссылке в URL (#invite=HERO-XXXX)
  if (window.location.hash && window.location.hash.startsWith('#invite=')) {
    const code = decodeURIComponent(window.location.hash.replace('#invite=', '')).trim().toUpperCase();
    if (code) {
      setTimeout(() => {
        const found = app.state.kids.find(k => (k.inviteCode || '').toUpperCase() === code);
        if (found) {
          app.loginAsKid(found.id);
          alert(`🎉 Привет, ${found.name}! Ты успешно подключился по ссылке родителей!`);
        }
      }, 300);
    }
  }

  // Поддержка ввода ПИН-кода с клавиатуры
  window.addEventListener('keydown', (e) => {
    const pinModal = document.getElementById('pinModal');
    if (pinModal && pinModal.classList.contains('active')) {
      if (/^[0-9]$/.test(e.key)) {
        app.numpadPress(e.key);
      } else if (e.key === 'Backspace') {
        app.numpadBackspace();
      } else if (e.key === 'Escape') {
        app.closeModal('pinModal');
      }
    }
  });
});
