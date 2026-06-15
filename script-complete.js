/* ==========================================
   AI Infrastructure DDS - Complete Enhanced Version
   Features: KNN, Maps, Heatmaps, Severity Colors, Smooth UI
========================================== */

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================
const CONFIG = {
  THEME_KEY: 'theme',
  AUTH_KEY: 'auth',
  INSPECTIONS_KEY: 'inspections',
  MAX_IMAGES: 10,
  TRAINING_SAMPLES: 300,
  KNN_K: 5,
  DEBOUNCE_DELAY: 300,
  WEATHER_UPDATE_INTERVAL: 5000,
  SCROLL_THRESHOLD: 50,
  MAX_STORAGE_SIZE: 8 * 1024 * 1024,
  API_TIMEOUT: 5000,
};

const SEVERITY_LEVELS = ['Low', 'Moderate', 'High', 'Very High', 'Critical'];
const SEVERITY_COLORS = {
  'Low': '#16a34a',           // Green
  'Moderate': '#f59e0b',      // Orange
  'High': '#ef4444',          // Red
  'Very High': '#991b1b',     // Dark Red
  'Critical': '#7c2d12'       // Crimson
};

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Completed'];
const CONTRACTORS = ['Unassigned', 'Contractor A', 'Contractor B', 'PWD Team', 'NHAI Team'];
const WEATHER_CONDITIONS = ['Sunny', 'Cloudy', 'Rainy', 'Storm', 'Monsoon'];

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
      console.warn(`Invalid selector: ${selector}`);
      return null;
    }
  },

  querySelectorAllSafe(selector) {
    try {
      return Array.from(document.querySelectorAll(selector));
    } catch (e) {
      console.warn(`Invalid selector: ${selector}`);
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

  getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  },

  isMobile() {
    return window.innerWidth < 768;
  },

  isOnline() {
    return navigator.onLine;
  },

  isDarkMode() {
    return localStorage.getItem(CONFIG.THEME_KEY) !== 'light';
  },

  getSeverityColor(severity) {
    return SEVERITY_COLORS[severity] || '#6b7280';
  }
};

// ==========================================
// KNN ALGORITHM (Complete Implementation)
// ==========================================
const KNNAlgorithm = {
  trainingData: [],

  // Initialize training data
  initializeTraining() {
    const stored = localStorage.getItem('knn_training');
    if (stored) {
      this.trainingData = JSON.parse(stored);
      return;
    }

    // Generate training data from sample inspections
    const inspections = DDS.storage.get(CONFIG.INSPECTIONS_KEY, []);
    this.trainingData = inspections.map(insp => ({
      features: [insp.area / 1000, insp.latitude, insp.longitude],
      severity: insp.severity,
      label: insp.id
    })).slice(0, CONFIG.TRAINING_SAMPLES);

    if (this.trainingData.length === 0) {
      this.trainingData = this.generateSyntheticData(CONFIG.TRAINING_SAMPLES);
    }

    localStorage.setItem('knn_training', JSON.stringify(this.trainingData));
  },

  // Generate synthetic training data
  generateSyntheticData(count) {
    const data = [];
    for (let i = 0; i < count; i++) {
      data.push({
        features: [Math.random() * 1000, 10 + Math.random() * 20, 70 + Math.random() * 10],
        severity: Utils.getRandomItem(SEVERITY_LEVELS),
        label: `SYN-${i}`
      });
    }
    return data;
  },

  // Calculate Euclidean distance
  euclideanDistance(point1, point2) {
    return Math.sqrt(
      point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0)
    );
  },

  // Predict severity using KNN
  predict(features) {
    if (this.trainingData.length === 0) {
      this.initializeTraining();
    }

    // Calculate distances to all training points
    const distances = this.trainingData.map(point => ({
      distance: this.euclideanDistance(features, point.features),
      severity: point.severity
    }));

    // Sort by distance and get K nearest
    const nearest = distances
      .sort((a, b) => a.distance - b.distance)
      .slice(0, CONFIG.KNN_K);

    // Count severity votes
    const votes = {};
    nearest.forEach(item => {
      votes[item.severity] = (votes[item.severity] || 0) + 1;
    });

    // Get most common severity
    const predictedSeverity = Object.keys(votes).sort((a, b) => votes[b] - votes[a])[0];
    const confidence = (votes[predictedSeverity] / CONFIG.KNN_K * 100).toFixed(0);

    return { severity: predictedSeverity || 'Moderate', confidence: `${confidence}%` };
  },

  // Train with new data
  trainWithNewData(features, severity) {
    this.trainingData.push({ features, severity, label: `TRAIN-${Date.now()}` });
    if (this.trainingData.length > CONFIG.TRAINING_SAMPLES * 2) {
      this.trainingData = this.trainingData.slice(-CONFIG.TRAINING_SAMPLES);
    }
    localStorage.setItem('knn_training', JSON.stringify(this.trainingData));
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
  reports: {},
  kanban: {},
  export: {},
  cache: new Map(),
  version: '2.2.0',
  buildDate: new Date().toISOString()
};

// Initialize theme
if (!localStorage.getItem(CONFIG.THEME_KEY)) {
  localStorage.setItem(CONFIG.THEME_KEY, 'dark');
}

// ==========================================
// STORAGE HELPERS
// ==========================================
DDS.storage.get = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    return JSON.parse(data) || fallback;
  } catch (err) {
    console.error(`Storage get error for key ${key}:`, err);
    return fallback;
  }
};

DDS.storage.set = (key, val, shouldRedirect = false) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    if (shouldRedirect) {
      window.location.href = 'dashboard.html';
    }
  } catch (err) {
    console.error(`Storage set error for key ${key}:`, err);
  }
};

// ==========================================
// AUTH
// ==========================================
DDS.auth.requireLogin = () => {
  const auth = DDS.storage.get(CONFIG.AUTH_KEY, null);
  if (!auth) {
    window.location = 'index.html';
  }
  return auth;
};

DDS.auth.logout = () => {
  try {
    localStorage.removeItem(CONFIG.AUTH_KEY);
    window.location = 'index.html';
  } catch (err) {
    console.error('Logout error', err);
  }
};

// ==========================================
// THEME
// ==========================================
DDS.ui.initTheme = () => {
  const theme = localStorage.getItem(CONFIG.THEME_KEY) || 'dark';
  if (theme === 'light') {
    document.body.classList.add('light');
  }
  DDS.ui.updateThemeButton(theme);
};

DDS.ui.updateThemeButton = (theme) => {
  const btn = Utils.getElementByIdSafe('themeToggle');
  if (btn) {
    btn.innerHTML = theme === 'light' ? '🌙' : '☀️';
  }
};

DDS.ui.toggleTheme = () => {
  document.body.classList.toggle('light');
  const isDark = !document.body.classList.contains('light');
  localStorage.setItem(CONFIG.THEME_KEY, isDark ? 'dark' : 'light');
  DDS.ui.updateThemeButton(isDark ? 'dark' : 'light');
};

// ==========================================
// OFFLINE BANNER
// ==========================================
DDS.ui.updateOfflineBanner = () => {
  const banner = Utils.getElementByIdSafe('offlineBanner');
  if (banner) {
    banner.style.display = navigator.onLine ? 'none' : 'block';
  }
};

['online', 'offline'].forEach(event => {
  window.addEventListener(event, DDS.ui.updateOfflineBanner);
});

// ==========================================
// DATA STRUCTURES
// ==========================================
DDS.data.locations = {
  India: {
    Maharashtra: {
      'Mumbai Suburban': { lat: 19.0596, lng: 72.8295, cities: ['Khar', 'Bandra', 'Andheri'] },
      Pune: { lat: 18.5204, lng: 73.8567, cities: ['Hinjewadi', 'Wakad', 'Shivajinagar'] }
    },
    Karnataka: {
      'Bengaluru Urban': { lat: 12.9698, lng: 77.7500, cities: ['Whitefield', 'Electronic City', 'Yelahanka'] },
      Mysuru: { lat: 12.2958, lng: 76.6394, cities: ['Vijayanagar', 'Nazarbad'] }
    },
    'Tamil Nadu': {
      Chennai: { lat: 13.0067, lng: 80.2206, cities: ['Guindy', 'Adyar', 'Tambaram'] }
    },
    Delhi: {
      Delhi: { lat: 28.7041, lng: 77.1025, cities: ['Rohini', 'Dwarka', 'Karol Bagh'] }
    }
  }
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

DDS.data.severityConfig = {
  'Low': { multiplier: 1.0, discount: 0.95, score: 2 },
  'Moderate': { multiplier: 1.4, discount: 0.90, score: 5 },
  'High': { multiplier: 2.0, discount: 0.82, score: 10 },
  'Very High': { multiplier: 3.0, discount: 0.72, score: 15 },
  'Critical': { multiplier: 4.5, discount: 0.65, score: 20 }
};

DDS.data.timeline = {
  'Low': '1-2 Days',
  'Moderate': '3-5 Days',
  'High': '5-10 Days',
  'Very High': '10-20 Days',
  'Critical': '20-45 Days'
};

// ==========================================
// SAMPLE DATA GENERATOR
// ==========================================
DDS.data.generateSampleData = () => {
  const existing = DDS.storage.get(CONFIG.INSPECTIONS_KEY, []);
  if (existing.length > 0) return;

  const locations = [];
  Object.keys(DDS.data.locations.India).forEach(state => {
    Object.keys(DDS.data.locations.India[state]).forEach(district => {
      const loc = DDS.data.locations.India[state][district];
      locations.push({ state, district, ...loc });
    });
  });

  const structures = Object.keys(DDS.data.infrastructureRates);
  const inspections = [];

  for (let i = 1; i <= 30; i++) {
    const loc = Utils.getRandomItem(locations);
    const severity = Utils.getRandomItem(SEVERITY_LEVELS);
    const structure = Utils.getRandomItem(structures);

    inspections.push({
      id: `INS-${1000 + i}`,
      date: new Date().toISOString(),
      country: 'India',
      state: loc.state,
      district: loc.district,
      city: Utils.getRandomItem(loc.cities),
      latitude: loc.lat + (Math.random() - 0.5) * 0.1,
      longitude: loc.lng + (Math.random() - 0.5) * 0.1,
      structureType: structure,
      severity,
      area: Math.floor(Math.random() * 1000) + 100,
      priority: Utils.getRandomItem(['Low', 'Medium', 'High']),
      status: Utils.getRandomItem(STATUS_OPTIONS),
      assignee: Utils.getRandomItem(CONTRACTORS),
      cost: Math.floor(Math.random() * 500000) + 50000,
      timeline: DDS.data.timeline[severity],
      notes: `Sample inspection for ${structure} in ${loc.city}`
    });
  }

  DDS.storage.set(CONFIG.INSPECTIONS_KEY, inspections, false);
};

// ==========================================
// MAP FUNCTIONS
// ==========================================
DDS.maps.mapInstance = null;
DDS.maps.heatLayer = null;
DDS.maps.markersLayer = null;

DDS.maps.initMap = (elementId = 'map') => {
  const mapElement = Utils.getElementByIdSafe(elementId);
  if (!mapElement || typeof L === 'undefined') {
    console.warn('Leaflet not loaded or map element not found');
    return;
  }

  if (DDS.maps.mapInstance) {
    DDS.maps.mapInstance.remove();
  }

  // Default center (India)
  const defaultCenter = [20.5937, 78.9629];

  DDS.maps.mapInstance = L.map(elementId).setView(defaultCenter, 5);

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(DDS.maps.mapInstance);

  // Initialize layers
  DDS.maps.markersLayer = L.layerGroup().addTo(DDS.maps.mapInstance);

  console.log('Map initialized successfully');
  return DDS.maps.mapInstance;
};

DDS.maps.addMarkers = (inspections) => {
  if (!DDS.maps.mapInstance || !DDS.maps.markersLayer) return;

  DDS.maps.markersLayer.clearLayers();
  const heatData = [];

  inspections.forEach(insp => {
    const color = Utils.getSeverityColor(insp.severity);
    const marker = L.circleMarker([insp.latitude, insp.longitude], {
      radius: 8,
      fillColor: color,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    });

    marker.bindPopup(`
      <div style="min-width: 200px;">
        <strong>${insp.id}</strong><br>
        <strong>Severity:</strong> <span style="color:${color}">${insp.severity}</span><br>
        <strong>Structure:</strong> ${insp.structureType}<br>
        <strong>Location:</strong> ${insp.city}, ${insp.state}<br>
        <strong>Cost:</strong> ${Utils.formatCurrency(insp.cost)}<br>
        <strong>Status:</strong> ${insp.status}
      </div>
    `);

    DDS.maps.markersLayer.addLayer(marker);
    heatData.push([insp.latitude, insp.longitude, DDS.data.severityConfig[insp.severity].score]);
  });

  // Add heatmap layer
  if (DDS.maps.heatLayer) {
    DDS.maps.mapInstance.removeLayer(DDS.maps.heatLayer);
  }

  if (typeof L.heatLayer !== 'undefined' && heatData.length > 0) {
    DDS.maps.heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 1,
      gradient: {
        0.0: '#16a34a',      // Green
        0.25: '#f59e0b',     // Orange
        0.5: '#ef4444',      // Red
        0.75: '#991b1b',     // Dark Red
        1.0: '#7c2d12'       // Crimson
      }
    }).addTo(DDS.maps.mapInstance);
  }
};

DDS.maps.zoomToLocation = (latitude, longitude) => {
  if (DDS.maps.mapInstance) {
    DDS.maps.mapInstance.setView([latitude, longitude], 10);
  }
};

DDS.maps.setStateView = (state) => {
  const loc = DDS.data.locations.India[state];
  if (loc) {
    const districts = Object.values(loc);
    const center = districts[0];
    DDS.maps.zoomToLocation(center.lat, center.lng);
  }
};

// ==========================================
// CASCADING SELECTORS
// ==========================================
DDS.ui.populateStateSelect = () => {
  const stateSelect = Utils.getElementByIdSafe('state');
  if (!stateSelect) return;

  const states = Object.keys(DDS.data.locations.India);
  stateSelect.innerHTML = '<option value="">Select State</option>' +
    states.map(state => `<option value="${state}">${state}</option>`).join('');

  stateSelect.addEventListener('change', DDS.ui.populateDistrictSelect);
};

DDS.ui.populateDistrictSelect = () => {
  const stateSelect = Utils.getElementByIdSafe('state');
  const districtSelect = Utils.getElementByIdSafe('district');
  const state = stateSelect?.value;

  if (!districtSelect || !state) return;

  const districts = Object.keys(DDS.data.locations.India[state] || {});
  districtSelect.innerHTML = '<option value="">Select District</option>' +
    districts.map(d => `<option value="${d}">${d}</option>`).join('');

  districtSelect.addEventListener('change', DDS.ui.populateCitySelect);
};

DDS.ui.populateCitySelect = () => {
  const stateSelect = Utils.getElementByIdSafe('state');
  const districtSelect = Utils.getElementByIdSafe('district');
  const citySelect = Utils.getElementByIdSafe('city');
  const state = stateSelect?.value;
  const district = districtSelect?.value;

  if (!citySelect || !state || !district) return;

  const loc = DDS.data.locations.India[state]?.[district];
  if (!loc) return;

  citySelect.innerHTML = '<option value="">Select City</option>' +
    loc.cities.map(c => `<option value="${c}">${c}</option>`).join('');

  citySelect.addEventListener('change', () => {
    if (loc) {
      DDS.maps.zoomToLocation(loc.lat, loc.lng);
    }
  });
};

// ==========================================
// IMAGE ANALYSIS & KNN
// ==========================================
DDS.analysis.images = [];

DDS.analysis.handleImages = (files) => {
  Array.from(files).forEach(file => {
    if (DDS.analysis.images.length >= CONFIG.MAX_IMAGES) {
      alert(`Maximum ${CONFIG.MAX_IMAGES} photos allowed`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      DDS.analysis.images.push(e.target.result);
      DDS.analysis.analyzeImage(e.target.result);
    };
    reader.readAsDataURL(file);
  });
};

DDS.analysis.analyzeImage = (imageData) => {
  // Extract pixel data and analyze
  const canvas = document.createElement('canvas');
  const img = new Image();

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Simple pixel analysis
    let darkPixels = 0, edgePixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = (r + g + b) / 3;

      if (gray < 100) darkPixels++;
      if (Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r) > 150) edgePixels++;
    }

    const darkPct = (darkPixels / (data.length / 4)) * 100;
    const edgePct = (edgePixels / (data.length / 4)) * 100;

    // Use KNN to predict severity
    const area = parseFloat(Utils.getElementByIdSafe('area')?.value || 100);
    const lat = parseFloat(Utils.getElementByIdSafe('latitude')?.value || 0);
    const lng = parseFloat(Utils.getElementByIdSafe('longitude')?.value || 0);

    const prediction = KNNAlgorithm.predict([area, lat, lng]);

    // Display results
    const darkBox = Utils.getElementByIdSafe('darkPct');
    const edgeBox = Utils.getElementByIdSafe('edgePct');
    const sevBox = Utils.getElementByIdSafe('predictedSeverity');
    const confBox = Utils.getElementByIdSafe('confidence');

    if (darkBox) darkBox.value = darkPct.toFixed(2) + '%';
    if (edgeBox) edgeBox.value = edgePct.toFixed(2) + '%';
    if (sevBox) sevBox.value = prediction.severity;
    if (confBox) confBox.value = prediction.confidence;

    // Update severity box color
    DDS.analysis.updateSeverityDisplay(prediction.severity);

    // Train KNN with this data
    KNNAlgorithm.trainWithNewData([area, lat, lng], prediction.severity);
  };

  img.src = imageData;
};

DDS.analysis.updateSeverityDisplay = (severity) => {
  const sevBox = Utils.getElementByIdSafe('predictedSeverity');
  if (sevBox) {
    sevBox.style.backgroundColor = Utils.getSeverityColor(severity);
    sevBox.style.color = '#fff';
    sevBox.style.borderColor = Utils.getSeverityColor(severity);
    sevBox.style.transition = 'all 0.3s ease';
  }
};

// ==========================================
// COST CALCULATION
// ==========================================
DDS.cost.calculate = (params) => {
  try {
    if (!params?.structureType || !params?.severity) return null;

    const structure = DDS.data.infrastructureRates[params.structureType];
    if (!structure) return null;

    const area = parseFloat(params.area) || 100;
    const config = DDS.data.severityConfig[params.severity];

    if (!config) return null;

    const baseCost = structure.base * area;
    const severityCost = baseCost * config.multiplier;
    const labour = severityCost * structure.labour;
    const material = severityCost * structure.material;
    const equipment = severityCost * structure.equipment;
    const subtotal = labour + material + equipment;
    const gst = subtotal * 0.18;
    const discount = subtotal * config.discount;
    const finalCost = subtotal + gst - discount;

    return {
      baseCost: Math.round(baseCost),
      labour: Math.round(labour),
      material: Math.round(material),
      equipment: Math.round(equipment),
      subtotal: Math.round(subtotal),
      gst: Math.round(gst),
      discount: Math.round(discount),
      finalCost: Math.round(finalCost),
      timeline: DDS.data.timeline[params.severity]
    };
  } catch (err) {
    console.error('Cost calculation error', err);
    return null;
  }
};

// ==========================================
// INSPECTION CARD BUILDER WITH SEVERITY COLORS
// ==========================================
DDS.reports.buildInspectionCard = (insp) => {
  const severityColor = Utils.getSeverityColor(insp.severity);
  
  return `
    <div class="inspection-card" style="border-left: 5px solid ${severityColor}; box-shadow: 0 0 10px ${severityColor}33;">
      <div class="card-header" style="background: linear-gradient(135deg, ${severityColor}22, ${severityColor}11); border-bottom: 2px solid ${severityColor}">
        <h3>${insp.id}</h3>
        <span class="severity-badge" style="background: ${severityColor}; color: white; padding: 4px 12px; border-radius: 20px;">
          ${insp.severity}
        </span>
      </div>
      <div class="card-body">
        <p><strong>Location:</strong> ${insp.city}, ${insp.state}</p>
        <p><strong>Structure:</strong> ${insp.structureType}</p>
        <p><strong>Status:</strong> ${insp.status}</p>
        <p><strong>Cost:</strong> ${Utils.formatCurrency(insp.cost)}</p>
        <p><strong>Area:</strong> ${insp.area} sqm</p>
        <p><strong>Timeline:</strong> ${insp.timeline}</p>
        <p><strong>Assignee:</strong> ${insp.assignee}</p>
      </div>
    </div>
  `;
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DDS v2.2.0 Initializing...');

  DDS.ui.initTheme();
  DDS.ui.updateOfflineBanner();
  DDS.data.generateSampleData();

  // Initialize KNN
  KNNAlgorithm.initializeTraining();

  // Initialize maps if on dashboard
  if (document.getElementById('map')) {
    setTimeout(() => DDS.maps.initMap('map'), 500);
    const inspections = DDS.storage.get(CONFIG.INSPECTIONS_KEY, []);
    if (inspections.length > 0) {
      DDS.maps.addMarkers(inspections);
    }
  }

  // Initialize cascading selectors if on inspect page
  if (document.getElementById('state')) {
    DDS.ui.populateStateSelect();
  }

  // Setup severity color auto-update
  const severitySelect = Utils.getElementByIdSafe('structureType') || Utils.getElementByIdSafe('severity');
  if (severitySelect) {
    severitySelect.addEventListener('change', (e) => {
      if (e.target.id.includes('severity')) {
        DDS.analysis.updateSeverityDisplay(e.target.value);
      }
    });
  }

  console.log('✅ DDS initialized successfully');
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
window.addEventListener('error', (event) => {
  console.error('Error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
});
