const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { db, hashPassword } = require('./database');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support base64 image uploads

// Serve frontend static assets from current directory
app.use(express.static(__dirname));

// Log file for errors
const logFilePath = path.join(__dirname, 'server_errors.log');
function logMessage(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
  const logLine = `[${timestamp}] ${level}: ${message}${dataStr}\n`;
  fs.appendFileSync(logFilePath, logLine);
}

// ----------------------------------------------------
// AUTH APIS
// ----------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const hashed = hashPassword(password);
    if (user.password_hash !== hashed) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (err) {
    logMessage('ERROR', 'Login error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const userExists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (userExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashed = hashPassword(password);
    const insert = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    insert.run(name, email, hashed, role, new Date().toISOString());

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    logMessage('ERROR', 'Registration error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------------------------------------
// INSPECTIONS APIS
// ----------------------------------------------------

app.get('/api/inspections', (req, res) => {
  try {
    // Build dynamic query based on query params
    let query = 'SELECT * FROM inspections';
    const params = [];
    const conditions = [];

    const allowedFilters = ['country', 'state', 'district', 'city', 'structureType', 'severity', 'priority', 'status', 'assignee'];
    allowedFilters.forEach(filter => {
      if (req.query[filter]) {
        conditions.push(`${filter} = ?`);
        params.push(req.query[filter]);
      }
    });

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    if (req.query.sort) {
      const allowedSort = {
        date: 'date DESC',
        cost: 'json_extract(cost, "$.finalCost") DESC',
        severity: 'CASE severity WHEN "Critical" THEN 5 WHEN "Very High" THEN 4 WHEN "High" THEN 3 WHEN "Moderate" THEN 2 WHEN "Low" THEN 1 END DESC',
        priority: 'CASE priority WHEN "Critical" THEN 5 WHEN "Very High" THEN 4 WHEN "High" THEN 3 WHEN "Medium" THEN 2 WHEN "Low" THEN 1 END DESC'
      };
      const sortBy = allowedSort[req.query.sort] || 'date DESC';
      query += ` ORDER BY ${sortBy}`;
    } else {
      query += ' ORDER BY date DESC';
    }

    const inspections = db.prepare(query).all(...params);
    
    // Parse JSON fields
    const parsedInspections = inspections.map(insp => ({
      ...insp,
      images: JSON.parse(insp.images),
      cost: JSON.parse(insp.cost)
    }));

    res.json(parsedInspections);
  } catch (err) {
    logMessage('ERROR', 'Get inspections error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/inspections', (req, res) => {
  const {
    id, date, country, state, district, city, latitude, longitude,
    structureType, severity, area, priority, status, assignee,
    images, cost, weather, traffic, timeline, notes
  } = req.body;

  if (!id || !structureType || !severity || !city) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const insert = db.prepare(`
      INSERT OR REPLACE INTO inspections (
        id, date, country, state, district, city, latitude, longitude,
        structureType, severity, area, priority, status, assignee,
        images, cost, weather, traffic, timeline, notes
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    insert.run(
      id,
      date || new Date().toISOString(),
      country || 'India',
      state,
      district,
      city,
      parseFloat(latitude) || 0.0,
      parseFloat(longitude) || 0.0,
      structureType,
      severity,
      parseFloat(area) || 0.0,
      priority || 'Medium',
      status || 'Not Started',
      assignee || 'Unassigned',
      JSON.stringify(images || []),
      JSON.stringify(cost || {}),
      weather || 'Sunny',
      traffic || 'Moderate',
      timeline || '3-5 Days',
      notes || ''
    );

    res.status(201).json({ success: true, message: 'Inspection saved successfully', id });
  } catch (err) {
    logMessage('ERROR', 'Save inspection error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/inspections/:id', (req, res) => {
  const { id } = req.params;
  const { status, assignee, severity, cost, priority, notes } = req.body;

  try {
    const insp = db.prepare('SELECT * FROM inspections WHERE id = ?').get(id);
    if (!insp) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    const updates = [];
    const params = [];

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (assignee !== undefined) {
      updates.push('assignee = ?');
      params.push(assignee);
    }
    if (severity !== undefined) {
      updates.push('severity = ?');
      params.push(severity);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }
    if (cost !== undefined) {
      updates.push('cost = ?');
      params.push(JSON.stringify(cost));
    }

    if (updates.length > 0) {
      params.push(id);
      db.prepare(`UPDATE inspections SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    }

    res.json({ success: true, message: 'Inspection updated successfully' });
  } catch (err) {
    logMessage('ERROR', 'Update inspection error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/inspections/:id', (req, res) => {
  const { id } = req.params;

  try {
    const result = db.prepare('DELETE FROM inspections WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    res.json({ success: true, message: 'Inspection deleted successfully' });
  } catch (err) {
    logMessage('ERROR', 'Delete inspection error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------------------------------------
// KNN APIS
// ----------------------------------------------------

app.get('/api/knn/training', (req, res) => {
  try {
    const data = db.prepare('SELECT dark_pct AS dark, edge_pct AS edge, severity FROM knn_training').all();
    res.json(data);
  } catch (err) {
    logMessage('ERROR', 'Get KNN training data error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/knn/training', (req, res) => {
  const samples = req.body; // Array of {dark, edge, severity}
  if (!Array.isArray(samples)) {
    return res.status(400).json({ error: 'Body must be an array of samples' });
  }

  try {
    const insert = db.prepare('INSERT INTO knn_training (dark_pct, edge_pct, severity) VALUES (?, ?, ?)');
    
    const runInsert = db.transaction((data) => {
      // Clear current table first
      db.prepare('DELETE FROM knn_training').run();
      for (const item of data) {
        insert.run(
          parseFloat(item.dark) || 0.0,
          parseFloat(item.edge) || 0.0,
          item.severity || 'Moderate'
        );
      }
    });

    runInsert(samples);
    res.json({ success: true, message: `${samples.length} samples imported successfully` });
  } catch (err) {
    logMessage('ERROR', 'Import KNN training data error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/knn/train-sample', (req, res) => {
  const { dark, edge, severity } = req.body;
  if (dark === undefined || edge === undefined || !severity) {
    return res.status(400).json({ error: 'Missing dark, edge, or severity' });
  }

  try {
    const insert = db.prepare('INSERT INTO knn_training (dark_pct, edge_pct, severity) VALUES (?, ?, ?)');
    insert.run(parseFloat(dark), parseFloat(edge), severity);
    res.json({ success: true, message: 'Training sample added successfully' });
  } catch (err) {
    logMessage('ERROR', 'Add training sample error', { error: err.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------------------------------------
// LOGGER API
// ----------------------------------------------------

app.post('/api/logs', (req, res) => {
  const { timestamp, level, message, data } = req.body;
  if (!message || !level) {
    return res.status(400).json({ error: 'Missing level or message' });
  }

  try {
    const formattedDate = timestamp || new Date().toISOString();
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    console.log(`[CLIENT-LOG][${formattedDate}] ${level}: ${message}${dataStr}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to write log' });
  }
});

// Error fallback
app.use((err, req, res, next) => {
  logMessage('ERROR', 'Express error handler caught error', { message: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`AI Infrastructure DDS full-stack server running!`);
  console.log(`Local Access: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
