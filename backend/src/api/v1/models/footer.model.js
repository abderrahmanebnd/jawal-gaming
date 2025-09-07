const { getPool } = require("../../../config/db");

/**
 * This function adds or updates footer items
 * @param {number|null} _id - Footer ID for update, null for insert
 * @param {string} title - Footer title
 * @param {string} url - Footer URL
 * @returns {Object} Operation result
 */
async function addFooters(_id, title, url) {
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    // Start transaction
    await connection.beginTransaction();
    
    let result;
    
    if (_id) {
      // Update existing footer
      const updateQuery = `
        UPDATE FOOTER 
        SET title = ?, url = ?, status = 'ACTIVE', updatedDate = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const [updateResult] = await connection.execute(updateQuery, [title, url, _id]);
      
      if (updateResult.affectedRows === 0) {
        throw new Error("No footer found with the given ID");
      }
      
      result = {
        acknowledged: true,
        modifiedCount: updateResult.affectedRows,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: updateResult.affectedRows
      };
    } else {
      // Insert new footer
      const insertQuery = `
        INSERT INTO FOOTER (title, url, status)
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
    throw new Error(`Unable to save footer: ${error.message}`);
  } finally {
    connection.release();
  }
}

/**
 * This model function is used to get footer count
 * @returns {number} Count of active footers
 */
async function footerCount() {
  const pool = getPool();
  
  try {
    const query = `SELECT COUNT(*) as count FROM FOOTER WHERE status = ?`;
    const [rows] = await pool.execute(query, ['ACTIVE']);
    
    return rows[0].count;
  } catch (error) {
    throw new Error(`Unable to get footer count: ${error.message}`);
  }
}

/**
 * This model function is used to get all footers with pagination
 * FIX: MySQL doesn't allow parameterized LIMIT/OFFSET, so we build the query string
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Array} Array of footer objects
 */
async function getFooters(page = 1, limit = 10) {
  const pool = getPool();
  
  try {
    // Validate and sanitize parameters
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    // Ensure minimum values
    const validPage = Math.max(1, pageNum);
    const validLimit = Math.max(1, Math.min(100, limitNum)); // Max 100 items per page
    
    const offset = (validPage - 1) * validLimit;
    
    // FIX: Build query with literal LIMIT/OFFSET values instead of parameters
    const query = `
      SELECT id, title, url, status, createDate, updatedDate
      FROM FOOTER 
      WHERE status = ?
      ORDER BY createDate DESC
      LIMIT ${validLimit} OFFSET ${offset}
    `;
    
    console.log('Executing footer query:', query);
    console.log('With status parameter:', ['ACTIVE']);
    
    const [rows] = await pool.execute(query, ['ACTIVE']);
    
    return rows;
  } catch (error) {
    console.error('getFooters error details:', error);
    throw new Error(`Unable to fetch footers: ${error.message}`);
  }
}

/**
 * This model function deletes a footer from the FOOTER table
 * @param {number} id - The ID of the footer to delete
 * @returns {Object} The deletion result
 */
async function deleteFooters(id) {
  const pool = getPool();
  
  try {
    if (!id || isNaN(parseInt(id))) {
      throw new Error("Invalid ID format");
    }
    
    const footerId = parseInt(id);
    
    const query = `DELETE FROM FOOTER WHERE id = ?`;
    const [result] = await pool.execute(query, [footerId]);
    
    if (result.affectedRows === 1) {
      return { 
        message: "Footer deleted successfully" 
      };
    } else {
      throw new Error("No matching footer found to delete.");
    }
  } catch (error) {
    console.error('deleteFooters error details:', error);
    throw new Error(`Failed to delete footer: ${error.message}`);
  }
}

/**
 * Alternative method using query() instead of execute() for LIMIT/OFFSET
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Array} Array of footer objects
 */
async function getFootersWithQuery(page = 1, limit = 10) {
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
        FROM FOOTER 
        WHERE status = 'ACTIVE'
        ORDER BY createDate DESC
        LIMIT ${validLimit} OFFSET ${offset}
      `;
      
      console.log('Executing footer query with query() method:', query);
      
      const [rows] = await connection.query(query);
      
      return rows;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('getFootersWithQuery error details:', error);
    throw new Error(`Unable to fetch footers: ${error.message}`);
  }
}

module.exports = { addFooters, getFooters, footerCount, deleteFooters, getFootersWithQuery };