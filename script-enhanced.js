/* ==========================================
   AI Infrastructure DDS - Enhanced Version
   Advanced Features: Logging, Validation, Performance Monitoring
   PWA Enhancement, Security, Accessibility, Testing
========================================== */

// ==========================================
// ADVANCED LOGGING SYSTEM
// ==========================================
const Logger = {
  logs: [],
  maxLogs: 1000,
  levels: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 },
  currentLevel: 1,

  log(level, message, data = null) {
    if (level < this.currentLevel) return;

    const timestamp = new Date().toISOString();
    const levelName = Object.keys(this.levels).find(k => this.levels[k] === level);
    const entry = { timestamp, level: levelName, message, data };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    const logMsg = `[${timestamp}] ${levelName}: ${message}`;
    if (data) console.log(logMsg, data);
    else console.log(logMsg);

    // Send critical errors to server in production
    if (level === this.levels.ERROR) {
      this.sendToServer(entry);
    }
  },

  debug(msg, data) { this.log(this.levels.DEBUG, msg, data); },
  info(msg, data) { this.log(this.levels.INFO, msg, data); },
  warn(msg, data) { this.log(this.levels.WARN, msg, data); },
  error(msg, data) { this.log(this.levels.ERROR, msg, data); },

  getLogs() { return this.logs; },
  clearLogs() { this.logs = []; },
  downloadLogs() {
    const data = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  sendToServer(entry) {
    // In production, send errors to error tracking service
    if (navigator.onLine && window.location.hostname !== 'localhost') {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      }).catch(() => {}); // Silent fail
    }
  }
};

// ==========================================
// INPUT VALIDATION FRAMEWORK
// ==========================================
const Validator = {
  rules: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\d{10,15}$/,
    coordinates: /^-?\d+\.?\d*$/,
    area: /^\d+(\.\d{1,2})?$/,
    percentage: /^(100|[1-9]?\d)(\.\d{1,2})?$/
  },

  validate(value, type) {
    if (!this.rules[type]) return true;
    return this.rules[type].test(value);
  },

  validateObject(obj, schema) {
    const errors = {};
    Object.keys(schema).forEach(key => {
      if (!this.validate(obj[key], schema[key])) {
        errors[key] = `Invalid ${key}`;
      }
    });
    return Object.keys(errors).length ? errors : null;
  },

  sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }
};

// ==========================================
// PERFORMANCE MONITORING
// ==========================================
const PerformanceMonitor = {
  metrics: {},

  mark(name) {
    this.metrics[name] = performance.now();
  },

  measure(name, start, end = null) {
    if (!this.metrics[start]) return null;
    const duration = (end ? this.metrics[end] : performance.now()) - this.metrics[start];
    Logger.info(`Performance: ${name}`, { duration: `${duration.toFixed(2)}ms` });
    return duration;
  },

  getMemoryUsage() {
    if (performance.memory) {
      return {
        usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
      };
    }
    return null;
  },

  getMetrics() {
    return {
      navigation: performance.getEntriesByType('navigation')[0],
      memory: this.getMemoryUsage(),
      logs: Logger.logs.length
    };
  }
};

// ==========================================
// ENHANCED STATE MANAGEMENT
// ==========================================
const StateManager = {
  state: {},
  listeners: [],

  init(initialState) {
    this.state = initialState;
    Logger.info('StateManager initialized', { keys: Object.keys(initialState) });
  },

  get(key) {
    return this.state[key];
  },

  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    if (oldValue !== value) {
      this.notifyListeners(key, oldValue, value);
    }
  },

  subscribe(key, callback) {
    this.listeners.push({ key, callback });
  },

  notifyListeners(key, oldValue, newValue) {
    this.listeners
      .filter(l => l.key === key)
      .forEach(l => l.callback(newValue, oldValue));
  },

  getState() {
    return { ...this.state };
  }
};

// ==========================================
// DATA COMPRESSION FOR STORAGE
// ==========================================
const DataCompression = {
  compress(data) {
    const jsonStr = JSON.stringify(data);
    return btoa(jsonStr); // Base64 encoding
  },

  decompress(compressedData) {
    try {
      const jsonStr = atob(compressedData);
      return JSON.parse(jsonStr);
    } catch (e) {
      Logger.error('Decompression failed', { error: e.message });
      return null;
    }
  },

  getSize(data) {
    const jsonStr = JSON.stringify(data);
    return (new Blob([jsonStr]).size / 1024).toFixed(2) + ' KB';
  }
};

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================
const CONFIG = {
  THEME_KEY: 'theme',
  AUTH_KEY: 'auth',
  INSPECTIONS_KEY: 'inspections',
  CACHE_KEY: 'dds_cache',
  MAX_IMAGES: 10,
  TRAINING_SAMPLES: 300,
  KNN_K: 5,
  DEBOUNCE_DELAY: 300,
  WEATHER_UPDATE_INTERVAL: 5000,
  SCROLL_THRESHOLD: 50,
  MAX_STORAGE_SIZE: 8 * 1024 * 1024, // 8MB
  API_TIMEOUT: 5000,
};

const SEVERITY_LEVELS = ['Low', 'Moderate', 'High', 'Very High', 'Critical'];
const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Completed'];
const CONTRACTORS = ['Unassigned', 'Contractor A', 'Contractor B', 'PWD Team', 'NHAI Team'];
const WEATHER_CONDITIONS = ['Sunny', 'Cloudy', 'Rainy', 'Storm', 'Monsoon'];

// ==========================================
// UTILITY FUNCTIONS (Enhanced)
// ==========================================
const Utils = {
  debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  querySelectorSafe(selector) {
    try {
      return document.querySelector(selector);
    } catch (e) {
      Logger.warn(`Invalid selector: ${selector}`, { error: e.message });
      return null;
    }
  },

  querySelectorAllSafe(selector) {
    try {
      return Array.from(document.querySelectorAll(selector));
    } catch (e) {
      Logger.warn(`Invalid selector: ${selector}`, { error: e.message });
      return [];
    }
  },

  getElementByIdSafe(id) {
    return document.getElementById(id) || null;
  },

  formatCurrency(value) {
    return `₹${Math.round(value).toLocaleString()}`;
  },

  formatPercentage(value) {
    return `${parseFloat(value).toFixed(2)}%`;
  },

  formatDate(date, format = 'short') {
    const d = new Date(date);
    if (format === 'short') return d.toLocaleDateString();
    if (format === 'long') return d.toLocaleString();
    return d.toISOString();
  },

  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  isDarkMode() {
    return localStorage.getItem(CONFIG.THEME_KEY) === 'dark';
  },

  cacheSelector(cache, selector, getter = 'querySelector') {
    if (!cache.has(selector)) {
      const methods = {
        'querySelector': Utils.querySelectorSafe,
        'querySelectorAllSafe': Utils.querySelectorAllSafe,
        'getElementByIdSafe': Utils.getElementByIdSafe
      };
      const method = methods[getter] || Utils.querySelectorSafe;
      cache.set(selector, method(selector));
    }
    return cache.get(selector);
  },

  isMobile() {
    return window.innerWidth < 768;
  },

  isOnline() {
    return navigator.onLine;
  },

  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  merge(...objects) {
    return Object.assign({}, ...objects);
  }
};

const elementCache = new Map();

// ==========================================
// DDS NAMESPACE (Enhanced)
// ==========================================
const DDS = {
  auth: {},
  ui: {},
  storage: {},
  data: {},
  maps: {},
  analysis: {},
  weather: {},
  traffic: {},
  cost: {},
  reports: {},
  kanban: {},
  export: {},
  cache: elementCache,
  version: '2.1.0',
  buildDate: new Date().toISOString()
};

// Initialize theme
if (!localStorage.getItem(CONFIG.THEME_KEY)) {
  localStorage.setItem(CONFIG.THEME_KEY, 'dark');
}

// ==========================================
// STORAGE HELPERS (Enhanced with Compression)
// ==========================================
DDS.storage.get = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    
    // Try to decompress if it's compressed data
    const decompressed = DataCompression.decompress(data);
    if (decompressed) return decompressed;
    
    // Fall back to JSON parsing
    return JSON.parse(data) || fallback;
  } catch (err) {
    Logger.error(`Storage get error for key ${key}`, { error: err.message });
    return fallback;
  }
};

DDS.storage.set = (key, val, shouldRedirect = false) => {
  try {
    const jsonStr = JSON.stringify(val);
    const size = new Blob([jsonStr]).size;

    if (size > CONFIG.MAX_STORAGE_SIZE) {
      Logger.warn(`Storage size warning for ${key}`, { size: (size / 1024).toFixed(2) + ' KB' });
    }

    localStorage.setItem(key, jsonStr);
    Logger.info(`Stored ${key}`, { size: (size / 1024).toFixed(2) + ' KB' });

    if (shouldRedirect) {
      window.location.href = 'dashboard.html';
    }
  } catch (err) {
    Logger.error(`Storage set error for key ${key}`, { error: err.message });
    if (err.name === 'QuotaExceededError') {
      DDS.storage.clearOldData();
      DDS.storage.set(key, val, shouldRedirect);
    }
  }
};

DDS.storage.clearOldData = () => {
  Logger.warn('Storage quota exceeded, clearing old data');
  const inspections = DDS.storage.get(CONFIG.INSPECTIONS_KEY, []);
  if (inspections.length > 100) {
    inspections.splice(0, 50); // Remove first 50 items
    DDS.storage.set(CONFIG.INSPECTIONS_KEY, inspections, false);
  }
};

DDS.storage.getStorageInfo = () => {
  return {
    used: Object.keys(localStorage).reduce((sum, key) => {
      return sum + new Blob([localStorage.getItem(key)]).size;
    }, 0) / 1024,
    limit: CONFIG.MAX_STORAGE_SIZE / 1024
  };
};

// ==========================================
// AUTH (Enhanced)
// ==========================================
DDS.auth.requireLogin = () => {
  const auth = DDS.storage.get(CONFIG.AUTH_KEY, null);
  if (!auth) {
    Logger.warn('Unauthorized access attempt');
    window.location = 'index.html';
  }
  return auth;
};

DDS.auth.logout = () => {
  try {
    localStorage.removeItem(CONFIG.AUTH_KEY);
    Logger.info('User logged out');
    window.location = 'index.html';
  } catch (err) {
    Logger.error('Logout error', { error: err.message });
  }
};

DDS.auth.getUser = () => {
  return DDS.storage.get(CONFIG.AUTH_KEY, null);
};

DDS.auth.isAuthenticated = () => {
  return DDS.auth.getUser() !== null;
};

// ==========================================
// THEME (Enhanced)
// ==========================================
DDS.ui.initTheme = () => {
  const theme = localStorage.getItem(CONFIG.THEME_KEY) || 'dark';
  if (theme === 'light') {
    document.body.classList.add('light');
  }
  DDS.ui.updateThemeButton(theme);
  Logger.info('Theme initialized', { theme });
};

DDS.ui.updateThemeButton = (theme) => {
  const btn = Utils.getElementByIdSafe('themeToggle');
  if (btn) {
    btn.innerHTML = theme === 'light' ? '🌙' : '☀️';
    btn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  }
};

DDS.ui.toggleTheme = () => {
  document.body.classList.toggle('light');
  const isDark = !document.body.classList.contains('light');
  localStorage.setItem(CONFIG.THEME_KEY, isDark ? 'dark' : 'light');
  DDS.ui.updateThemeButton(isDark ? 'dark' : 'light');
  Logger.info('Theme toggled', { theme: isDark ? 'dark' : 'light' });
};

// ==========================================
// OFFLINE BANNER (Enhanced)
// ==========================================
DDS.ui.updateOfflineBanner = () => {
  const banner = Utils.getElementByIdSafe('offlineBanner');
  if (banner) {
    const isOnline = navigator.onLine;
    banner.style.display = isOnline ? 'none' : 'block';
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'polite');
  }
};

['online', 'offline'].forEach(event => {
  window.addEventListener(event, () => {
    DDS.ui.updateOfflineBanner();
    Logger.info(`Network status changed: ${event}`);
  });
});

// ==========================================
// DATA STRUCTURES
// ==========================================
DDS.data.translations = {
  en: { dashboard: 'Dashboard', inspect: 'Inspect', reports: 'Reports' },
  hi: { dashboard: 'डैशबोर्ड', inspect: 'निरीक्षण', reports: 'रिपोर्ट' },
  kn: { dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', inspect: 'ಪರಿಶೀಲನೆ', reports: 'ವರದಿಗಳು' }
};

DDS.data.locations = {
  India: {
    Maharashtra: {
      'Mumbai Suburban': ['Khar', 'Bandra', 'Andheri'],
      Pune: ['Hinjewadi', 'Wakad', 'Shivajinagar']
    },
    Karnataka: {
      'Bengaluru Urban': ['Whitefield', 'Electronic City', 'Yelahanka'],
      Mysuru: ['Vijayanagar', 'Nazarbad']
    },
    'Tamil Nadu': {
      Chennai: ['Guindy', 'Adyar', 'Tambaram']
    },
    Delhi: {
      Delhi: ['Rohini', 'Dwarka', 'Karol Bagh']
    }
  }
};

DDS.data.severityConfig = {
  Low: { multiplier: 1.0, discount: 0.95, score: 2 },
  Moderate: { multiplier: 1.4, discount: 0.90, score: 5 },
  High: { multiplier: 2.0, discount: 0.82, score: 10 },
  'Very High': { multiplier: 3.0, discount: 0.72, score: 15 },
  Critical: { multiplier: 4.5, discount: 0.65, score: 20 }
};

DDS.data.infrastructureRates = {
  road: { unit: 'sqm', base: 800, labour: 0.30, material: 0.55, equipment: 0.15 },
  bridge: { unit: 'sqm', base: 1200, labour: 0.25, material: 0.60, equipment: 0.15 },
  building: { unit: 'sqm', base: 1100, labour: 0.35, material: 0.50, equipment: 0.15 },
  drainage: { unit: 'm', base: 350, labour: 0.40, material: 0.40, equipment: 0.20 },
  culvert: { unit: 'piece', base: 15000, labour: 0.30, material: 0.55, equipment: 0.15 },
  flyover: { unit: 'sqm', base: 1800, labour: 0.25, material: 0.60, equipment: 0.15 },
  footpath: { unit: 'sqm', base: 400, labour: 0.35, material: 0.50, equipment: 0.15 },
  streetlight: { unit: 'pole', base: 8000, labour: 0.20, material: 0.70, equipment: 0.10 },
  retainingWall: { unit: 'sqm', base: 900, labour: 0.40, material: 0.45, equipment: 0.15 },
  waterPipeline: { unit: 'm', base: 500, labour: 0.35, material: 0.50, equipment: 0.15 },
  electricalPole: { unit: 'pole', base: 6000, labour: 0.25, material: 0.60, equipment: 0.15 }
};

DDS.data.additionalWorks = {
  treeRemoval: { unit: 'tree', base: 1500 },
  debrisRemoval: { unit: 'sqm', base: 100 },
  encroachmentRemoval: { unit: 'occ', base: 5000 },
  drainCleaning: { unit: 'm', base: 50 },
  poleRemoval: { unit: 'pole', base: 2000 },
  trafficDiversion: { unit: 'day', base: 8000 },
  emergencyBarricading: { unit: 'occ', base: 3000 }
};

DDS.data.rates = {
  skilledLabour: 800,
  unskilledLabour: 500,
  cement: 400,
  steel: 65,
  aggregate: 1000,
  sand: 1500,
  bitumen: 49
};

DDS.data.timeline = {
  Low: '1-2 Days',
  Moderate: '3-5 Days',
  High: '5-10 Days',
  'Very High': '10-20 Days',
  Critical: '20-45 Days'
};

DDS.data.trafficScores = {
  'Free Flow': 0,
  Moderate: 2,
  Heavy: 5,
  Extreme: 8
};

DDS.data.weatherConditions = WEATHER_CONDITIONS;

// ==========================================
// SAMPLE DATA GENERATOR
// ==========================================
DDS.data.generateSampleData = () => {
  const existing = DDS.storage.get(CONFIG.INSPECTIONS_KEY, []);
  if (existing.length > 0) return;

  const cities = [
    { city: 'Bandra', state: 'Maharashtra', lat: 19.0596, lng: 72.8295 },
    { city: 'Khar', state: 'Maharashtra', lat: 19.0728, lng: 72.8362 },
    { city: 'Whitefield', state: 'Karnataka', lat: 12.9698, lng: 77.7500 },
    { city: 'Electronic City', state: 'Karnataka', lat: 12.8456, lng: 77.6603 },
    { city: 'Guindy', state: 'Tamil Nadu', lat: 13.0067, lng: 80.2206 }
  ];

  const structures = Object.keys(DDS.data.infrastructureRates);
  const inspections = [];

  for (let i = 1; i <= 30; i++) {
    const loc = Utils.getRandomItem(cities);
    const severity = Utils.getRandomItem(SEVERITY_LEVELS);
    const structure = Utils.getRandomItem(structures);

    inspections.push({
      id: `INS-${1000 + i}`,
      date: new Date().toISOString(),
      country: 'India',
      state: loc.state,
      district: 'Sample District',
      city: loc.city,
      latitude: loc.lat,
      longitude: loc.lng,
      structureType: structure,
      severity,
      area: Math.floor(Math.random() * 1000) + 100,
      priority: Utils.getRandomItem(['Low', 'Medium', 'High']),
      status: Utils.getRandomItem(STATUS_OPTIONS),
      assignee: Utils.getRandomItem(CONTRACTORS),
      images: [],
      cost: Math.floor(Math.random() * 500000) + 50000,
      weather: Utils.getRandomItem(WEATHER_CONDITIONS),
      traffic: Utils.getRandomItem(['Free Flow', 'Moderate', 'Heavy', 'Extreme']),
      timeline: DDS.data.timeline[severity],
      notes: `Sample inspection for ${structure} in ${loc.city}`
    });
  }

  DDS.storage.set(CONFIG.INSPECTIONS_KEY, inspections, false);
  Logger.info('Sample data generated', { count: inspections.length });
};

// ==========================================
// COST CALCULATION (Enhanced)
// ==========================================
DDS.cost.calculate = (params) => {
  try {
    if (!params || !params.structureType || !params.severity) {
      Logger.warn('Invalid cost calculation parameters');
      return null;
    }

    const structure = DDS.data.infrastructureRates[params.structureType];
    if (!structure) {
      Logger.error('Unknown structure type', { type: params.structureType });
      return null;
    }

    const area = parseFloat(params.area) || 100;
    const severity = params.severity;
    const config = DDS.data.severityConfig[severity];

    if (!config) {
      Logger.error('Unknown severity level', { severity });
      return null;
    }

    const baseCost = structure.base * area;
    const severityCost = baseCost * config.multiplier;
    const labour = severityCost * structure.labour;
    const material = severityCost * structure.material;
    const equipment = severityCost * structure.equipment;
    const subtotal = labour + material + equipment;
    const gst = subtotal * 0.18;
    const discount = subtotal * config.discount;
    const finalCost = subtotal + gst - discount;

    const result = {
      baseCost: Math.round(baseCost),
      severityMultiplier: config.multiplier,
      labour: Math.round(labour),
      material: Math.round(material),
      equipment: Math.round(equipment),
      subtotal: Math.round(subtotal),
      gst: Math.round(gst),
      discount: Math.round(discount),
      finalCost: Math.round(finalCost),
      timeline: DDS.data.timeline[severity]
    };

    Logger.info('Cost calculated', { structureType: params.structureType, severity, finalCost: result.finalCost });
    return result;
  } catch (err) {
    Logger.error('Cost calculation error', { error: err.message });
    return null;
  }
};

// ==========================================
// WEATHER & TRAFFIC (Simulated)
// ==========================================
DDS.weather.current = {};

DDS.weather.refresh = () => {
  const condition = Utils.getRandomItem(DDS.data.weatherConditions);
  DDS.weather.current = {
    condition,
    temp: Math.floor(20 + Math.random() * 18),
    humidity: Math.floor(40 + Math.random() * 50)
  };

  const weatherBox = Utils.getElementByIdSafe('weatherCondition');
  const tempBox = Utils.getElementByIdSafe('temperature');

  if (weatherBox) weatherBox.value = condition;
  if (tempBox) tempBox.value = `${DDS.weather.current.temp}°C`;

  Logger.debug('Weather updated', DDS.weather.current);
};

DDS.traffic.current = 'Moderate';

DDS.traffic.refresh = () => {
  const levels = ['Free Flow', 'Moderate', 'Heavy', 'Extreme'];
  DDS.traffic.current = Utils.getRandomItem(levels);

  const trafficBox = Utils.getElementByIdSafe('trafficCondition');
  if (trafficBox) trafficBox.value = DDS.traffic.current;

  Logger.debug('Traffic updated', { level: DDS.traffic.current });
};

// ==========================================
// DEBUG PANEL (Testing Utilities)
// ==========================================
const DebugPanel = {
  isOpen: false,

  init() {
    if (document.getElementById('debugPanel')) return;

    const panel = document.createElement('div');
    panel.id = 'debugPanel';
    panel.className = 'debug-panel';
    panel.innerHTML = `
      <div class="debug-header">
        <h3>🔧 Debug Panel</h3>
        <button class="close-btn">✕</button>
      </div>
      <div class="debug-content">
        <div class="debug-tabs">
          <button class="tab-btn active" data-tab="logs">Logs</button>
          <button class="tab-btn" data-tab="state">State</button>
          <button class="tab-btn" data-tab="storage">Storage</button>
          <button class="tab-btn" data-tab="performance">Performance</button>
        </div>
        <div class="tab-content" data-tab="logs">
          <div class="logs-container"></div>
          <button class="btn-small">Clear Logs</button>
          <button class="btn-small">Download Logs</button>
        </div>
        <div class="tab-content" data-tab="state" style="display:none;">
          <pre class="state-display"></pre>
        </div>
        <div class="tab-content" data-tab="storage" style="display:none;">
          <pre class="storage-display"></pre>
        </div>
        <div class="tab-content" data-tab="performance" style="display:none;">
          <pre class="performance-display"></pre>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Event listeners
    panel.querySelector('.close-btn').addEventListener('click', () => this.toggle());
    panel.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });
    panel.querySelector('[data-tab="logs"] .btn-small').addEventListener('click', () => Logger.clearLogs());
    panel.querySelectorAll('[data-tab="logs"] .btn-small')[1].addEventListener('click', () => Logger.downloadLogs());

    this.update();
    Logger.info('Debug panel initialized');
  },

  toggle() {
    this.isOpen = !this.isOpen;
    const panel = document.getElementById('debugPanel');
    if (panel) {
      panel.style.display = this.isOpen ? 'block' : 'none';
    }
  },

  switchTab(tabName) {
    const panel = document.getElementById('debugPanel');
    if (!panel) return;

    panel.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    panel.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');

    panel.querySelector(`[data-tab="${tabName}"].tab-btn`).classList.add('active');
    panel.querySelector(`[data-tab="${tabName}"].tab-content`).style.display = 'block';

    this.updateTab(tabName);
  },

  updateTab(tabName) {
    const panel = document.getElementById('debugPanel');
    if (!panel) return;

    if (tabName === 'logs') {
      const logsContainer = panel.querySelector('.logs-container');
      logsContainer.innerHTML = Logger.logs.map(log =>
        `<div class="log-entry log-${log.level.toLowerCase()}">
          [${log.level}] ${log.message}
        </div>`
      ).join('');
    } else if (tabName === 'state') {
      const stateDisplay = panel.querySelector('.state-display');
      stateDisplay.textContent = JSON.stringify(StateManager.getState(), null, 2);
    } else if (tabName === 'storage') {
      const storageDisplay = panel.querySelector('.storage-display');
      const info = DDS.storage.getStorageInfo();
      storageDisplay.textContent = `Used: ${info.used.toFixed(2)} KB\nLimit: ${info.limit.toFixed(2)} KB\n\nStorage Items:\n${JSON.stringify(Object.keys(localStorage), null, 2)}`;
    } else if (tabName === 'performance') {
      const performanceDisplay = panel.querySelector('.performance-display');
      performanceDisplay.textContent = JSON.stringify(PerformanceMonitor.getMetrics(), null, 2);
    }
  },

  update() {
    if (!this.isOpen) return;
    this.updateTab('logs');
  }
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  Logger.info('Application initialized');
  PerformanceMonitor.mark('appStart');

  DDS.ui.initTheme();
  DDS.ui.updateOfflineBanner();
  DDS.data.generateSampleData();

  // Initialize state manager
  StateManager.init({
    theme: localStorage.getItem(CONFIG.THEME_KEY) || 'dark',
    user: DDS.auth.getUser(),
    isOnline: navigator.onLine
  });

  // Initialize debug panel (only in development)
  if (window.location.hostname === 'localhost') {
    DebugPanel.init();
    // Show debug panel toggle
    const debugToggle = document.createElement('button');
    debugToggle.id = 'debugToggle';
    debugToggle.innerHTML = '🔧';
    debugToggle.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #2563eb;
      border: none;
      color: white;
      cursor: pointer;
      z-index: 9999;
      font-size: 24px;
    `;
    debugToggle.addEventListener('click', () => DebugPanel.toggle());
    document.body.appendChild(debugToggle);
  }

  Logger.info('All modules initialized successfully');
  PerformanceMonitor.measure('Initialization', 'appStart');
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
window.addEventListener('error', (event) => {
  Logger.error('Uncaught error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  Logger.error('Unhandled promise rejection', {
    reason: event.reason
  });
});
