const { getPool } = require("../../../config/db");

/**
 * This model function is used to add/update users in the system
 * @param {number|null} _id - User ID for update, null for insert
 * @param {string} email - User email
 * @param {string} status - User status (ACTIVE, INACTIVE, SUSPENDED)
 * @param {string} createdDate - Creation date
 * @param {string} password - User password
 * @returns {Object} Operation result
 */
async function auth(_id, email, status, createdDate, password) {
  const pool = getPool();
  
  try {
    let result;
    
    if (_id) {
      // Update existing user
      const updateQuery = `
        UPDATE AUTH 
        SET email = ?, status = ?, password = ?, updatedDate = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const [updateResult] = await pool.execute(updateQuery, [email, status, password, _id]);
      
      if (updateResult.affectedRows === 0) {
        throw new Error("No user found with the given ID");
      }
      
      result = {
        acknowledged: true,
        modifiedCount: updateResult.affectedRows,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: updateResult.affectedRows
      };
    } else {
      // Insert new user
      const insertQuery = `
        INSERT INTO AUTH (email, status, password, createdDate)
        VALUES (?, ?, ?, ?)
      `;
      
      const [insertResult] = await pool.execute(insertQuery, [email, status, password, createdDate || new Date()]);
      
      result = {
        acknowledged: true,
        insertedId: insertResult.insertId
      };
    }
    
    return result;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error("Email already exists in the system");
    }
    throw new Error(`Unable to save user: ${error.message}`);
  }
}

/**
 * This model function is used to get user details by email
 * @param {string} email - User email
 * @returns {Object|null} User object or null if not found
 */
async function findUserByEmail(email) {
  const pool = getPool();
  
  try {
    const query = `
      SELECT id, email, password, status, createdDate, updatedDate
      FROM AUTH 
      WHERE email = ? AND status = ?
    `;
    
    const [rows] = await pool.execute(query, [email, 'ACTIVE']);
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw new Error(`Unable to find user: ${error.message}`);
  }
}

/**
 * This model function is used to get all users with pagination
 * FIX: MySQL doesn't allow parameterized LIMIT/OFFSET, so we build the query string
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Array} Array of user objects
 */
async function findAllUser(page = 1, limit = 10) {
  const pool = getPool();
  
  try {
    // Validate and sanitize parameters
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    // Ensure minimum values and prevent SQL injection
    const validPage = Math.max(1, pageNum);
    const validLimit = Math.max(1, Math.min(100, limitNum)); // Max 100 items per page
    
    const offset = (validPage - 1) * validLimit;
    
    // FIX: Build query with literal LIMIT/OFFSET values instead of parameters
    const query = `
      SELECT id, email, status, createdDate, updatedDate
      FROM AUTH
      ORDER BY createdDate DESC
      LIMIT ${validLimit} OFFSET ${offset}
    `;
    
    console.log('Executing auth query:', query);
    
    const [rows] = await pool.execute(query);
    
    return rows;
  } catch (error) {
    console.error('findAllUser error details:', error);
    throw new Error(`Unable to fetch users: ${error.message}`);
  }
}

/**
 * This model function is used to get total user count
 * @returns {number} Total count of users
 */
async function userCount() {
  const pool = getPool();
  
  try {
    const query = `SELECT COUNT(*) as count FROM AUTH`;
    const [rows] = await pool.execute(query);
    
    return rows[0].count;
  } catch (error) {
    throw new Error(`Unable to get user count: ${error.message}`);
  }
}

/**
 * This model function is used to delete users
 * @param {number} id - User ID to delete
 * @returns {Object} Deletion result
 */
async function deleteUsers(id) {
  const pool = getPool();
  
  try {
    if (!id || isNaN(parseInt(id))) {
      throw new Error("Invalid ID format");
    }
    
    const userId = parseInt(id);
    
    console.log('Deleting user with ID:', userId);
    
    const query = `DELETE FROM AUTH WHERE id = ?`;
    const [result] = await pool.execute(query, [userId]);
    
    console.log('Delete user result:', result);
    
    if (result.affectedRows === 1) {
      return { 
        success: true, 
        message: `User with id ${userId} deleted.`,
        deletedId: userId
      };
    } else {
      return { 
        success: false, 
        message: `No user found with id ${userId}.` 
      };
    }
  } catch (error) {
    console.error('deleteUsers error details:', error);
    throw new Error(`Unable to delete user: ${error.message}`);
  }
}

/**
 * Alternative method using query() instead of execute() for LIMIT/OFFSET
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Array} Array of user objects
 */
async function findAllUserWithQuery(page = 1, limit = 10) {
  const pool = getPool();
  
  try {
    // Validate and sanitize parameters
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    const validPage = Math.max(1, pageNum);
    const validLimit = Math.max(1, Math.min(100, limitNum));
    
    const offset = (validPage - 1) * validLimit;
    
    // Use query() method instead of execute() 
    const connection = await pool.getConnection();
    
    try {
      const query = `
        SELECT id, email, status, createdDate, updatedDate
        FROM AUTH
        ORDER BY createdDate DESC
        LIMIT ${validLimit} OFFSET ${offset}
      `;
      
      console.log('Executing auth query with query() method:', query);
      
      const [rows] = await connection.query(query);
      
      return rows;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('findAllUserWithQuery error details:', error);
    throw new Error(`Unable to fetch users: ${error.message}`);
  }
}

module.exports = { auth, findUserByEmail, findAllUser, userCount, deleteUsers, findAllUserWithQuery };