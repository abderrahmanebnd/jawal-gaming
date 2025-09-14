const { getPool, executeWithRetry } = require("../../../config/db");



/**
 * This function increments or decrements the like count of a game
 * @param {number} gameId - The ID of the game
 * @param {string} action - Either 'like' or 'unlike'
 * @returns {number} Updated like count of the game
 */
async function addLikeToGame(gameId, action) {
  const pool = getPool();

  try {
    // Determine increment or decrement
    const change = action === 'like' ? 1 : -1;

    // Update liked count
    const updateQuery = `
      UPDATE GAMES 
      SET liked = GREATEST(liked + ?, 0), updatedDate = NOW() 
      WHERE id = ?
    `;
    await executeWithRetry(pool,updateQuery, [change, gameId]);

    // Get updated like count
    const selectQuery = `SELECT liked FROM GAMES WHERE id = ?`;
    const [rows] = await executeWithRetry(pool,selectQuery, [gameId]);

    return rows.length ? rows[0].liked : 0;
  } catch (error) {
    throw new Error(`Unable to update like count: ${error.message}`);
  }
}


/**
 * This function increments the view count of a game by 1
 * @param {number} gameId - The ID of the game
 * @returns {number} Updated view count of the game
 */
async function incrementViews(gameId) {
  const pool = getPool();

  try {
    // Increment view count
    const updateQuery = `
      UPDATE GAMES
      SET viewed = viewed + 1, updatedDate = NOW()
      WHERE id = ?
    `;
    await executeWithRetry(pool,updateQuery, [gameId]);

    // Get updated view count
    const selectQuery = `SELECT viewed FROM GAMES WHERE id = ?`;
    const [rows] = await executeWithRetry(pool,selectQuery, [gameId]);

    if (!rows.length) {
      throw new Error(`Game with ID ${gameId} not found`);
    }

    return rows[0].viewed;
  } catch (error) {
    throw new Error(`Unable to increment view count: ${error.message}`);
  }
}


module.exports = { addLikeToGame, incrementViews };