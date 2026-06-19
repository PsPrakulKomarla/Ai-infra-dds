/* ==========================================
   AI Infrastructure DDS - Ultimate Unified Script
   Features: Full-stack API integration, KNN on Images,
             Cascading dropdown filters, Leaflet Map integration,
             Kanban Board, Reports table, exports, error logs
========================================== */

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================
const CONFIG = {
  THEME_KEY: 'theme',
  AUTH_KEY: 'auth',
  INSPECTIONS_KEY: 'inspections',
  KNN_TRAINING_KEY: 'knn_training',
  MAX_IMAGES: 10,
  KNN_K: 5,
  DEBOUNCE_DELAY: 300,
  API_TIMEOUT: 5000,
  MAX_STORAGE_SIZE: 8 * 1024 * 1024 // 8MB
};

const SEVERITY_LEVELS = ['Low', 'Moderate', 'High', 'Very High', 'Critical'];

const SEVERITY_COLORS = {
  'Low': '#16a34a',       // Green
  'Moderate': '#f59e0b',  // Amber
  'High': '#ef4444',      // Red
  'Very High': '#991b1b', // Dark Red
  'Critical': '#7c2d12'   // Deep Crimson
};

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Completed'];
const CONTRACTORS = ['Unassigned', 'Contractor A', 'Contractor B', 'PWD Team', 'NHAI Team'];
const WEATHER_CONDITIONS = ['Sunny', 'Cloudy', 'Rainy', 'Storm', 'Monsoon'];

// ==========================================
// ADVANCED LOGGING SYSTEM
// ==========================================
const Logger = {
  logs: [],
  maxLogs: 500,

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const entry = { timestamp, level, message, data };
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) this.logs.shift();

    const logMsg = `[${timestamp}] ${level}: ${message}`;
    if (data) console.log(logMsg, data);
    else console.log(logMsg);

    // Send logs to server if online
    if (navigator.onLine) {
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      }).catch(() => {});
    }
  },
  debug(msg, data) { this.log('DEBUG', msg, data); },
  info(msg, data) { this.log('INFO', msg, data); },
  warn(msg, data) { this.log('WARN', msg, data); },
  error(msg, data) { this.log('ERROR', msg, data); }
};

// ==========================================
// INPUT VALIDATION FRAMEWORK
// ==========================================
const Validator = {
  rules: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\d{10,15}$/,
    coordinates: /^-?\d+\.?\d*$/,
    area: /^\d+(\.\d{1,2})?$/
  },
  validate(value, type) {
    if (!this.rules[type]) return true;
    return this.rules[type].test(value);
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
  marks: {},
  mark(name) { this.marks[name] = performance.now(); },
  measure(name, startMark) {
    if (!this.marks[startMark]) return;
    const duration = performance.now() - this.marks[startMark];
    Logger.info(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    return duration;
  }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const Utils = {
  debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },
  getElementByIdSafe(id) {
    return document.getElementById(id) || null;
  },
  formatCurrency(value) {
    return `₹${Math.round(value).toLocaleString()}`;
  },
  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  },
  getSeverityColor(severity) {
    return SEVERITY_COLORS[severity] || '#6b7280';
  },
  getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
};

// ==========================================
// KNN MACHINE LEARNING MODEL
// ==========================================
const KNNAlgorithm = {
  trainingData: [],

  async initializeTraining() {
    try {
      // Pull training data from server
      if (navigator.onLine) {
        const response = await fetch('/api/knn/training');
        if (response.ok) {
          this.trainingData = await response.ok ? await response.json() : [];
          localStorage.setItem(CONFIG.KNN_TRAINING_KEY, JSON.stringify(this.trainingData));
          Logger.info(`KNN model weights loaded from server: ${this.trainingData.length} samples`);
          return;
        }
      }
    } catch (e) {
      Logger.error('Failed to load KNN from server, falling back to storage', e.message);
    }

    const stored = localStorage.getItem(CONFIG.KNN_TRAINING_KEY);
    if (stored) {
      this.trainingData = JSON.parse(stored);
      Logger.info(`KNN weights loaded from localStorage: ${this.trainingData.length} samples`);
    } else {
      // Seed fallback values
      this.trainingData = [];
      const seeds = ['Low', 'Moderate', 'High', 'Very High', 'Critical'];
      for (let i = 0; i < 300; i++) {
        const sev = seeds[i % seeds.length];
        let dark = 10;
        let edge = 10;
        if (sev === 'Low') { dark = 12 + Math.random()*10; edge = 10 + Math.random()*10; }
        else if (sev === 'Moderate') { dark = 28 + Math.random()*12; edge = 24 + Math.random()*12; }
        else if (sev === 'High') { dark = 48 + Math.random()*12; edge = 46 + Math.random()*14; }
        else if (sev === 'Very High') { dark = 69 + Math.random()*10; edge = 68 + Math.random()*12; }
        else if (sev === 'Critical') { dark = 86 + Math.random()*8; edge = 84 + Math.random()*10; }
        this.trainingData.push({ dark, edge, severity: sev });
      }
      localStorage.setItem(CONFIG.KNN_TRAINING_KEY, JSON.stringify(this.trainingData));
      Logger.info('KNN weights seeded with fallback random variables.');
    }
  },

  predict(dark, edge) {
    if (this.trainingData.length === 0) {
      return { severity: 'Moderate', confidence: '50%' };
    }

    const distances = this.trainingData.map(point => {
      const dist = Math.sqrt(
        Math.pow(point.dark - dark, 2) + Math.pow(point.edge - edge, 2)
      );
      return { dist, severity: point.severity };
    });

    const nearest = distances
      .sort((a, b) => a.dist - b.dist)
      .slice(0, CONFIG.KNN_K);

    const votes = {};
    nearest.forEach(item => {
      votes[item.severity] = (votes[item.severity] || 0) + 1;
    });

    const predicted = Object.keys(votes).sort((a, b) => votes[b] - votes[a])[0];
    const confidence = ((votes[predicted] / CONFIG.KNN_K) * 100).toFixed(0);

    return { severity: predicted || 'Moderate', confidence: `${confidence}%` };
  },

  async addTrainingPoint(dark, edge, severity) {
    const point = { dark, edge, severity };
    this.trainingData.push(point);
    localStorage.setItem(CONFIG.KNN_TRAINING_KEY, JSON.stringify(this.trainingData));

    if (navigator.onLine) {
      try {
        await fetch('/api/knn/train-sample', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(point)
        });
      } catch (e) {
        Logger.warn('Offline: queued training sample save');
      }
    }
  }
};

// ==========================================
// DDS NAMESPACE
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
  dashboard: {},
  reports: {},
  kanban: {},
  export: {}
};

// ------------------------------------------
// LOCAL GEOGRAPHIC SELECTION DATA
// ------------------------------------------
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

DDS.data.geoCoordinates = {
  // States
  'Maharashtra': { center: [19.7515, 75.7139], zoom: 6 },
  'Karnataka': { center: [15.3173, 75.7139], zoom: 6 },
  'Tamil Nadu': { center: [11.1271, 78.6569], zoom: 6 },
  'Delhi': { center: [28.7041, 77.1025], zoom: 10 },
  // Districts
  'Mumbai Suburban': { center: [19.0596, 72.8295], zoom: 11 },
  'Pune': { center: [18.5204, 73.8567], zoom: 10 },
  'Bengaluru Urban': { center: [12.9698, 77.7500], zoom: 11 },
  'Mysuru': { center: [12.2958, 76.6394], zoom: 10 },
  'Chennai': { center: [13.0827, 80.2707], zoom: 11 },
  // Cities
  'Bandra': { center: [19.0596, 72.8295], zoom: 13 },
  'Khar': { center: [19.0728, 72.8362], zoom: 13 },
  'Andheri': { center: [19.1136, 72.8697], zoom: 13 },
  'Hinjewadi': { center: [18.5913, 73.7389], zoom: 13 },
  'Wakad': { center: [18.5987, 73.7681], zoom: 13 },
  'Shivajinagar': { center: [18.5312, 73.8445], zoom: 13 },
  'Whitefield': { center: [12.9698, 77.7500], zoom: 13 },
  'Electronic City': { center: [12.8456, 77.6603], zoom: 13 },
  'Yelahanka': { center: [13.1007, 77.5963], zoom: 13 },
  'Vijayanagar': { center: [12.3364, 76.6186], zoom: 13 },
  'Nazarbad': { center: [12.3094, 76.6698], zoom: 13 },
  'Guindy': { center: [13.0067, 80.2206], zoom: 13 },
  'Adyar': { center: [13.0012, 80.2565], zoom: 13 },
  'Tambaram': { center: [12.9229, 80.1275], zoom: 13 },
  'Rohini': { center: [28.7159, 77.1137], zoom: 13 },
  'Dwarka': { center: [28.5921, 77.0460], zoom: 13 },
  'Karol Bagh': { center: [28.6444, 77.1900], zoom: 13 }
};

DDS.data.infrastructureRates = {
  road: { unit: 'sqm', base: 800, labour: 0.30, material: 0.55, equipment: 0.15 },
  bridge: { unit: 'sqm', base: 1200, labour: 0.25, material: 0.60, equipment: 0.15 },
  building: { unit: 'sqm', base: 1100, labour: 0.35, material: 0.50, equipment: 0.15 },
  drainage: { unit: 'm', base: 350, labour: 0.40, material: 0.40, equipment: 0.20 },
  culvert: { unit: 'piece', base: 15000, labour: 0.30, material: 0.55, equipment: 0.15 },
  flyover: { unit: 'sqm', base: 1800, labour: 0.25, material: 0.60, equipment: 0.15 },
  footpath: { unit: 'sqm', base: 400, labour: 0.35, material: 0.50, equipment: 0.15 },
  streetlight: { unit: 'pole', base: 8000, labour: 0.20, material: 0.70, equipment: 0.10 }
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

DDS.data.severityConfig = {
  Low: { multiplier: 1.0, discount: 0.95 },
  Moderate: { multiplier: 1.4, discount: 0.90 },
  High: { multiplier: 2.0, discount: 0.82 },
  'Very High': { multiplier: 3.0, discount: 0.72 },
  Critical: { multiplier: 4.5, discount: 0.65 }
};

DDS.data.timeline = {
  Low: '1-2 Days',
  Moderate: '3-5 Days',
  High: '5-10 Days',
  'Very High': '10-20 Days',
  Critical: '20-45 Days'
};

// ------------------------------------------
// STORAGE SYNCHRONIZATION
// ------------------------------------------
DDS.storage.getAll = async (filters = {}) => {
  if (navigator.onLine) {
    try {
      const qParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/inspections?${qParams}`);
      if (response.ok) {
        const data = await response.json();
        // Only override whole storage if fetching unfiltered data
        if (Object.keys(filters).length === 0) {
          localStorage.setItem(CONFIG.INSPECTIONS_KEY, JSON.stringify(data));
        }
        return data;
      }
    } catch (e) {
      Logger.warn('Inspection fetch failed; using offline storage', e.message);
    }
  }

  // Fallback to local storage
  const stored = localStorage.getItem(CONFIG.INSPECTIONS_KEY);
  let localData = stored ? JSON.parse(stored) : [];

  // Filter client-side if offline
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      localData = localData.filter(item => item[key] === filters[key]);
    }
  });

  return localData;
};

DDS.storage.save = async (inspection) => {
  // Store locally first
  const stored = localStorage.getItem(CONFIG.INSPECTIONS_KEY);
  let localData = stored ? JSON.parse(stored) : [];
  const idx = localData.findIndex(x => x.id === inspection.id);
  if (idx !== -1) {
    localData[idx] = inspection;
  } else {
    localData.push(inspection);
  }
  localStorage.setItem(CONFIG.INSPECTIONS_KEY, JSON.stringify(localData));

  // Sync to database
  if (navigator.onLine) {
    try {
      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspection)
      });
      return response.ok;
    } catch (e) {
      Logger.warn('Offline: queued inspection save locally.');
      // Queue offline update in localStorage sync queue if needed
      return true;
    }
  }
  return true;
};

DDS.storage.delete = async (id) => {
  const stored = localStorage.getItem(CONFIG.INSPECTIONS_KEY);
  let localData = stored ? JSON.parse(stored) : [];
  localData = localData.filter(x => x.id !== id);
  localStorage.setItem(CONFIG.INSPECTIONS_KEY, JSON.stringify(localData));

  if (navigator.onLine) {
    try {
      const response = await fetch(`/api/inspections/${id}`, { method: 'DELETE' });
      return response.ok;
    } catch (e) {
      Logger.warn('Offline: queued deletion.');
    }
  }
  return true;
};

DDS.storage.updateStatus = async (id, status, assignee) => {
  const stored = localStorage.getItem(CONFIG.INSPECTIONS_KEY);
  let localData = stored ? JSON.parse(stored) : [];
  const item = localData.find(x => x.id === id);
  if (item) {
    if (status !== undefined) item.status = status;
    if (assignee !== undefined) item.assignee = assignee;
    localStorage.setItem(CONFIG.INSPECTIONS_KEY, JSON.stringify(localData));
  }

  if (navigator.onLine) {
    try {
      const body = {};
      if (status !== undefined) body.status = status;
      if (assignee !== undefined) body.assignee = assignee;

      await fetch(`/api/inspections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (e) {
      Logger.warn('Offline status update stored locally.');
    }
  }
};

// ------------------------------------------
// AUTH SERVICES
// ------------------------------------------
DDS.auth.requireLogin = () => {
  const auth = localStorage.getItem(CONFIG.AUTH_KEY);
  if (!auth) {
    window.location = 'index.html';
  }
  return auth ? JSON.parse(auth) : null;
};

DDS.auth.logout = () => {
  localStorage.removeItem(CONFIG.AUTH_KEY);
  window.location = 'index.html';
};

// ------------------------------------------
// UI & FILTERS SERVICES
// ------------------------------------------
DDS.ui.initTheme = () => {
  const btn = Utils.getElementByIdSafe('themeToggle');
  if (btn) {
    const isLight = document.body.classList.contains('light');
    btn.innerHTML = isLight ? '🌙' : '☀️';
    btn.onclick = () => {
      document.body.classList.toggle('light');
      const stateLight = document.body.classList.contains('light');
      localStorage.setItem(CONFIG.THEME_KEY, stateLight ? 'light' : 'dark');
      btn.innerHTML = stateLight ? '🌙' : '☀️';
    };
  }
};

DDS.ui.updateOfflineBanner = () => {
  const banner = Utils.getElementByIdSafe('offlineBanner');
  if (banner) {
    banner.style.display = navigator.onLine ? 'none' : 'block';
  }
};

window.addEventListener('online', DDS.ui.updateOfflineBanner);
window.addEventListener('offline', DDS.ui.updateOfflineBanner);

// Dynamic dropdown selectors builder
DDS.ui.populateDashboardFilters = () => {
  const stateSel = Utils.getElementByIdSafe('stateFilter');
  const distSel = Utils.getElementByIdSafe('districtFilter');
  const citySel = Utils.getElementByIdSafe('cityFilter');
  if (!stateSel) return;

  const locs = DDS.data.locations.India;
  
  // Populate States
  stateSel.innerHTML = '<option value="">All States</option>' + 
    Object.keys(locs).map(st => `<option value="${st}">${st}</option>`).join('');

  stateSel.onchange = () => {
    const stVal = stateSel.value;
    distSel.innerHTML = '<option value="">All Districts</option>';
    citySel.innerHTML = '<option value="">All Cities</option>';

    if (stVal && locs[stVal]) {
      distSel.innerHTML += Object.keys(locs[stVal]).map(dt => `<option value="${dt}">${dt}</option>`).join('');
    }
  };

  distSel.onchange = () => {
    const stVal = stateSel.value;
    const dtVal = distSel.value;
    citySel.innerHTML = '<option value="">All Cities</option>';

    if (stVal && dtVal && locs[stVal][dtVal]) {
      citySel.innerHTML += locs[stVal][dtVal].map(ct => `<option value="${ct}">${ct}</option>`).join('');
    }
  };
};

DDS.ui.populateManagementFilters = () => {
  const stateSel = Utils.getElementByIdSafe('stateFilter');
  const distSel = Utils.getElementByIdSafe('districtFilter');
  const citySel = Utils.getElementByIdSafe('cityFilter');
  if (!stateSel) return;

  const locs = DDS.data.locations.India;
  
  stateSel.innerHTML = '<option value="">All States</option>' + 
    Object.keys(locs).map(st => `<option value="${st}">${st}</option>`).join('');

  stateSel.onchange = () => {
    const stVal = stateSel.value;
    distSel.innerHTML = '<option value="">All Districts</option>';
    citySel.innerHTML = '<option value="">All Cities</option>';

    if (stVal && locs[stVal]) {
      distSel.innerHTML += Object.keys(locs[stVal]).map(dt => `<option value="${dt}">${dt}</option>`).join('');
    }
    applyManagementFilters();
  };

  distSel.onchange = () => {
    const stVal = stateSel.value;
    const dtVal = distSel.value;
    citySel.innerHTML = '<option value="">All Cities</option>';

    if (stVal && dtVal && locs[stVal][dtVal]) {
      citySel.innerHTML += locs[stVal][dtVal].map(ct => `<option value="${ct}">${ct}</option>`).join('');
    }
    applyManagementFilters();
  };

  citySel.onchange = () => {
    applyManagementFilters();
  };
};

// ------------------------------------------
// MAP VISUALIZATIONS
// ------------------------------------------
DDS.maps.damageMapInstance = null;
DDS.maps.trafficMapInstance = null;
DDS.maps.markerClusterGroup = null;
DDS.maps.heatLayerInstance = null;

DDS.maps.initMaps = (inspections) => {
  const damageDiv = Utils.getElementByIdSafe('damageMap');
  const trafficDiv = Utils.getElementByIdSafe('trafficMap');
  if (!damageDiv || typeof L === 'undefined') return;

  // Clear existing instances
  if (DDS.maps.damageMapInstance) {
    DDS.maps.damageMapInstance.remove();
  }
  if (DDS.maps.trafficMapInstance) {
    DDS.maps.trafficMapInstance.remove();
  }

  const defaultCenter = [20.5937, 78.9629]; // Center of India
  const defaultZoom = 5;

  // Damage Map
  DDS.maps.damageMapInstance = L.map('damageMap').setView(defaultCenter, defaultZoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors', maxZoom: 19
  }).addTo(DDS.maps.damageMapInstance);

  DDS.maps.markerClusterGroup = L.markerClusterGroup();
  DDS.maps.damageMapInstance.addLayer(DDS.maps.markerClusterGroup);

  // Traffic Map (Heatmap)
  DDS.maps.trafficMapInstance = L.map('trafficMap').setView(defaultCenter, defaultZoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors', maxZoom: 19
  }).addTo(DDS.maps.trafficMapInstance);

  DDS.maps.updateMapPoints(inspections);
};

DDS.maps.updateMapPoints = (inspections) => {
  if (!DDS.maps.damageMapInstance) return;

  DDS.maps.markerClusterGroup.clearLayers();
  const heatPoints = [];

  inspections.forEach(insp => {
    const color = Utils.getSeverityColor(insp.severity);
    const marker = L.circleMarker([insp.latitude, insp.longitude], {
      radius: 9,
      fillColor: color,
      color: '#fff',
      weight: 1.5,
      opacity: 1,
      fillOpacity: 0.85
    });

    marker.bindPopup(`
      <div style="min-width: 180px;">
        <strong style="color: ${color}; font-size: 14px;">${insp.id}</strong><br>
        <strong>Structure:</strong> ${insp.structureType}<br>
        <strong>Location:</strong> ${insp.city}, ${insp.state}<br>
        <strong>Severity:</strong> <span style="font-weight:bold; color:${color}">${insp.severity}</span><br>
        <strong>Estimated Cost:</strong> ${Utils.formatCurrency(insp.cost.finalCost || insp.cost)}<br>
        <strong>Status:</strong> ${insp.status}
      </div>
    `);

    DDS.maps.markerClusterGroup.addLayer(marker);
    
    // Weight according to severity
    const weights = { Low: 1, Moderate: 3, High: 6, 'Very High': 8, Critical: 10 };
    heatPoints.push([insp.latitude, insp.longitude, weights[insp.severity] || 3]);
  });

  // Re-render Heatmap layer
  if (DDS.maps.heatLayerInstance) {
    DDS.maps.trafficMapInstance.removeLayer(DDS.maps.heatLayerInstance);
  }

  if (typeof L.heatLayer !== 'undefined' && heatPoints.length > 0) {
    DDS.maps.heatLayerInstance = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 6,
      gradient: {
        0.1: '#16a34a',
        0.3: '#f59e0b',
        0.6: '#ef4444',
        0.9: '#7c2d12'
      }
    }).addTo(DDS.maps.trafficMapInstance);
  }

  // Auto center/zoom based on filtered items
  const stateVal = Utils.getElementByIdSafe('stateFilter')?.value || '';
  const distVal = Utils.getElementByIdSafe('districtFilter')?.value || '';
  const cityVal = Utils.getElementByIdSafe('cityFilter')?.value || '';
  
  let targetGeo = null;

  if (cityVal && DDS.data.geoCoordinates[cityVal]) {
    targetGeo = DDS.data.geoCoordinates[cityVal];
  } else if (distVal && DDS.data.geoCoordinates[distVal]) {
    targetGeo = DDS.data.geoCoordinates[distVal];
  } else if (stateVal && DDS.data.geoCoordinates[stateVal]) {
    targetGeo = DDS.data.geoCoordinates[stateVal];
  }

  if (targetGeo) {
    DDS.maps.damageMapInstance.setView(targetGeo.center, targetGeo.zoom);
    DDS.maps.trafficMapInstance.setView(targetGeo.center, targetGeo.zoom);
  } else if (inspections.length > 0) {
    const latLngs = inspections.map(x => [x.latitude, x.longitude]);
    const bounds = L.latLngBounds(latLngs);
    DDS.maps.damageMapInstance.fitBounds(bounds, { padding: [30, 30] });
    DDS.maps.trafficMapInstance.fitBounds(bounds, { padding: [30, 30] });
  } else {
    // Default to center of India
    DDS.maps.damageMapInstance.setView([20.5937, 78.9629], 5);
    DDS.maps.trafficMapInstance.setView([20.5937, 78.9629], 5);
  }
};

// ------------------------------------------
// COST ENGINE
// ------------------------------------------
DDS.cost.calculate = (params) => {
  try {
    if (!params || !params.structureType || !params.severity) return null;

    const rate = DDS.data.infrastructureRates[params.structureType];
    const sev = DDS.data.severityConfig[params.severity];
    if (!rate || !sev) return null;

    const area = parseFloat(params.area) || 0;
    const baseCost = rate.base * area;
    const severityCost = baseCost * sev.multiplier;

    const labour = Math.round(severityCost * rate.labour);
    const material = Math.round(severityCost * rate.material);
    const equipment = Math.round(severityCost * rate.equipment);
    const subtotal = labour + material + equipment;
    const gst = Math.round(subtotal * 0.18);
    const discount = Math.round(subtotal * sev.discount);
    const finalCost = subtotal + gst - discount;

    return {
      baseCost,
      labour,
      material,
      equipment,
      subtotal,
      gst,
      discount,
      finalCost,
      timeline: DDS.data.timeline[params.severity]
    };
  } catch (err) {
    Logger.error('Cost calculation error', err.message);
    return null;
  }
};

// ------------------------------------------
// IMAGE SEVERITY ANALYSIS
// ------------------------------------------
DDS.analysis.analyzeImage = (src) => {
  const canvas = Utils.getElementByIdSafe('analysisCanvas');
  const img = new Image();

  img.onload = () => {
    if (!canvas) return;
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let darkPixels = 0;
    let edgePixels = 0;

    // Fast pixel looping for edge/dark ratios
    for (let i = 0; i < data.length; i += 16) { // step by 4 pixels to increase speed
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;

      // Dark Pixel Detection
      if (gray < 85) darkPixels++;

      // Simple horizontal difference gradient for edge detection
      if (i + 4 < data.length) {
        const nextR = data[i + 4];
        const nextG = data[i + 5];
        const nextB = data[i + 6];
        const nextGray = 0.299 * nextR + 0.587 * nextG + 0.114 * nextB;
        if (Math.abs(gray - nextGray) > 35) {
          edgePixels++;
        }
      }
    }

    const totalSampled = data.length / 16;
    const darkPct = ((darkPixels / totalSampled) * 100).toFixed(2);
    const edgePct = ((edgePixels / totalSampled) * 100).toFixed(2);

    // Apply prediction
    const prediction = KNNAlgorithm.predict(parseFloat(darkPct), parseFloat(edgePct));

    const darkBox = Utils.getElementByIdSafe('darkPct');
    const edgeBox = Utils.getElementByIdSafe('edgePct');
    const confidenceBox = Utils.getElementByIdSafe('confidence');
    const predictedSeverity = Utils.getElementByIdSafe('predictedSeverity');

    if (darkBox) darkBox.value = `${darkPct}%`;
    if (edgeBox) edgeBox.value = `${edgePct}%`;
    if (confidenceBox) confidenceBox.value = prediction.confidence;
    if (predictedSeverity) {
      predictedSeverity.value = prediction.severity;
      predictedSeverity.style.backgroundColor = Utils.getSeverityColor(prediction.severity);
      predictedSeverity.style.color = '#fff';
    }

    Logger.info('AI analysis completed', { darkPct, edgePct, prediction });
  };

  img.src = src;
};

// ------------------------------------------
// DASHBOARD VIEW CONTROLLER
// ------------------------------------------
DDS.dashboard.refreshDashboard = async () => {
  PerformanceMonitor.mark('dashRefresh');
  
  const filters = {
    state: Utils.getElementByIdSafe('stateFilter')?.value || '',
    district: Utils.getElementByIdSafe('districtFilter')?.value || '',
    city: Utils.getElementByIdSafe('cityFilter')?.value || ''
  };

  const inspections = await DDS.storage.getAll(filters);

  // Update Stats Cards
  const totalReportsEl = Utils.getElementByIdSafe('totalReports');
  const totalCostEl = Utils.getElementByIdSafe('totalCost');
  const criticalCountEl = Utils.getElementByIdSafe('criticalCount');
  const progressCountEl = Utils.getElementByIdSafe('progressCount');

  const totalReports = inspections.length;
  const totalCost = inspections.reduce((a, b) => a + (b.cost.finalCost || 0), 0);
  const criticalCount = inspections.filter(x => x.severity === 'Critical').length;
  const progressCount = inspections.filter(x => x.status === 'In Progress').length;

  if (totalReportsEl) totalReportsEl.innerText = totalReports;
  if (totalCostEl) totalCostEl.innerText = Utils.formatCurrency(totalCost);
  if (criticalCountEl) criticalCountEl.innerText = criticalCount;
  if (progressCountEl) progressCountEl.innerText = progressCount;

  // Alerts List (Critical and Unassigned)
  const alertList = Utils.getElementByIdSafe('alertList');
  if (alertList) {
    const alerts = [];
    inspections.forEach(x => {
      if (x.severity === 'Critical') {
        alerts.push(`<li class="alert-red"><i class="fas fa-exclamation-circle"></i> 🚨 <strong>Critical Severity Incident:</strong> ${x.id} (${x.structureType}) at ${x.city} needs immediate dispatch.</li>`);
      }
      if (x.assignee === 'Unassigned' && x.status !== 'Completed') {
        alerts.push(`<li class="alert-orange"><i class="fas fa-user-plus"></i> ⚠ <strong>Unassigned Task:</strong> Work order ${x.id} has no contractor assigned.</li>`);
      }
    });

    alertList.innerHTML = alerts.length > 0 ? alerts.join('') : '<li class="empty-state">No critical notifications.</li>';
  }

  // Recent inspections
  const recentDiv = Utils.getElementByIdSafe('recentReports');
  if (recentDiv) {
    const html = inspections.slice(0, 5).map(x => `
      <div class="recent-item" onclick="window.location='management.html?id=${x.id}'">
        <div>
          <strong>${x.id}</strong> - ${x.structureType}
          <div class="recent-sub">${x.city}, ${x.state} | ${Utils.formatDate(x.date)}</div>
        </div>
        <span class="badge" style="background:${Utils.getSeverityColor(x.severity)}; color:white;">${x.severity}</span>
      </div>
    `).join('');
    recentDiv.innerHTML = html || '<p class="empty-state">No inspections found.</p>';
  }

  // City Heatmap Grid
  const heatmapBody = Utils.getElementByIdSafe('heatmapTableBody');
  if (heatmapBody) {
    const cityData = {};
    inspections.forEach(x => {
      if (!cityData[x.city]) {
        cityData[x.city] = { Low: 0, Moderate: 0, High: 0, 'Very High': 0, Critical: 0 };
      }
      cityData[x.city][x.severity]++;
    });

    const rows = Object.keys(cityData).map(city => {
      const data = cityData[city];
      return `
        <tr>
          <td><strong>${city}</strong></td>
          <td class="${data.Low > 0 ? 'bg-green-light' : ''}">${data.Low}</td>
          <td class="${data.Moderate > 0 ? 'bg-blue-light' : ''}">${data.Moderate}</td>
          <td class="${data.High > 0 ? 'bg-yellow-light' : ''}">${data.High}</td>
          <td class="${data['Very High'] > 0 ? 'bg-orange-light' : ''}">${data['Very High']}</td>
          <td class="${data.Critical > 0 ? 'bg-red-light' : ''}">${data.Critical}</td>
        </tr>
      `;
    }).join('');
    heatmapBody.innerHTML = rows || '<tr><td colspan="6" class="empty-state">No regional data available.</td></tr>';
  }

  // Map markers & clusters
  DDS.maps.initMaps(inspections);

  // Charts rendering
  DDS.dashboard.renderCharts(inspections);

  PerformanceMonitor.measure('Dashboard Update', 'dashRefresh');
};

DDS.dashboard.severityChartInstance = null;
DDS.dashboard.costChartInstance = null;

DDS.dashboard.renderCharts = (inspections) => {
  const sevCanvas = Utils.getElementByIdSafe('severityChart');
  const costCanvas = Utils.getElementByIdSafe('costChart');
  if (!sevCanvas || !costCanvas) return;

  // Destroy old charts to prevent duplicate canvases
  if (DDS.dashboard.severityChartInstance) DDS.dashboard.severityChartInstance.destroy();
  if (DDS.dashboard.costChartInstance) DDS.dashboard.costChartInstance.destroy();

  const isLight = document.body.classList.contains('light');
  const labelColor = isLight ? '#1f2937' : '#e5e7eb';
  const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)';

  // 1. Severity Distribution
  const severityCounts = { Low: 0, Moderate: 0, High: 0, 'Very High': 0, Critical: 0 };
  inspections.forEach(x => {
    if (severityCounts[x.severity] !== undefined) {
      severityCounts[x.severity]++;
    }
  });

  DDS.dashboard.severityChartInstance = new Chart(sevCanvas, {
    type: 'doughnut',
    data: {
      labels: Object.keys(severityCounts),
      datasets: [{
        data: Object.values(severityCounts),
        backgroundColor: Object.keys(severityCounts).map(x => Utils.getSeverityColor(x)),
        borderWidth: 1,
        borderColor: isLight ? '#fff' : '#1f2937'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom', 
          labels: { color: labelColor } 
        }
      }
    }
  });

  // 2. Cost by Structure Type
  const structureCosts = {};
  inspections.forEach(x => {
    const costVal = typeof x.cost === 'object' && x.cost !== null 
      ? (x.cost.finalCost || 0) 
      : (parseFloat(x.cost) || 0);
    structureCosts[x.structureType] = (structureCosts[x.structureType] || 0) + costVal;
  });

  const labels = Object.keys(structureCosts).map(x => x.charAt(0).toUpperCase() + x.slice(1));
  const dataValues = Object.values(structureCosts);

  DDS.dashboard.costChartInstance = new Chart(costCanvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cost allocation (₹)',
        data: dataValues,
        backgroundColor: '#2563eb',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { 
          ticks: { color: labelColor },
          grid: { color: gridColor }
        },
        x: { 
          ticks: { color: labelColor },
          grid: { color: gridColor }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
};

// ------------------------------------------
// REPORTS VIEW CONTROLLER (MANAGEMENT)
// ------------------------------------------
DDS.reports.refreshReports = async () => {
  const tbody = Utils.getElementByIdSafe('reportsTableBody');
  if (!tbody) return;

  const filters = {
    state: Utils.getElementByIdSafe('stateFilter')?.value || '',
    district: Utils.getElementByIdSafe('districtFilter')?.value || '',
    city: Utils.getElementByIdSafe('cityFilter')?.value || '',
    severity: Utils.getElementByIdSafe('severityFilter')?.value || '',
    priority: Utils.getElementByIdSafe('priorityFilter')?.value || '',
    status: Utils.getElementByIdSafe('statusFilter')?.value || '',
    assignee: Utils.getElementByIdSafe('assignmentFilter')?.value || '',
    sort: Utils.getElementByIdSafe('sortReports')?.value || 'date'
  };

  const queryText = Utils.getElementByIdSafe('searchReports')?.value.toLowerCase() || '';

  let inspections = await DDS.storage.getAll(filters);

  // Search keyword client-side
  if (queryText) {
    inspections = inspections.filter(x => 
      x.id.toLowerCase().includes(queryText) ||
      x.city.toLowerCase().includes(queryText) ||
      x.state.toLowerCase().includes(queryText) ||
      x.structureType.toLowerCase().includes(queryText) ||
      (x.notes && x.notes.toLowerCase().includes(queryText))
    );
  }

  tbody.innerHTML = inspections.map(x => {
    const sevColor = Utils.getSeverityColor(x.severity);
    return `
      <tr>
        <td><input type="checkbox" class="report-checkbox" data-id="${x.id}"></td>
        <td><strong>${x.id}</strong></td>
        <td>${Utils.formatDate(x.date)}</td>
        <td>${x.structureType.charAt(0).toUpperCase() + x.structureType.slice(1)}</td>
        <td>${x.city}, ${x.state}</td>
        <td><span class="badge" style="background:${sevColor}; color:white;">${x.severity}</span></td>
        <td><span class="badge priority-${x.priority.toLowerCase()}">${x.priority}</span></td>
        <td>
          <select class="status-inline-select" data-id="${x.id}">
            <option ${x.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
            <option ${x.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option ${x.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
        <td>
          <select class="assignee-inline-select" data-id="${x.id}">
            ${CONTRACTORS.map(c => `<option ${x.assignee === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </td>
        <td><strong>${Utils.formatCurrency(x.cost.finalCost || x.cost)}</strong></td>
        <td>${x.timeline}</td>
        <td>${x.weather}</td>
        <td>
          ${x.images && x.images.length > 0 
            ? `<button class="btn-small" onclick="DDS.reports.showGallery('${x.id}')"><i class="fas fa-image"></i> ${x.images.length}</button>` 
            : '<span class="text-muted">None</span>'
          }
        </td>
        <td>
          <button class="btn-danger btn-small" onclick="DDS.reports.deleteReport('${x.id}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');

  if (inspections.length === 0) {
    tbody.innerHTML = '<tr><td colspan="14" class="empty-state">No matching inspection reports found.</td></tr>';
  }

  // Bind inline selection events
  DDS.reports.bindInlineSelects();

  // If we are in Kanban View Mode, refresh the Kanban Board too
  const boardView = Utils.getElementByIdSafe('boardView');
  if (boardView && boardView.style.display !== 'none') {
    DDS.kanban.refreshWithData(inspections);
  }
};

DDS.reports.bindInlineSelects = () => {
  document.querySelectorAll('.status-inline-select').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const status = e.target.value;
      await DDS.storage.updateStatus(id, status, undefined);
      DDS.reports.refreshReports();
    });
  });

  document.querySelectorAll('.assignee-inline-select').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const assignee = e.target.value;
      await DDS.storage.updateStatus(id, undefined, assignee);
      DDS.reports.refreshReports();
    });
  });
};

DDS.reports.bindEvents = () => {
  const searchInput = Utils.getElementByIdSafe('searchReports');
  const sortSelect = Utils.getElementByIdSafe('sortReports');
  const selectAll = Utils.getElementByIdSafe('selectAllReports');
  const applyBulk = Utils.getElementByIdSafe('applyBulkAction');

  if (searchInput) {
    searchInput.addEventListener('input', Utils.debounce(() => {
      DDS.reports.refreshReports();
    }, CONFIG.DEBOUNCE_DELAY));
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      DDS.reports.refreshReports();
    });
  }

  // Select all checkbox
  if (selectAll) {
    selectAll.addEventListener('change', (e) => {
      document.querySelectorAll('.report-checkbox').forEach(cb => {
        cb.checked = e.target.checked;
      });
    });
  }

  // Apply bulk actions
  if (applyBulk) {
    applyBulk.addEventListener('click', async () => {
      const checkedBoxes = document.querySelectorAll('.report-checkbox:checked');
      if (checkedBoxes.length === 0) {
        alert('Please select at least one inspection report.');
        return;
      }

      const action = Utils.getElementByIdSafe('bulkAction').value;
      if (!action) {
        alert('Please select an action to apply.');
        return;
      }

      if (action === 'delete') {
        if (!confirm(`Are you sure you want to delete these ${checkedBoxes.length} reports permanently?`)) return;
      }

      for (const cb of checkedBoxes) {
        const id = cb.dataset.id;
        if (action === 'delete') {
          await DDS.storage.delete(id);
        } else if (action === 'notstarted') {
          await DDS.storage.updateStatus(id, 'Not Started', undefined);
        } else if (action === 'inprogress') {
          await DDS.storage.updateStatus(id, 'In Progress', undefined);
        } else if (action === 'completed') {
          await DDS.storage.updateStatus(id, 'Completed', undefined);
        } else if (action === 'assignA') {
          await DDS.storage.updateStatus(id, undefined, 'Contractor A');
        } else if (action === 'assignB') {
          await DDS.storage.updateStatus(id, undefined, 'Contractor B');
        } else if (action === 'assignPWD') {
          await DDS.storage.updateStatus(id, undefined, 'PWD Team');
        } else if (action === 'assignNHAI') {
          await DDS.storage.updateStatus(id, undefined, 'NHAI Team');
        }
      }

      alert('Bulk action operation completed successfully.');
      DDS.reports.refreshReports();
    });
  }

  // Lightbox close trigger
  const lightbox = Utils.getElementByIdSafe('imageLightbox');
  const close = Utils.getElementByIdSafe('closeLightbox');
  if (lightbox && close) {
    close.onclick = () => lightbox.style.display = 'none';
  }
};

DDS.reports.deleteReport = async (id) => {
  if (confirm(`Delete report ${id} permanently?`)) {
    await DDS.storage.delete(id);
    DDS.reports.refreshReports();
  }
};

DDS.reports.showGallery = async (id) => {
  const inspections = await DDS.storage.getAll();
  const insp = inspections.find(x => x.id === id);
  const container = Utils.getElementByIdSafe('galleryContainer');
  
  if (!container || !insp) return;

  if (!insp.images || insp.images.length === 0) {
    container.innerHTML = '<p class="empty-state">No images found for this inspection.</p>';
    return;
  }

  container.innerHTML = insp.images.map(imgData => `
    <div class="gallery-item">
      <img src="${imgData}" alt="Damage Image" onclick="DDS.reports.zoomImage('${imgData}')">
    </div>
  `).join('');
};

DDS.reports.zoomImage = (src) => {
  const lightbox = Utils.getElementByIdSafe('imageLightbox');
  const img = Utils.getElementByIdSafe('lightboxImage');
  if (lightbox && img) {
    img.src = src;
    lightbox.style.display = 'flex';
  }
};

// ------------------------------------------
// KANBAN VIEW CONTROLLER
// ------------------------------------------
DDS.kanban.refresh = async () => {
  const filters = {
    state: Utils.getElementByIdSafe('stateFilter')?.value || '',
    district: Utils.getElementByIdSafe('districtFilter')?.value || '',
    city: Utils.getElementByIdSafe('cityFilter')?.value || '',
    severity: Utils.getElementByIdSafe('severityFilter')?.value || '',
    priority: Utils.getElementByIdSafe('priorityFilter')?.value || '',
    status: Utils.getElementByIdSafe('statusFilter')?.value || '',
    assignee: Utils.getElementByIdSafe('assignmentFilter')?.value || ''
  };

  const inspections = await DDS.storage.getAll(filters);
  DDS.kanban.refreshWithData(inspections);
};

DDS.kanban.refreshWithData = (inspections) => {
  const nsCol = Utils.getElementByIdSafe('notStartedColumn');
  const ipCol = Utils.getElementByIdSafe('inProgressColumn');
  const cpCol = Utils.getElementByIdSafe('completedColumn');

  if (!nsCol || !ipCol || !cpCol) return;

  // Clear columns
  nsCol.innerHTML = '';
  ipCol.innerHTML = '';
  cpCol.innerHTML = '';

  let nsCount = 0, ipCount = 0, cpCount = 0, critCount = 0;
  const workload = { 'Unassigned': 0, 'Contractor A': 0, 'Contractor B': 0, 'PWD Team': 0, 'NHAI Team': 0 };
  const budget = { 'Unassigned': 0, 'Contractor A': 0, 'Contractor B': 0, 'PWD Team': 0, 'NHAI Team': 0 };

  inspections.forEach(x => {
    const cardHtml = `
      <div class="kanban-card" draggable="true" data-id="${x.id}">
        <div class="card-header">
          <strong>${x.id}</strong>
          <span class="badge" style="background:${Utils.getSeverityColor(x.severity)}; color:white;">${x.severity}</span>
        </div>
        <div class="card-body">
          <p><strong>Structure:</strong> ${x.structureType}</p>
          <p><strong>Location:</strong> ${x.city}, ${x.state}</p>
          <p><strong>Est. Cost:</strong> ${Utils.formatCurrency(x.cost.finalCost || x.cost)}</p>
          <p><strong>Assignee:</strong> ${x.assignee}</p>
        </div>
      </div>
    `;

    if (x.status === 'Not Started') {
      nsCol.innerHTML += cardHtml;
      nsCount++;
    } else if (x.status === 'In Progress') {
      ipCol.innerHTML += cardHtml;
      ipCount++;
    } else {
      cpCol.innerHTML += cardHtml;
      cpCount++;
    }

    if (x.severity === 'Critical') critCount++;
    
    // Accumulate workload details
    workload[x.assignee]++;
    budget[x.assignee] += (x.cost.finalCost || x.cost);
  });

  // Update stat counts
  const nsCountEl = Utils.getElementByIdSafe('notStartedCount');
  const ipCountEl = Utils.getElementByIdSafe('inProgressCount');
  const cpCountEl = Utils.getElementByIdSafe('completedCount');
  const critCountEl = Utils.getElementByIdSafe('criticalCount');

  if (nsCountEl) nsCountEl.innerText = nsCount;
  if (ipCountEl) ipCountEl.innerText = ipCount;
  if (cpCountEl) cpCountEl.innerText = cpCount;
  if (critCountEl) critCountEl.innerText = critCount;

  // Render Workload Allocation Grid
  const workloadContainer = Utils.getElementByIdSafe('workloadContainer');
  if (workloadContainer) {
    workloadContainer.innerHTML = Object.keys(workload).map(team => `
      <div class="card glass-card workload-item">
        <h4>${team}</h4>
        <p>Active Tasks: <strong>${workload[team]}</strong></p>
        <p>Allocated Budget: <strong>${Utils.formatCurrency(budget[team])}</strong></p>
      </div>
    `).join('');
  }

  // Re-bind drag events
  DDS.kanban.bindDragEvents();
};

DDS.kanban.bindDragEvents = () => {
  const cards = document.querySelectorAll('.kanban-card');
  const dropzones = document.querySelectorAll('.kanban-dropzone');

  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', card.dataset.id);
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
  });

  dropzones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });
    zone.addEventListener('drop', async (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      const newStatus = zone.dataset.status;
      
      if (id && newStatus) {
        await DDS.storage.updateStatus(id, newStatus, undefined);
        DDS.kanban.refresh();
      }
    });
  });
};

DDS.kanban.bindEvents = () => {
  // Bind refresh button on Kanban
  const btn = Utils.getElementByIdSafe('refreshKanban');
  if (btn) {
    btn.onclick = () => DDS.kanban.refresh();
  }
};

// ------------------------------------------
// EXPORTING AND DOWNLOADS
// ------------------------------------------
DDS.export.bindEvents = () => {
  const csvBtn = Utils.getElementByIdSafe('exportCSV');
  const excelBtn = Utils.getElementByIdSafe('exportExcel');
  const geojsonBtn = Utils.getElementByIdSafe('exportGeoJSON');
  const pdfBtn = Utils.getElementByIdSafe('exportPDF');
  const backupBtn = Utils.getElementByIdSafe('backupDatabase');

  if (csvBtn) csvBtn.onclick = () => DDS.export.toCSV();
  if (excelBtn) excelBtn.onclick = () => DDS.export.toExcel();
  if (geojsonBtn) geojsonBtn.onclick = () => DDS.export.toGeoJSON();
  if (pdfBtn) pdfBtn.onclick = () => DDS.export.toPDFSummary();
  if (backupBtn) backupBtn.onclick = () => DDS.export.backupJSON();
};

DDS.export.toCSV = async () => {
  const data = await DDS.storage.getAll();
  if (data.length === 0) return alert('No data to export.');

  const headers = ['ID', 'Date', 'Structure', 'Severity', 'State', 'City', 'Latitude', 'Longitude', 'Cost (₹)', 'Assignee', 'Status'];
  const rows = data.map(x => [
    x.id,
    x.date,
    x.structureType,
    x.severity,
    x.state,
    x.city,
    x.latitude,
    x.longitude,
    x.cost.finalCost || x.cost,
    x.assignee,
    x.status
  ]);

  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `dds_inspections_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

DDS.export.toExcel = async () => {
  const data = await DDS.storage.getAll();
  if (data.length === 0) return alert('No data to export.');

  const formatData = data.map(x => ({
    'ID': x.id,
    'Date': x.date,
    'Structure Type': x.structureType,
    'Severity': x.severity,
    'Priority': x.priority,
    'State': x.state,
    'District': x.district,
    'City': x.city,
    'Latitude': x.latitude,
    'Longitude': x.longitude,
    'Area (sqm)': x.area,
    'Timeline': x.timeline,
    'Contractor Assigned': x.assignee,
    'Status': x.status,
    'Est. Cost (₹)': x.cost.finalCost || x.cost,
    'Weather Condition': x.weather
  }));

  const worksheet = XLSX.utils.json_to_sheet(formatData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inspections");
  XLSX.writeFile(workbook, `dds_inspections_export_${Date.now()}.xlsx`);
};

DDS.export.toGeoJSON = async () => {
  const data = await DDS.storage.getAll();
  if (data.length === 0) return alert('No data to export.');

  const features = data.map(x => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [x.longitude, x.latitude]
    },
    properties: {
      id: x.id,
      structureType: x.structureType,
      severity: x.severity,
      city: x.city,
      state: x.state,
      cost: x.cost.finalCost || x.cost,
      status: x.status,
      assignee: x.assignee
    }
  }));

  const geojson = {
    type: 'FeatureCollection',
    features
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `dds_inspections_${Date.now()}.geojson`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

DDS.export.toPDFSummary = async () => {
  const element = document.getElementById('tableView') || document.body;
  if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
    alert('PDF export libraries are still loading. Please wait a few seconds and try again.');
    return;
  }

  const canvas = await html2canvas(element, { scale: 1.5 });
  const imgData = canvas.toDataURL('image/png');
  
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210; // A4 size
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`dds_summary_report_${Date.now()}.pdf`);
};

DDS.export.backupJSON = async () => {
  const inspections = await DDS.storage.getAll();
  const backup = {
    inspections,
    knn_training: KNNAlgorithm.trainingData,
    exportedAt: new Date().toISOString()
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `dds_database_backup_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

DDS.export.exportTrainingDataset = () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(KNNAlgorithm.trainingData, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", `knn_training_dataset_${Date.now()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ------------------------------------------
// INITIALIZATION
// ------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  Logger.info('Application loaded, initializing subsystems...');

  // Initialize theme
  DDS.ui.initTheme();

  // Initialize PWA Offline indicators
  DDS.ui.updateOfflineBanner();

  // Initialize KNN Model weights
  await KNNAlgorithm.initializeTraining();

  // Setup severity color auto-update on dropdown changes
  const severitySelect = Utils.getElementByIdSafe('severity') || Utils.getElementByIdSafe('overrideSeverity');
  if (severitySelect) {
    severitySelect.addEventListener('change', (e) => {
      const predBox = Utils.getElementByIdSafe('predictedSeverity');
      if (predBox) {
        predBox.value = e.target.value;
        predBox.style.backgroundColor = Utils.getSeverityColor(e.target.value);
        predBox.style.color = '#fff';
      }
    });
  }

  // Dynamic selector binding on inspect.html page
  const inspectStateSel = Utils.getElementByIdSafe('state');
  const inspectDistSel = Utils.getElementByIdSafe('district');
  const inspectCitySel = Utils.getElementByIdSafe('city');
  if (inspectStateSel && inspectDistSel && inspectCitySel) {
    const locs = DDS.data.locations.India;

    inspectStateSel.innerHTML = '<option value="">Select State</option>' +
      Object.keys(locs).map(s => `<option value="${s}">${s}</option>`).join('');

    inspectStateSel.onchange = () => {
      const st = inspectStateSel.value;
      inspectDistSel.innerHTML = '<option value="">Select District</option>';
      inspectCitySel.innerHTML = '<option value="">Select City</option>';
      if (st && locs[st]) {
        inspectDistSel.innerHTML += Object.keys(locs[st]).map(d => `<option value="${d}">${d}</option>`).join('');
      }
    };

    inspectDistSel.onchange = () => {
      const st = inspectStateSel.value;
      const dt = inspectDistSel.value;
      inspectCitySel.innerHTML = '<option value="">Select City</option>';
      if (st && dt && locs[st][dt]) {
        inspectCitySel.innerHTML += locs[st][dt].map(c => `<option value="${c}">${c}</option>`).join('');
      }
    };

    // Auto location mock coordinates
    inspectCitySel.onchange = () => {
      const latInput = Utils.getElementByIdSafe('latitude');
      const lngInput = Utils.getElementByIdSafe('longitude');
      const st = inspectStateSel.value;
      const dt = inspectDistSel.value;
      const ct = inspectCitySel.value;

      if (latInput && lngInput) {
        // Find baseline lat/lng and add tiny random noise
        let baseLat = 20.5937, baseLng = 78.9629;
        
        // Approximate coordinates mapping for mock geopoint location
        const coordMap = {
          Bandra: [19.0596, 72.8295], Khar: [19.0728, 72.8362], Andheri: [19.1136, 72.8697],
          Hinjewadi: [18.5913, 73.7389], Wakad: [18.5987, 73.7681], Shivajinagar: [18.5312, 73.8445],
          Whitefield: [12.9698, 77.7500], 'Electronic City': [12.8456, 77.6603], Yelahanka: [13.1007, 77.5963],
          Vijayanagar: [12.3364, 76.6186], Nazarbad: [12.3094, 76.6698],
          Guindy: [13.0067, 80.2206], Adyar: [13.0012, 80.2565], Tambaram: [12.9229, 80.1275],
          Rohini: [28.7159, 77.1137], Dwarka: [28.5921, 77.0460], 'Karol Bagh': [28.6444, 77.1900]
        };

        if (coordMap[ct]) {
          baseLat = coordMap[ct][0];
          baseLng = coordMap[ct][1];
        }

        latInput.value = (baseLat + (Math.random() - 0.5) * 0.005).toFixed(6);
        lngInput.value = (baseLng + (Math.random() - 0.5) * 0.005).toFixed(6);
      }
    };
  }

  // ------------------------------------------
  // BIND INSPECT FORM CONTROLS
  // ------------------------------------------
  const getLocBtn = Utils.getElementByIdSafe('getLocationBtn');
  const imageUploadInput = Utils.getElementByIdSafe('imageUpload');
  const dropZoneDiv = Utils.getElementByIdSafe('dropZone');
  const addPhotoBtn = Utils.getElementByIdSafe('addMorePhotos');
  const calcCostBtn = Utils.getElementByIdSafe('calculateBtn');
  const saveReportBtn = Utils.getElementByIdSafe('saveReportBtn');
  const pdfExportBtn = Utils.getElementByIdSafe('pdfBtn');

  if (getLocBtn) {
    getLocBtn.onclick = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const latInput = Utils.getElementByIdSafe('latitude');
          const lngInput = Utils.getElementByIdSafe('longitude');
          if (latInput) latInput.value = pos.coords.latitude.toFixed(6);
          if (lngInput) lngInput.value = pos.coords.longitude.toFixed(6);
          Logger.info('Fetched current geolocation coordinates');
        }, err => {
          alert('Failed to get geolocation automatically. Please select state and city.');
        });
      }
    };
  }

  let uploadedImagesList = [];

  const handleImageFiles = (files) => {
    Array.from(files).forEach(file => {
      if (uploadedImagesList.length >= CONFIG.MAX_IMAGES) {
        alert(`Maximum ${CONFIG.MAX_IMAGES} images allowed.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedImagesList.push(e.target.result);
        
        // Render preview
        const previewDiv = Utils.getElementByIdSafe('photoPreview');
        if (previewDiv) {
          previewDiv.innerHTML += `
            <div class="preview-item">
              <img src="${e.target.result}" alt="Preview">
            </div>
          `;
        }

        // Run pixel analysis and predict KNN
        DDS.analysis.analyzeImage(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  };

  if (imageUploadInput) {
    imageUploadInput.addEventListener('change', (e) => handleImageFiles(e.target.files));
  }

  if (dropZoneDiv) {
    dropZoneDiv.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZoneDiv.classList.add('drag-over');
    });
    dropZoneDiv.addEventListener('dragleave', () => {
      dropZoneDiv.classList.remove('drag-over');
    });
    dropZoneDiv.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZoneDiv.classList.remove('drag-over');
      handleImageFiles(e.dataTransfer.files);
    });
  }

  if (addPhotoBtn && imageUploadInput) {
    addPhotoBtn.onclick = () => imageUploadInput.click();
  }

  // Cost calculation trigger
  if (calcCostBtn) {
    calcCostBtn.onclick = () => {
      const type = Utils.getElementByIdSafe('structureType').value;
      const area = Utils.getElementByIdSafe('area').value;
      const overrideVal = Utils.getElementByIdSafe('overrideSeverity').value;
      const predVal = Utils.getElementByIdSafe('predictedSeverity').value;
      const severity = overrideVal || predVal || 'Moderate';

      if (!area || isNaN(area)) {
        alert('Please enter a valid structure quantity/area.');
        return;
      }

      const costObj = DDS.cost.calculate({ structureType: type, severity, area });
      if (!costObj) return;

      const breakdownDiv = Utils.getElementByIdSafe('costBreakdown');
      const timelineDiv = Utils.getElementByIdSafe('timelineResult');

      if (breakdownDiv) {
        breakdownDiv.innerHTML = `
          <div class="breakdown-details">
            <p>Base Construction Cost: <strong>${Utils.formatCurrency(costObj.baseCost)}</strong></p>
            <p>Labor Allocation (30%): <strong>${Utils.formatCurrency(costObj.labour)}</strong></p>
            <p>Materials Allocation (55%): <strong>${Utils.formatCurrency(costObj.material)}</strong></p>
            <p>Equipment Allocation (15%): <strong>${Utils.formatCurrency(costObj.equipment)}</strong></p>
            <hr>
            <p>Subtotal: <strong>${Utils.formatCurrency(costObj.subtotal)}</strong></p>
            <p>GST/Tax (18%): <strong>${Utils.formatCurrency(costObj.gst)}</strong></p>
            <p>Severity Rebate/Surcharge Adjustment: <strong>-${Utils.formatCurrency(costObj.discount)}</strong></p>
            <h3 style="margin-top: 10px;">Final Cost: <span class="text-success">${Utils.formatCurrency(costObj.finalCost)}</span></h3>
          </div>
        `;
      }

      if (timelineDiv) {
        timelineDiv.innerHTML = `Estimated repair timeframe is: <strong>${costObj.timeline}</strong>`;
      }
    };
  }

  // Save report trigger
  if (saveReportBtn) {
    saveReportBtn.onclick = async () => {
      const state = Utils.getElementByIdSafe('state').value;
      const district = Utils.getElementByIdSafe('district').value;
      const city = Utils.getElementByIdSafe('city').value;
      const lat = Utils.getElementByIdSafe('latitude').value;
      const lng = Utils.getElementByIdSafe('longitude').value;
      const type = Utils.getElementByIdSafe('structureType').value;
      const area = Utils.getElementByIdSafe('area').value;
      const notes = Utils.getElementByIdSafe('inspectionNotes').value;

      const overrideVal = Utils.getElementByIdSafe('overrideSeverity').value;
      const predVal = Utils.getElementByIdSafe('predictedSeverity').value;
      const severity = overrideVal || predVal || 'Moderate';

      if (!state || !city || !area) {
        alert('Please fill out all location details and structure area.');
        return;
      }

      const costObj = DDS.cost.calculate({ structureType: type, severity, area });
      if (!costObj) {
        alert('Please run cost calculations before saving.');
        return;
      }

      const id = `INS-${1000 + Math.floor(Math.random() * 9000)}`;
      const inspectionObj = {
        id,
        date: new Date().toISOString(),
        country: 'India',
        state,
        district,
        city,
        latitude: parseFloat(lat) || 0.0,
        longitude: parseFloat(lng) || 0.0,
        structureType: type,
        severity,
        area: parseFloat(area),
        priority: severity === 'Critical' || severity === 'Very High' ? 'High' : (severity === 'High' ? 'Medium' : 'Low'),
        status: 'Not Started',
        assignee: 'Unassigned',
        images: uploadedImagesList,
        cost: costObj,
        weather: Utils.getRandomItem(WEATHER_CONDITIONS),
        traffic: Utils.getRandomItem(['Free Flow', 'Moderate', 'Heavy']),
        timeline: costObj.timeline,
        notes
      };

      // Add user manual training data feedback if overridden
      const darkBox = Utils.getElementByIdSafe('darkPct');
      const edgeBox = Utils.getElementByIdSafe('edgePct');
      if (overrideVal && darkBox && edgeBox) {
        const darkVal = parseFloat(darkBox.value);
        const edgeVal = parseFloat(edgeBox.value);
        if (!isNaN(darkVal) && !isNaN(edgeVal)) {
          await KNNAlgorithm.addTrainingPoint(darkVal, edgeVal, overrideVal);
        }
      }

      const success = await DDS.storage.save(inspectionObj);
      if (success) {
        alert(`Inspection report saved successfully as ${id}!`);
        window.location = 'dashboard.html';
      } else {
        alert('Failed to save inspection report.');
      }
    };
  }

  // Export Training Dataset on Management page
  const exportTrainingBtn = Utils.getElementByIdSafe('exportTraining');
  if (exportTrainingBtn) {
    exportTrainingBtn.onclick = () => DDS.export.exportTrainingDataset();
  }

  // PDF page export on inspect page
  if (pdfExportBtn) {
    pdfExportBtn.onclick = () => DDS.export.toPDFSummary();
  }

  // Populate dynamic dashboard selector filters if available
  const stateSelDashboard = Utils.getElementByIdSafe('stateFilter');
  if (stateSelDashboard) {
    // Populate username display
    const user = DDS.auth.requireLogin();
    const userNameEl = Utils.getElementByIdSafe('userName');
    if (userNameEl && user) {
      userNameEl.innerText = `${user.name} (${user.role})`;
    }
  }

  Logger.info('All script initializations completed.');
});
