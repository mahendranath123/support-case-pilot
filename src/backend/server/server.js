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

// Search leads
app.get('/api/leads', (req, res) => {
  const search = req.query.q || '';
  db.query(
    'SELECT * FROM LeadDemoData WHERE ckt LIKE ? OR cust_name LIKE ?',
    [`%${search}%`, `%${search}%`],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});

// Create case
app.post('/api/cases', (req, res) => {
  const { leadCkt, ipAddress, connectivity, assignedDate, dueDate, caseRemarks, status } = req.body;
  db.query(
    'INSERT INTO cases (leadCkt, ipAddress, connectivity, assignedDate, dueDate, caseRemarks, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [leadCkt, ipAddress, connectivity, assignedDate, dueDate, caseRemarks, status],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId });
    }
  );
});

app.listen(3001, () => console.log('Backend running on port 3001'));