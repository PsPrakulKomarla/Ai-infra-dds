const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS inspections (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    country TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    structureType TEXT NOT NULL,
    severity TEXT NOT NULL,
    area REAL NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    assignee TEXT NOT NULL,
    images TEXT NOT NULL, -- JSON string array of base64 images
    cost TEXT NOT NULL,   -- JSON string of cost breakdown details
    weather TEXT NOT NULL,
    traffic TEXT NOT NULL,
    timeline TEXT NOT NULL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS knn_training (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dark_pct REAL NOT NULL,
    edge_pct REAL NOT NULL,
    severity TEXT NOT NULL
  );
`);

// Helper to hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Insert default Admin if not exists
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (email, password_hash, name, role, createdAt)
  VALUES (?, ?, ?, ?, ?)
`);
insertUser.run(
  'admin@dds.com',
  hashPassword('admin123'),
  'System Administrator',
  'Admin',
  new Date().toISOString()
);

// Populate 30 Inspections if table is empty
const countInspections = db.prepare('SELECT COUNT(*) AS count FROM inspections').get();

if (countInspections.count === 0) {
  console.log('Seeding 30 inspections...');

  const locations = [
    { state: 'Maharashtra', district: 'Mumbai Suburban', city: 'Bandra', lat: 19.0596, lng: 72.8295 },
    { state: 'Maharashtra', district: 'Mumbai Suburban', city: 'Khar', lat: 19.0728, lng: 72.8362 },
    { state: 'Maharashtra', district: 'Mumbai Suburban', city: 'Andheri', lat: 19.1136, lng: 72.8697 },
    { state: 'Maharashtra', district: 'Pune', city: 'Hinjewadi', lat: 18.5913, lng: 73.7389 },
    { state: 'Maharashtra', district: 'Pune', city: 'Wakad', lat: 18.5987, lng: 73.7681 },
    { state: 'Maharashtra', district: 'Pune', city: 'Shivajinagar', lat: 18.5312, lng: 73.8445 },
    { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Whitefield', lat: 12.9698, lng: 77.7500 },
    { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Electronic City', lat: 12.8456, lng: 77.6603 },
    { state: 'Karnataka', district: 'Bengaluru Urban', city: 'Yelahanka', lat: 13.1007, lng: 77.5963 },
    { state: 'Karnataka', district: 'Mysuru', city: 'Vijayanagar', lat: 12.3364, lng: 76.6186 },
    { state: 'Karnataka', district: 'Mysuru', city: 'Nazarbad', lat: 12.3094, lng: 76.6698 },
    { state: 'Tamil Nadu', district: 'Chennai', city: 'Guindy', lat: 13.0067, lng: 80.2206 },
    { state: 'Tamil Nadu', district: 'Chennai', city: 'Adyar', lat: 13.0012, lng: 80.2565 },
    { state: 'Tamil Nadu', district: 'Chennai', city: 'Tambaram', lat: 12.9229, lng: 80.1275 },
    { state: 'Delhi', district: 'Delhi', city: 'Rohini', lat: 28.7159, lng: 77.1137 },
    { state: 'Delhi', district: 'Delhi', city: 'Dwarka', lat: 28.5921, lng: 77.0460 },
    { state: 'Delhi', district: 'Delhi', city: 'Karol Bagh', lat: 28.6444, lng: 77.1900 }
  ];

  const structures = ['road', 'bridge', 'building', 'drainage', 'culvert', 'flyover', 'footpath', 'streetlight'];
  const severities = ['Low', 'Moderate', 'High', 'Very High', 'Critical'];
  const priorities = ['Low', 'Medium', 'High'];
  const statuses = ['Not Started', 'In Progress', 'Completed'];
  const assignees = ['Unassigned', 'Contractor A', 'Contractor B', 'PWD Team', 'NHAI Team'];
  const weathers = ['Sunny', 'Cloudy', 'Rainy', 'Storm', 'Monsoon'];
  const traffics = ['Free Flow', 'Moderate', 'Heavy', 'Extreme'];

  const timelineMap = {
    Low: '1-2 Days',
    Moderate: '3-5 Days',
    High: '5-10 Days',
    'Very High': '10-20 Days',
    Critical: '20-45 Days'
  };

  const baseRates = {
    road: 800,
    bridge: 1200,
    building: 1100,
    drainage: 350,
    culvert: 15000,
    flyover: 1800,
    footpath: 400,
    streetlight: 8000
  };

  const severityMultipliers = {
    Low: 1.0,
    Moderate: 1.4,
    High: 2.0,
    'Very High': 3.0,
    Critical: 4.5
  };

  const severityDiscounts = {
    Low: 0.95,
    Moderate: 0.90,
    High: 0.82,
    'Very High': 0.72,
    Critical: 0.65
  };

  const insertInspection = db.prepare(`
    INSERT INTO inspections (
      id, date, country, state, district, city, latitude, longitude,
      structureType, severity, area, priority, status, assignee,
      images, cost, weather, traffic, timeline, notes
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  for (let i = 1; i <= 30; i++) {
    const loc = locations[i % locations.length];
    const structure = structures[i % structures.length];
    const severity = severities[(i * 3) % severities.length];
    const priority = priorities[(i * 2) % priorities.length];
    const status = statuses[i % statuses.length];
    const assignee = status === 'Not Started' ? 'Unassigned' : assignees[i % assignees.length];
    const weather = weathers[i % weathers.length];
    const traffic = traffics[i % traffics.length];
    
    // Add small random noise to coordinates so they don't overlay exactly
    const lat = loc.lat + (Math.random() - 0.5) * 0.02;
    const lng = loc.lng + (Math.random() - 0.5) * 0.02;

    const area = Math.floor(Math.random() * 500) + 50;
    const base = baseRates[structure];
    const multiplier = severityMultipliers[severity];
    const discountFactor = severityDiscounts[severity];

    const baseCost = base * area;
    const severityCost = baseCost * multiplier;
    const labour = Math.round(severityCost * 0.3);
    const material = Math.round(severityCost * 0.55);
    const equipment = Math.round(severityCost * 0.15);
    const subtotal = labour + material + equipment;
    const gst = Math.round(subtotal * 0.18);
    const discount = Math.round(subtotal * discountFactor);
    const finalCost = subtotal + gst - discount;

    const costBreakdown = {
      baseCost,
      labour,
      material,
      equipment,
      subtotal,
      gst,
      discount,
      finalCost,
      timeline: timelineMap[severity]
    };

    insertInspection.run(
      `INS-${1000 + i}`,
      new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
      'India',
      loc.state,
      loc.district,
      loc.city,
      lat,
      lng,
      structure,
      severity,
      area,
      priority,
      status,
      assignee,
      JSON.stringify([]), // Empty images list for seed data
      JSON.stringify(costBreakdown),
      weather,
      traffic,
      timelineMap[severity],
      `Automated baseline inspection report for ${structure} structure in ${loc.city}.`
    );
  }
}

// Populate KNN Training Data if empty
const countKNN = db.prepare('SELECT COUNT(*) AS count FROM knn_training').get();
if (countKNN.count === 0) {
  console.log('Seeding KNN training data...');

  const insertKNN = db.prepare(`
    INSERT INTO knn_training (dark_pct, edge_pct, severity)
    VALUES (?, ?, ?)
  `);

  const seedKNNData = [];

  const addCluster = (severity, count, darkMean, darkStd, edgeMean, edgeStd) => {
    for (let i = 0; i < count; i++) {
      const u1 = Math.random() || 0.0001;
      const u2 = Math.random() || 0.0001;
      const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);

      let dark = darkMean + randStdNormal * darkStd;
      let edge = edgeMean + randStdNormal * edgeStd;

      dark = Math.max(0, Math.min(100, dark));
      edge = Math.max(0, Math.min(100, edge));

      seedKNNData.push({ dark, edge, severity });
    }
  };

  addCluster('Low', 60, 10, 4, 8, 3);
  addCluster('Moderate', 60, 25, 6, 20, 5);
  addCluster('High', 60, 45, 8, 42, 7);
  addCluster('Very High', 60, 68, 8, 62, 8);
  addCluster('Critical', 60, 85, 6, 82, 6);

  const runSeeding = db.transaction((data) => {
    for (const item of data) {
      insertKNN.run(item.dark, item.edge, item.severity);
    }
  });

  runSeeding(seedKNNData);
  console.log('KNN training data seeded successfully.');
}

module.exports = {
  db,
  hashPassword
};
