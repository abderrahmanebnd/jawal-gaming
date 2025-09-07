
const { commonResponse } = require("../common/common");
const {
  incrementViews,
  addLikeToGame,
} = require("../models/count.model");

/**
 * Update game views count
 * @param {*} req 
 * @param {*} res 
 */
exports.updateViews = async (req, res) => {
  try {
    const { gameId } = req.body;

    if (!gameId) {
      return commonResponse(res, 400, null, "Game ID is required", "v1-game-server-004");
    }
    const result = await incrementViews(gameId);
    return commonResponse(res, 200, {
      views: result.views,
      message: 'View count updated successfully'
    });

  } catch (error) {
    return commonResponse(res, 500, null, error?.message, "v1-game-server-005");
  }
};

/**
 * Add like to a game
 * @param {*} req 
 * @param {*} res 
 */
exports.addLike = async (req, res) => {
  try {
    const { gameId,action } = req.body;

        
    if (!gameId) {
      return commonResponse(res, 400, null, "Game ID is required", "v1-game-server-006");
    }

    const result = await addLikeToGame(gameId, action);

    return commonResponse(res, 200, {
      likes: result.likes,
      message: 'Like added successfully'
    });

  } catch (error) {
    return commonResponse(res, 500, null, error?.message, "v1-game-server-007");
  }
};