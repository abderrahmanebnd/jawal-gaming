const { getPool } = require("../../../config/db");

/**
 * This function adds or updates game items
 * @param {number|null} _id - Game ID for update, null for insert
 * @param {string} title - Game title
 * @param {string} description - Game description
 * @param {string} url - Game URL
 * @param {string} thumbnail - Game thumbnail URL
 * @returns {Object} Operation result
 */
async function addGames(_id, title, description, url, thumbnail) {
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    // Start transaction
    await connection.beginTransaction();
    
    let result;
    
    if (_id) {
      // Update existing game
      const updateQuery = `
        UPDATE GAMES 
        SET title = ?, description = ?, url = ?, thumbnail = ?, status = 'ACTIVE', updatedDate = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const [updateResult] = await connection.execute(updateQuery, [title, description, url, thumbnail, _id]);
      
      if (updateResult.affectedRows === 0) {
        throw new Error("No game found with the given ID");
      }
      
      result = {
        acknowledged: true,
        modifiedCount: updateResult.affectedRows,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: updateResult.affectedRows
      };
    } else {
      // Insert new game
      const insertQuery = `
        INSERT INTO GAMES (title, description, url, thumbnail, status)
        VALUES (?, ?, ?, ?, 'ACTIVE')
      `;
      
      const [insertResult] = await connection.execute(insertQuery, [title, description, url, thumbnail]);
      
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
    throw new Error(`Unable to save game: ${error.message}`);
  } finally {
    connection.release();
  }
}

/**
 * This model function is used to get game count
 * @returns {number} Count of active games
 */
async function gameCount() {
  const pool = getPool();
  
  try {
    const query = `SELECT COUNT(*) as count FROM GAMES WHERE status = ?`;
    const [rows] = await pool.execute(query, ['ACTIVE']);
    
    return rows[0].count;
  } catch (error) {
    throw new Error(`Unable to get game count: ${error.message}`);
  }
}

/**
 * This model function is used to get all games with pagination
 * FIX: MySQL doesn't allow parameterized LIMIT/OFFSET, so we build the query string
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {boolean} all - If true, fetch all games without pagination
 * @returns {Array} Array of game objects
 */
async function getGames(page = 1, limit = 10, all = false) {
  const pool = getPool();

  try {
    // If "all" is true, skip pagination
    if (all === true || all === "true") {
      const query = `
        SELECT id, title, description, url, thumbnail, status, createDate, updatedDate, liked, viewed
        FROM GAMES
        WHERE status = ?
        ORDER BY createDate DESC
      `;
      console.log("Executing query without LIMIT/OFFSET");
      const [rows] = await pool.execute(query, ["ACTIVE"]);
      return rows;
    }

    // Otherwise, do normal paginated query
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // Ensure safe values
    const validPage = Math.max(1, pageNum);
    const validLimit = Math.max(1, Math.min(100, limitNum)); // Max 100 items

    const offset = (validPage - 1) * validLimit;

    const query = `
      SELECT id, title, description, url, thumbnail, status, createDate, updatedDate, liked, viewed
      FROM GAMES
      WHERE status = ?
      ORDER BY createDate DESC
      LIMIT ${validLimit} OFFSET ${offset}
    `;
    console.log("Executing query:", query);
    const [rows] = await pool.execute(query, ["ACTIVE"]);

    return rows;
  } catch (error) {
    console.error("getGames error details:", error);
    throw new Error(`Unable to fetch games: ${error.message}`);
  }
}




/**
 * This model function is used to get game by title
 * @param {string} title - Game title
 * @returns {Object|null} Game object or null if not found
 */
async function getByTitle(title) {
  const pool = getPool();
  
  try {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      throw new Error("Valid title is required");
    }
    
    const gameTitle = title.trim();
    
    const query = `
      SELECT id, title, description, url, thumbnail, status, createDate, updatedDate,liked, viewed
      FROM GAMES 
      WHERE title = ? AND status = ?
    `;
    
    console.log('Searching for game with title:', gameTitle);
    
    const [rows] = await pool.execute(query, [gameTitle, 'ACTIVE']);
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('getByTitle error details:', error);
    throw new Error(`Unable to fetch game: ${error.message}`);
  }
}







/**
 * This model function is used to get game by ID
 * @param {number} id - Game ID
 * @returns {Object|null} Game object or null if not found
 */
async function getByIds(id) {
  const pool = getPool();
  
  try {
    if (!id || isNaN(parseInt(id))) {
      throw new Error("Invalid ID format");
    }
    
    const gameId = parseInt(id);
    
    const query = `
      SELECT id, title, description, url, thumbnail, status, createDate, updatedDate
      FROM GAMES 
      WHERE id = ?
    `;
    
    const [rows] = await pool.execute(query, [gameId]);
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('getByIds error details:', error);
    throw new Error(`Unable to fetch game: ${error.message}`);
  }
}

/**
 * This model function deletes a game from the GAMES table
 * @param {number} id - The ID of the game to delete
 * @returns {Object} The deletion result
 */
async function deleteGames(id) {
  const pool = getPool();
  
  try {
    if (!id || isNaN(parseInt(id))) {
      throw new Error("Invalid ID format");
    }
    
    const gameId = parseInt(id);
    
    const query = `DELETE FROM GAMES WHERE id = ?`;
    const [result] = await pool.execute(query, [gameId]);
    
    if (result.affectedRows === 1) {
      return { 
        message: "Game deleted successfully" 
      };
    } else {
      throw new Error("No matching game found to delete.");
    }
  } catch (error) {
    console.error('deleteGames error details:', error);
    throw new Error(`Failed to delete game: ${error.message}`);
  }
}

/**
 * Alternative method using query() instead of execute() for LIMIT/OFFSET
 * This method uses regular query instead of prepared statements for LIMIT/OFFSET
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Array} Array of game objects
 */
async function getGamesWithQuery(page = 1, limit = 10) {
  const pool = getPool();
  
  try {
    // Validate and sanitize parameters
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    
    const validPage = Math.max(1, pageNum);
    const validLimit = Math.max(1, Math.min(100, limitNum));
    
    const offset = (validPage - 1) * validLimit;
    
    // Use query() method instead of execute() and escape the status manually
    const connection = await pool.getConnection();
    
    try {
      const query = `
        SELECT id, title, description, url, thumbnail, status, createDate, updatedDate
        FROM GAMES 
        WHERE status = 'ACTIVE'
        ORDER BY createDate DESC
        LIMIT ${validLimit} OFFSET ${offset}
      `;
      
      console.log('Executing query with query() method:', query);
      
      const [rows] = await connection.query(query);
      
      return rows;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('getGamesWithQuery error details:', error);
    throw new Error(`Unable to fetch games: ${error.message}`);
  }
}


/**
 * Get top N most-liked ACTIVE games
 * @param {number} limit - number of games to return (1..100)
 * @returns {Array} rows
 */
async function getTopLikedGames(limit = 10) {
  const pool = getPool();

  try {
    // sanitize and clamp limit
    const n = Math.max(1, Math.min(100, parseInt(limit) || 10));

    const query = `
      SELECT id, title, description, url, thumbnail, status, createDate, updatedDate, liked, viewed
      FROM GAMES
      WHERE status = 'ACTIVE'
      ORDER BY liked DESC, viewed DESC, createDate DESC
      LIMIT ${n}
    `;

    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    throw new Error(`Unable to fetch top liked games: ${error.message}`);
  }
}

/**
 * Fetch a set of games by an ordered, sanitized list of ids.
 * Keeps the same order via ORDER BY FIELD.
 * @param {number[]} idsWindow - sanitized ids (length 1..100)
 * @returns {Array} rows
 */
async function getGamesByIdsPaged(idsWindow) {
  const pool = getPool();
  if (!Array.isArray(idsWindow) || idsWindow.length === 0) return [];

  // Build IN and FIELD lists from numbers only (already sanitized in controller)
  const idList = idsWindow.join(",");
  const query = `
    SELECT id, title, description, url, thumbnail, status, createDate, updatedDate, liked, viewed
    FROM GAMES
    WHERE status = 'ACTIVE' AND id IN (${idList})
    ORDER BY FIELD(id, ${idList})
  `;

  const [rows] = await pool.query(query);
  return rows;
}


module.exports = { addGames, getGames, getByIds,getByTitle, gameCount, deleteGames, getGamesWithQuery, getTopLikedGames, getGamesByIdsPaged };