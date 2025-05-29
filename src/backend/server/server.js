
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // <-- change this
  password: 'JeebrMum@102',  // <-- change this
  database: 'tracker'      // <-- change this
});

// Test database connection
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Enhanced search leads with multiple field support
app.get('/api/leads', (req, res) => {
  const search = req.query.q || '';
  console.log('Searching leads for:', search);
  
  // Enhanced search across multiple fields
  const searchQuery = `
    SELECT * FROM LeadDemoData 
    WHERE ckt LIKE ? 
       OR cust_name LIKE ? 
       OR contact_name LIKE ?
       OR email_id LIKE ?
       OR sales_person LIKE ?
       OR address LIKE ?
    ORDER BY ckt ASC
    LIMIT 50
  `;
  
  const searchTerm = `%${search}%`;
  
  db.query(
    searchQuery,
    [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm],
    (err, results) => {
      if (err) {
        console.error('Error searching leads:', err);
        return res.status(500).json({ error: err });
      }
      console.log('Found leads:', results.length);
      res.json(results);
    }
  );
});

// Get all cases
app.get('/api/cases', (req, res) => {
  console.log('Fetching all cases');
  db.query(
    'SELECT * FROM cases ORDER BY createdAt DESC',
    (err, results) => {
      if (err) {
        console.error('Error fetching cases:', err);
        return res.status(500).json({ error: err });
      }
      console.log('Found cases:', results.length);
      res.json(results);
    }
  );
});

// Create case
app.post('/api/cases', (req, res) => {
  const { leadCkt, ipAddress, connectivity, assignedDate, dueDate, caseRemarks, status } = req.body;
  console.log('Creating case for:', leadCkt);
  
  const createdAt = new Date().toISOString();
  const lastUpdated = createdAt;
  
  db.query(
    'INSERT INTO cases (leadCkt, ipAddress, connectivity, assignedDate, dueDate, caseRemarks, status, createdAt, lastUpdated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [leadCkt, ipAddress, connectivity, assignedDate, dueDate, caseRemarks, status, createdAt, lastUpdated],
    (err, result) => {
      if (err) {
        console.error('Error creating case:', err);
        return res.status(500).json({ error: err });
      }
      console.log('Case created with ID:', result.insertId);
      res.json({ id: result.insertId });
    }
  );
});

// Update case
app.put('/api/cases/:id', (req, res) => {
  const caseId = req.params.id;
  const updates = req.body;
  
  console.log('Updating case:', caseId, updates);
  
  // Build dynamic update query
  const updateFields = [];
  const updateValues = [];
  
  Object.keys(updates).forEach(key => {
    if (key !== 'id') {
      updateFields.push(`${key} = ?`);
      updateValues.push(updates[key]);
    }
  });
  
  updateValues.push(caseId);
  
  const query = `UPDATE cases SET ${updateFields.join(', ')} WHERE id = ?`;
  
  db.query(query, updateValues, (err, result) => {
    if (err) {
      console.error('Error updating case:', err);
      return res.status(500).json({ error: err });
    }
    console.log('Case updated:', result.affectedRows, 'rows affected');
    res.json({ success: true });
  });
});

// Delete case
app.delete('/api/cases/:id', (req, res) => {
  const caseId = req.params.id;
  console.log('Deleting case:', caseId);
  
  db.query('DELETE FROM cases WHERE id = ?', [caseId], (err, result) => {
    if (err) {
      console.error('Error deleting case:', err);
      return res.status(500).json({ error: err });
    }
    console.log('Case deleted:', result.affectedRows, 'rows affected');
    res.json({ success: true });
  });
});

// Get lead details by circuit number (for case creation)
app.get('/api/leads/:ckt', (req, res) => {
  const ckt = req.params.ckt;
  console.log('Fetching lead details for CKT:', ckt);
  
  db.query(
    'SELECT * FROM LeadDemoData WHERE ckt = ?',
    [ckt],
    (err, results) => {
      if (err) {
        console.error('Error fetching lead details:', err);
        return res.status(500).json({ error: err });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Lead not found' });
      }
      
      console.log('Found lead details for:', ckt);
      res.json(results[0]);
    }
  );
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

app.listen(3001, () => {
  console.log('Backend server running on port 3001');
  console.log('Available endpoints:');
  console.log('- GET /api/health');
  console.log('- GET /api/leads?q=search');
  console.log('- GET /api/leads/:ckt');
  console.log('- GET /api/cases');
  console.log('- POST /api/cases');
  console.log('- PUT /api/cases/:id');
  console.log('- DELETE /api/cases/:id');
});
