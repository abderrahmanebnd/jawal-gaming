const { commonResponse } = require("../common/common");
const {
  addNavs,
  getNavs,
  navCount,
  deleteNavs,
} = require("../models/nav.model");

/**
 * This function uses to add navigation item
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.addNav = async (req, res) => {
  try {
    const navArgs = [
      req.body.id,
      req.body.title,
      req.body.url,
    ];

    console.log("navArgs::", navArgs);
    
    const result = await addNavs(
      req.body.id ? req.body.id : undefined,
      ...navArgs.slice(1)
    );
    commonResponse(res, 200, result);
  } catch (error) {
    console.log("addNav ERROR::", error);
    return commonResponse(res, 500, null, error?.message, "v1-nav-server-001");
  }
};

/**
 * This function use to view Nav
 * @param {*} req : HTTP request
 * @param {*} res : HTTP response
 */
exports.viewNav = async (req, res) => {
  try {
    // Fix: Handle undefined query parameters properly
    const pageNo = req.query.pageNo;
    const pageSize = req.query.pageSize;
    
    // Debug logging
    console.log("Raw nav query params - pageNo:", pageNo, "pageSize:", pageSize);
    
    // Parse with proper defaults and validation
    let page = parseInt(pageNo) || 1;  // Default to page 1
    let limit = parseInt(pageSize) || 10;  // Default to 10 items
    
    // Ensure valid ranges
    page = Math.max(1, page);  // Minimum page 1
    limit = Math.max(1, Math.min(100, limit));  // Between 1-100 items
    
    console.log("Processed nav params - page:", page, "limit:", limit);

    const result = await getNavs(page, limit);
    const Count = await navCount();

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
    console.log("viewNav ERROR::", error);
    commonResponse(res, 500, null, error?.message, "v1-nav-server-003");
  }
};

/**
 * This function use to delete Nav
 * @param {*} req : HTTP request
 * @param {*} res : HTTP response
 */
exports.deleteNav = async (req, res) => {
  try {
    const id = req.query.id;
    
    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return commonResponse(res, 400, null, "Valid ID parameter is required", "v1-nav-server-008");
    }
    
    console.log("Deleting nav with ID:", id);
    
    const result = await deleteNavs(id);
    
    console.log("Delete nav result:", result);
    
    // Fix: For MySQL, we check the message instead of modifiedCount
    if (result.message === "Navigation item deleted successfully") {
      commonResponse(res, 200, result);
    } else {
      commonResponse(
        res,
        404,
        null,
        "No Records to delete",
        "v1-nav-server-004"
      );
    }
  } catch (error) {
    console.log("deleteNav ERROR::", error);
    
    // Handle specific error cases
    if (error.message.includes("No matching navigation item found")) {
      return commonResponse(
        res,
        404,
        null,
        "Navigation item not found",
        "v1-nav-server-004"
      );
    }
    
    commonResponse(res, 500, null, error?.message, "v1-nav-server-005");
  }
};