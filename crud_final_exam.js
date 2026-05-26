require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Database Connection Pool
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

// Initialize Database
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create students table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS students (
        student_id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        course VARCHAR(100) NOT NULL,
        year_level INT NOT NULL,
        email_address VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await connection.execute(createTableQuery);
    connection.release();
    console.log('✓ Database initialized successfully');
    console.log('✓ Students table ready');
  } catch (error) {
    console.error('✗ Database initialization error:', error.message);
    process.exit(1);
  }
}

// Test Database Connection
pool.getConnection()
  .then(connection => {
    console.log('✓ MySQL Database Connected Successfully!');
    connection.release();
  })
  .catch(error => {
    console.error('✗ Database Connection Error:', error.message);
    process.exit(1);
  });

// ============ ROUTES ============

// Home Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// CREATE - Add New Student
app.post('/api/students', async (req, res) => {
  try {
    const { full_name, course, year_level, email_address } = req.body;

    // Validation
    if (!full_name || !course || !year_level || !email_address) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!email_address.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const connection = await pool.getConnection();
    
    const query = 'INSERT INTO students (full_name, course, year_level, email_address) VALUES (?, ?, ?, ?)';
    const [result] = await connection.execute(query, [full_name, course, year_level, email_address]);
    
    connection.release();

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      student_id: result.insertId
    });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('Duplicate entry')
        ? 'Email already exists'
        : 'Error adding student: ' + error.message
    });
  }
});

// READ - Get All Students
app.get('/api/students', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [students] = await connection.execute('SELECT * FROM students ORDER BY student_id DESC');
    connection.release();

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students: ' + error.message
    });
  }
});

// READ - Get Single Student
app.get('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }

    const connection = await pool.getConnection();
    const [students] = await connection.execute('SELECT * FROM students WHERE student_id = ?', [id]);
    connection.release();

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: students[0]
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student: ' + error.message
    });
  }
});

// UPDATE - Update Student Information
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, course, year_level, email_address } = req.body;

    // Validation
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }

    if (!full_name || !course || !year_level || !email_address) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!email_address.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    const connection = await pool.getConnection();
    
    // Check if student exists
    const [checkStudent] = await connection.execute('SELECT * FROM students WHERE student_id = ?', [id]);
    if (checkStudent.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update student
    const query = 'UPDATE students SET full_name = ?, course = ?, year_level = ?, email_address = ? WHERE student_id = ?';
    await connection.execute(query, [full_name, course, year_level, email_address, id]);
    
    connection.release();

    res.json({
      success: true,
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('Duplicate entry')
        ? 'Email already exists'
        : 'Error updating student: ' + error.message
    });
  }
});

// DELETE - Delete Student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID'
      });
    }

    const connection = await pool.getConnection();
    
    // Check if student exists
    const [checkStudent] = await connection.execute('SELECT * FROM students WHERE student_id = ?', [id]);
    if (checkStudent.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Delete student
    await connection.execute('DELETE FROM students WHERE student_id = ?', [id]);
    connection.release();

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student: ' + error.message
    });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error: ' + err.message
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start Server and Initialize Database
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Application ready at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;