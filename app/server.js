const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'mydb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    res.status(200).json({ 
      status: 'ready', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Readiness check failed:', error);
    res.status(503).json({ 
      status: 'not ready', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Metrics endpoint (optionnel mais utile)
app.get('/metrics', async (req, res) => {
  try {
    const [poolStatus] = await pool.query(
      'SHOW STATUS WHERE Variable_name IN ("Threads_connected", "Max_used_connections")'
    );
    const [dbSize] = await pool.query(
      `SELECT table_schema AS "database", 
       SUM(data_length + index_length) / 1024 / 1024 AS "size_mb" 
       FROM information_schema.tables 
       WHERE table_schema = ? 
       GROUP BY table_schema`,
      [process.env.DB_NAME || 'mydb']
    );
    
    res.json({
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        poolStatus,
        size: dbSize
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Routes for Note Manager

// Get all pages
app.get('/api/pages', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, title, updated_at FROM pages ORDER BY updated_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get a specific page by ID
app.get('/api/pages/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM pages WHERE id = ?', [req.params.id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Page not found' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create a new page
app.post('/api/pages', async (req, res) => {
  try {
    const { title, content } = req.body;
    const [result] = await pool.query(
      'INSERT INTO pages (title, content) VALUES (?, ?)',
      [title || 'Untitled', content || '']
    );
    const [newPage] = await pool.query('SELECT * FROM pages WHERE id = ?', [result.insertId]);
    res.status(201).json(newPage[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update a page
app.put('/api/pages/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    await pool.query(
      'UPDATE pages SET title = ?, content = ? WHERE id = ?',
      [title, content, req.params.id]
    );
    const [updatedPage] = await pool.query('SELECT * FROM pages WHERE id = ?', [req.params.id]);
    if (updatedPage.length > 0) {
      res.json(updatedPage[0]);
    } else {
      res.status(404).json({ error: 'Page not found' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete a page
app.delete('/api/pages/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM pages WHERE id = ?', [req.params.id]);
    if (result.affectedRows > 0) {
      res.json({ message: 'Page deleted successfully' });
    } else {
      res.status(404).json({ error: 'Page not found' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Serve index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
