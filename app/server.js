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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
