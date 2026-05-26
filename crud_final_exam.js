require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection Pool
let pool;

// Initialize Database Connection
const initializeDatabase = async () => {
    try {
        // Check if MYSQL_URL is provided
        if (!process.env.MYSQL_URL) {
            throw new Error('MYSQL_URL environment variable is not set');
        }

        pool = mysql.createPool(process.env.MYSQL_URL, {
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelayMs: 0
        });

        // Test the connection
        const connection = await pool.getConnection();
        console.log('✓ Successfully connected to Aiven MySQL');
        connection.release();

        // Create students table if it doesn't exist
        await createStudentsTable();
        return true;
    } catch (err) {
        console.error('✗ Database Connection Error:', err.message);
        return false;
    }
};

// Create Students Table
const createStudentsTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(50) UNIQUE NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                course VARCHAR(100) NOT NULL,
                year_level VARCHAR(20) NOT NULL,
                email VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Students table ready');
    } catch (err) {
        console.error('✗ Table Creation Error:', err.message);
        throw err;
    }
};

// Routes

// Home Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// CREATE - Add Student
app.post('/api/students', async (req, res) => {
    const { student_id, full_name, course, year_level, email } = req.body;

    // Validation
    if (!student_id || !full_name || !course || !year_level || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            'INSERT INTO students (student_id, full_name, course, year_level, email) VALUES (?, ?, ?, ?, ?)',
            [student_id, full_name, course, year_level, email]
        );
        connection.release();
        
        res.status(201).json({ 
            message: 'Student added successfully',
            id: result.insertId 
        });
    } catch (err) {
        console.error('Error adding student:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Student ID already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// READ - Get All Students
app.get('/api/students', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT * FROM students ORDER BY id DESC');
        connection.release();
        
        res.json(rows);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ error: err.message });
    }
});

// READ - Get Single Student
app.get('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT * FROM students WHERE id = ?', [id]);
        connection.release();
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching student:', err);
        res.status(500).json({ error: err.message });
    }
});

// UPDATE - Update Student
app.put('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    const { student_id, full_name, course, year_level, email } = req.body;

    if (!student_id || !full_name || !course || !year_level || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            'UPDATE students SET student_id=?, full_name=?, course=?, year_level=?, email=? WHERE id=?',
            [student_id, full_name, course, year_level, email, id]
        );
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student updated successfully' });
    } catch (err) {
        console.error('Error updating student:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Student ID already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// DELETE - Delete Student
app.delete('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute('DELETE FROM students WHERE id = ?', [id]);
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error('Error deleting student:', err);
        res.status(500).json({ error: err.message });
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
const startServer = async () => {
    const dbConnected = await initializeDatabase();
    
    if (dbConnected) {
        app.listen(port, () => {
            console.log(`✓ Server running on port ${port}`);
            console.log(`✓ Visit: http://localhost:${port}`);
        });
    } else {
        console.error('✗ Failed to start server - database connection failed');
        process.exit(1);
    }
};

startServer();
