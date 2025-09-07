const { getPool } = require("../../../config/db");

/**
 * This function adds or updates navigation items
 * @param {number|null} _id - Nav ID for update, null for insert
 * @param {string} title - Nav title
 * @param {string} url - Nav URL
 * @returns {Object} Operation result
 */
async function addNavs(_id, title, url) {
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    // Start transaction
    await connection.beginTransaction();
    
    let result;
    
    if (_id) {
      // Update existing nav
      const updateQuery = `
        UPDATE NAV 
        SET title = ?, url = ?, status = 'ACTIVE', updatedDate = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const [updateResult] = await connection.execute(updateQuery, [title, url, _id]);
      
      if (updateResult.affectedRows === 0) {
        throw new Error("No navigation item found with the given ID");
      }
      
      result = {
        acknowledged: true,
        modifiedCount: updateResult.affectedRows,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: updateResult.affectedRows
      };
    } else {
      // Insert new nav
      const insertQuery = `
        INSERT INTO NAV (title, url, status)
        VALUES (?, ?, 'ACTIVE')
      `;
      
      const [insertResult] = await connection.execute(insertQuery, [title, url]);
      
      result = {
        acknowledged: true,
        insertedId: insertResult.insertId
      };
    }
    
    // Commit transaction
    await connection.commit();
    
    return result;
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    throw new Error(`Unable to save navigation: ${error.message}`);
  } finally {
    connection.release();
  }
}

/**
 * This model function is used to get navigation count
 * @returns {number} Count of active navigation items
 */
async function navCount() {
  const pool = getPool();
  
  try {
    const query = `SELECT COUNT(*) as count FROM NAV WHERE status = ?`;
    const [rows] = await pool.execute(query, ['ACTIVE']);
    
    return rows[0].count;
  } catch (error) {
    throw new Error(`Unable to get navigation count: ${error.message}`);
  }
}

/**
 * This model function is used to get all navigation items with pagination
 * FIX: MySQL doesn't allow parameterized LIMIT/OFFSET, so we build the query string
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Array} Array of navigation objects
 */
async function getNavs(page = 1, limit = 10) {
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
      SELECT id, title, url, status, createDate, updatedDate
      FROM NAV 
      WHERE status = ?
      ORDER BY createDate DESC
      LIMIT ${validLimit} OFFSET ${offset}
    `;
    
    console.log('Executing nav query:', query);
    console.log('With status parameter:', ['ACTIVE']);
    
    const [rows] = await pool.execute(query, ['ACTIVE']);
    
    return rows;
  } catch (error) {
    console.error('getNavs error details:', error);
    throw new Error(`Unable to fetch navigation items: ${error.message}`);
  }
}

/**
 * This model function deletes a navigation item from the NAV table
 * @param {number} id - The ID of the navigation item to delete
 * @returns {Object} The deletion result
 */
async function deleteNavs(id) {
  const pool = getPool();
  
  try {
    if (!id || isNaN(parseInt(id))) {
      throw new Error("Invalid ID format");
    }
    
    const navId = parseInt(id);
    
    console.log('Deleting nav with ID:', navId);
    
    const query = `DELETE FROM NAV WHERE id = ?`;
    const [result] = await pool.execute(query, [navId]);
    
    console.log('Delete result:', result);
    
    if (result.affectedRows === 1) {
      return { 
        message: "Navigation item deleted successfully",
        deletedId: navId
      };
    } else {
      throw new Error("No matching navigation item found to delete.");
    }
  } catch (error) {
    console.error('deleteNavs error details:', error);
    throw new Error(`Failed to delete navigation item: ${error.message}`);
  }
}

/**
 * Alternative method using query() instead of execute() for LIMIT/OFFSET
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Array} Array of navigation objects
 */
async function getNavsWithQuery(page = 1, limit = 10) {
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
        SELECT id, title, url, status, createDate, updatedDate
        FROM NAV 
        WHERE status = 'ACTIVE'
        ORDER BY createDate DESC
        LIMIT ${validLimit} OFFSET ${offset}
      `;
      
      console.log('Executing nav query with query() method:', query);
      
      const [rows] = await connection.query(query);
      
      return rows;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('getNavsWithQuery error details:', error);
    throw new Error(`Unable to fetch navigation items: ${error.message}`);
  }
}

module.exports = { addNavs, getNavs, navCount, deleteNavs, getNavsWithQuery }