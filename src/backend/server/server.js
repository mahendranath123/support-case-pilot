
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: ['https://id-preview--c8c4dca3-4d96-4a24-8806-5a974490aeca.lovable.app', 'https://c8c4dca3-4d96-4a24-8806-5a974490aeca.lovableproject.com', 'http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'JeebrMum@102',
  database: 'tracker'
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
        return res.status(500).json({ error: err.message });
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
        return res.status(500).json({ error: err.message });
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
        return res.status(500).json({ error: err.message });
      }
      console.log('Case created with ID:', result.insertId);
      res.json({ id: result.insertId });
    }
  );
});

// Update case - Enhanced with better error handling
app.put('/api/cases/:id', (req, res) => {
  const caseId = req.params.id;
  const updates = req.body;
  
  console.log('Updating case:', caseId, 'with updates:', updates);
  
  // Validate case ID
  if (!caseId || isNaN(parseInt(caseId))) {
    return res.status(400).json({ error: 'Invalid case ID' });
  }
  
  // Build dynamic update query
  const updateFields = [];
  const updateValues = [];
  
  // Add lastUpdated timestamp
  updates.lastUpdated = new Date().toISOString();
  
  Object.keys(updates).forEach(key => {
    if (key !== 'id') {
      updateFields.push(`${key} = ?`);
      updateValues.push(updates[key]);
    }
  });
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }
  
  updateValues.push(parseInt(caseId));
  
  const query = `UPDATE cases SET ${updateFields.join(', ')} WHERE id = ?`;
  
  console.log('Executing update query:', query, 'with values:', updateValues);
  
  db.query(query, updateValues, (err, result) => {
    if (err) {
      console.error('Error updating case:', err);
      return res.status(500).json({ error: err.message });
    }
    
    if (result.affectedRows === 0) {
      console.log('No case found with ID:', caseId);
      return res.status(404).json({ error: 'Case not found' });
    }
    
    console.log('Case updated successfully:', result.affectedRows, 'rows affected');
    res.json({ success: true, affectedRows: result.affectedRows });
  });
});

// Delete case - Enhanced with better error handling
app.delete('/api/cases/:id', (req, res) => {
  const caseId = req.params.id;
  console.log('Deleting case:', caseId);
  
  // Validate case ID
  if (!caseId || isNaN(parseInt(caseId))) {
    return res.status(400).json({ error: 'Invalid case ID' });
  }
  
  db.query('DELETE FROM cases WHERE id = ?', [parseInt(caseId)], (err, result) => {
    if (err) {
      console.error('Error deleting case:', err);
      return res.status(500).json({ error: err.message });
    }
    
    if (result.affectedRows === 0) {
      console.log('No case found with ID:', caseId);
      return res.status(404).json({ error: 'Case not found' });
    }
    
    console.log('Case deleted successfully:', result.affectedRows, 'rows affected');
    res.json({ success: true, affectedRows: result.affectedRows });
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
        return res.status(500).json({ error: err.message });
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
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Listen on all interfaces
const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log('Server listening on all interfaces (0.0.0.0)');
  console.log('Available endpoints:');
  console.log('- GET /api/health');
  console.log('- GET /api/leads?q=search');
  console.log('- GET /api/leads/:ckt');
  console.log('- GET /api/cases');
  console.log('- POST /api/cases');
  console.log('- PUT /api/cases/:id');
  console.log('- DELETE /api/cases/:id');
});
