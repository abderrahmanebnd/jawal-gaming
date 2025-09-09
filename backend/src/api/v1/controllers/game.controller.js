const { commonResponse } = require("../common/common");
const {
  addGames,
  getGames,
  getByIds,
  getByTitle,
  gameCount,
  deleteGames,
  getTopLikedGames,
} = require("../models/game.model");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// const { thumbnailImage, imageHandler, metaCrawlerImage } = require("./common.controller");

/**
 * This function uses to add article
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.addGame = async (req, res) => {
  try {
    let { id, title, description, url, thumbnail } = req.body;

    let imageUrl = null;

    if (thumbnail) {
      const matches = thumbnail.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid base64 image format" });
      }

      const ext = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");

      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
      const uploadPath = path.join(__dirname, "../uploads", fileName);

      // Resize to 256x256 and save
      await sharp(buffer)
        .resize(256, 256) // width, height
        .toFile(uploadPath);

      // Build full URL dynamically
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
      imageUrl = `${baseUrl}/uploads/${fileName}`;
    }

    const gameArgs = [id, title, description, url, imageUrl];
    const result = await addGames(id || undefined, ...gameArgs.slice(1));

    return commonResponse(res, 200, result);
  } catch (error) {
    return commonResponse(res, 500, null, error?.message, "v1-game-server-001");
  }
};


/**
 * This function use to view article
 * @param {*} req : HTTP request
 * @param {*} res : HTTP response
 */
exports.viewGame = async (req, res) => {
  try {
    // Fix: Handle undefined query parameters properly
    const pageNo = req.query.pageNo;
    const pageSize = req.query.pageSize;
    
    // Parse with proper defaults and validation
    let page = parseInt(pageNo) || 1;
    let limit = parseInt(pageSize) || 10;
    
    // Ensure valid ranges
    page = Math.max(1, page);
    limit = Math.max(1, Math.min(100, limit)); 

    const result = await getGames(page, limit);
    const Count = await gameCount();

    commonResponse(res, 200, { 
      data: result, 
      total: Count,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(Count / limit)
      }
    });
  } catch (error) {
    commonResponse(res, 500, null, error?.message, "v1-game-server-003");
  }
};

/**
 * This function use to view article
 * @param {*} req : HTTP request
 * @param {*} res : HTTP response
 */
exports.getById = async (req, res) => {
  try {
    let title = req.query.id; // This is the slug, like "call-of-duty"

    // Validate title
    if (!title || typeof title !== "string") {
      return commonResponse(
        res,
        400,
        null,
        "Valid title parameter is required",
        "v1-game-server-006"
      );
    }

    // Convert slug back to normal title
    title = title.replace(/-/g, " ");
    console.log("title::", title);

    // Fetch game by title
    const result = await getByTitle(title);
    console.log("result::", result);
    if (!result) {
      return commonResponse(
        res,
        404,
        null,
        "Game not found",
        "v1-game-server-007"
      );
    }

    commonResponse(res, 200, { data: result });
  } catch (error) {
    console.log("getById ERROR::", error);
    commonResponse(
      res,
      500,
      null,
      error?.message,
      "v1-game-server-003"
    );
  }
};


/**
 * This function use to delete article
 * @param {*} req : HTTP request
 * @param {*} res : HTTP response
 */
exports.deleteGame = async (req, res) => {
  try {
    const id = req.query.id;
    
    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return commonResponse(res, 400, null, "Valid ID parameter is required", "v1-game-server-008");
    }
    
    const result = await deleteGames(id);
    
    // Note: For MySQL, we check the message instead of modifiedCount
    if (result.message === "Game deleted successfully") {
      commonResponse(res, 200, result);
    } else {
      commonResponse(
        res,
        404,
        null,
        "No Records to delete",
        "v1-game-server-004"
      );
    }
  } catch (error) {
    // Handle specific error cases
    if (error.message.includes("No matching game found")) {
      return commonResponse(
        res,
        404,
        null,
        "Game not found",
        "v1-game-server-004"
      );
    }
    
    commonResponse(res, 500, null, error?.message, "v1-game-server-005");
  }
};

/**
 * Alternative simple view function without pagination (for testing)
 * @param {*} req : HTTP request
 * @param {*} res : HTTP response
 */
exports.viewAllGames = async (req, res) => {
  try {
    // Get all games without pagination for testing
    const result = await getGames(1, 1000);
    const Count = await gameCount();

    commonResponse(res, 200, { 
      data: result, 
      total: Count,
      note: "All games without pagination"
    });
  } catch (error) {
    console.log("viewAllGames ERROR::", error);
    commonResponse(res, 500, null, error?.message, "v1-game-server-009");
  }
};

exports.getTopGames = async (req, res) => {
  try {
    const raw = req.query.n;
    const n = parseInt(raw, 10);

    if (raw !== undefined && (Number.isNaN(n) || n < 1)) {
      return commonResponse(
        res,
        400,
        null,
        "Parameter n must be a positive integer",
        "v1-game-server-010"
      );
    }

    const limit = Math.max(1, Math.min(100, n || 10));
    const rows = await getTopLikedGames(limit);

    return commonResponse(res, 200, { data: rows, count: rows.length });
  } catch (error) {
    return commonResponse(res, 500, null, error?.message, "v1-game-server-011");
  }
};