const { commonResponse } = require("../common/common");
const {
  addFooters,
  getFooters,
  footerCount,
  deleteFooters,
} = require("../models/footer.model");

/**
 * This function uses to add footer
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.addFooter = async (req, res) => {
  try {
    const footerArgs = [
      req.body.id,
      req.body.title,
      req.body.url,
    ];

    const result = await addFooters(
      req.body.id ? req.body.id : undefined,
      ...footerArgs.slice(1)
    );
    commonResponse(res, 200, result);
  } catch (error) {
    console.log("addFooter ERROR::", error);
    return commonResponse(res, 500, null, error?.message, "v1-footer-server-001");
  }
};

/**
 * This function use to view Footer
 * @param {*} req : HTTP request
 * @param {*} res : HTTP response
 */
exports.viewFooter = async (req, res) => {
  try {
    // Fix: Handle undefined query parameters properly
    const pageNo = req.query.pageNo;
    const pageSize = req.query.pageSize;
    
    // Debug logging
    console.log("Raw query params - pageNo:", pageNo, "pageSize:", pageSize);
    
    // Parse with proper defaults and validation
    let page = parseInt(pageNo) || 1;  // Default to page 1
    let limit = parseInt(pageSize) || 10;  // Default to 10 items
    
    // Ensure valid ranges
    page = Math.max(1, page);  // Minimum page 1
    limit = Math.max(1, Math.min(100, limit));  // Between 1-100 items
    
    console.log("Processed params - page:", page, "limit:", limit);

    const result = await getFooters(page, limit);
    const Count = await footerCount();

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
    console.log("viewFooter ERROR::", error);
    commonResponse(res, 500, null, error?.message, "v1-footer-server-003");
  }
};

/**
 * This function use to delete Footer
 * @param {*} req : HTTP request
 * @param {*} res : HTTP response
 */
exports.deleteFooter = async (req, res) => {
  try {
    const id = req.query.id;
    
    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return commonResponse(res, 400, null, "Valid ID parameter is required", "v1-footer-server-008");
    }
    
    const result = await deleteFooters(id);
    
    // Note: For MySQL, we check the message instead of modifiedCount
    if (result.message === "Footer deleted successfully") {
      commonResponse(res, 200, result);
    } else {
      commonResponse(
        res,
        404,
        null,
        "No Records to delete",
        "v1-footer-server-004"
      );
    }
  } catch (error) {
    console.log("deleteFooter ERROR::", error);
    
    // Handle specific error cases
    if (error.message.includes("No matching footer found")) {
      return commonResponse(
        res,
        404,
        null,
        "Footer not found",
        "v1-footer-server-004"
      );
    }
    
    commonResponse(res, 500, null, error?.message, "v1-footer-server-005");
  }
};