// config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'JAWALDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  // reconnect: true
};

let pool;

const createTables = async (connection) => {
  const tables = [
    // AUTH table
    `CREATE TABLE IF NOT EXISTS AUTH (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
      createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // GAMES table
    `CREATE TABLE IF NOT EXISTS GAMES (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      url VARCHAR(500),
       liked INT DEFAULT 0,
      viewed INT DEFAULT 0,
      thumbnail VARCHAR(500),
      status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
      createDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_title (title)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // FOOTER table
    `CREATE TABLE IF NOT EXISTS FOOTER (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      url VARCHAR(500) NOT NULL,
      status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
      createDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_title (title)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // NAV table
    `CREATE TABLE IF NOT EXISTS NAV (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      url VARCHAR(500) NOT NULL,
      status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
      createDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_title (title)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  ];

  try {
    for (const tableSQL of tables) {
      await connection.execute(tableSQL);
    }
    console.log('(: All tables created/verified successfully');
  } catch (error) {
    console.error('): Error creating tables:', error);
    throw error;
  }
};

async function connectDB() {
  try {
    // Create connection pool
    pool = mysql.createPool(dbConfig);
    
    // Test connection and create tables
    const connection = await pool.getConnection();
    console.log('(: MySQL connected successfully');
    
    // Create tables automatically
    await createTables(connection);
    
    connection.release();
    
    return pool;
  } catch (error) {
    console.error('): Failed to connect to MySQL:', error);
    process.exit(1);
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return pool;
}

async function closeDB() {
  if (pool) {
    await pool.end();
    console.log('(: MySQL connection pool closed');
  }
}

module.exports = { connectDB, getPool, closeDB }