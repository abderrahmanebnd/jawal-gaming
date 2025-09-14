const bcrypt = require("bcrypt");
const { commonResponse } = require("../common/common");
const { auth, findUserByEmail, findAllUser, userCount, deleteUsers } = require("../models/auth.model");
const common = require("../common/common");

/**
 * This function use to add users to the system
 * @param {*} req : HTTP request
 * @param {*} res : HTTP response
 */
exports.signUp = async (req, res) => {
  try {
    const user = await findUserByEmail(req.body.email);
    if (user && !req.body._id) {
      commonResponse(res, 409, null, "User already exist", "v1-auth-server-001");
      return;
    }

    let hashedPassword;
    if (req.body.password) {
      hashedPassword = await bcrypt.hash(req.body.password, 10);
    }

    const result = await auth(
      req.body._id ? req.body._id : undefined,
      req.body.email,
      "ACTIVE",
      new Date(), 
      hashedPassword ? hashedPassword : undefined
    );
    // Generate common response
    commonResponse(res, 200, result);
  } catch (error) {
    console.log("signUp ERROR::", error);
    const err = error?.response?.data ? error?.response?.data : error?.message || "server error";
    const errStatus = error?.response?.status ? error?.response?.status : 500;
    commonResponse(res, errStatus, null, err, "v1-auth-server-002");
  }
};

/**
 * This function use to edit users
 * @param {*} req : HTTP request
 * @param {*} res : HTTP response
 */
exports.editSignUp = async (req, res) => {
  try {
    let hashedPassword;
    if (req.body.password) {
      hashedPassword = await bcrypt.hash(req.body.password, 10);
    }
    
    // Fix: Match the auth model parameters (5 parameters)
    const result = await auth(
      req.body._id,
      req.body.email,
      req.body.status || "ACTIVE",
      req.body.modifyDate || new Date(),
      hashedPassword ? hashedPassword : undefined
    );
    // Generate common response
    commonResponse(res, 200, result);
  } catch (error) {
    console.log("editSignUp ERROR::", error);
    const err = error?.response?.data ? error?.response?.data : error?.message || "server error";
    const errStatus = error?.response?.status ? error?.response?.status : 500;
    commonResponse(res, errStatus, null, err, "v1-auth-server-003");
  }
};

/**
 * This function use to send sign in to system
 * @param {*} req : HTTP request
 * @param {*} res : HTTP response
 */
exports.signIn = async (req, res) => {
  try {
    const user = await findUserByEmail(req.body.email);
    if (!user) {
      commonResponse(res, 401, null, "Invalid email or password", "v1-auth-server-004");
      return;
    }
      
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      commonResponse(res, 401, null, "Invalid email or password", "v1-auth-server-005");
      return;
    }

    common.setSessionTokenCookie(res, user);
    commonResponse(res, 200, {
      isLoggedIn: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        isAccess: true
      }
    });
  } catch (error) {
    console.log("signIn ERROR::", error);
    commonResponse(res, 500, null, error?.message || "server error", "v1-auth-server-007");
  }
};

/**
 * This function use to send sign out from the system
 * @param {*} req : HTTP request
 * @param {*} res : HTTP response
 */
exports.signOut = async (req, res) => {
  try {
    res.clearCookie("sessionTokenCookie");
    //Return success response
    commonResponse(res, 200, { Message: "Logout" });
  } catch (error) {
    console.log("signOut ERROR::", error);
    commonResponse(res, 500, null, error?.message || "server error", "v1-auth-server-008");
  }
};

/**
 * This function use to get users detail
 * @param {*} req : HTTP request
 * @param {*} res : HTTP response
 */
exports.getUser = async (req, res) => {
  try {
    // Fix: Handle undefined query parameters properly
    const pageNo = req.query.pageNo;
    const pageSize = req.query.pageSize;
    
    // Debug logging
    console.log("Raw auth query params - pageNo:", pageNo, "pageSize:", pageSize);
    
    // Parse with proper defaults and validation
    let page = parseInt(pageNo) || 1;  // Default to page 1
    let limit = parseInt(pageSize) || 10;  // Default to 10 items
    
    // Ensure valid ranges
    page = Math.max(1, page);  // Minimum page 1
    limit = Math.max(1, Math.min(100, limit));  // Between 1-100 items
    
    console.log("Processed auth params - page:", page, "limit:", limit);

    const User = await findAllUser(page, limit);
    const Count = await userCount();
    
    //Return success response
    commonResponse(res, 200, { 
      data: User, 
      total: Count,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(Count / limit)
      }
    });
  } catch (error) {
    console.log("getUser ERROR::", error);
    const err = error?.response?.data ? error?.response?.data : error?.message || "server error";
    const errStatus = error?.response?.status ? error?.response?.status : 500;
    commonResponse(res, errStatus, null, err, "v1-auth-server-009");
  }
};

/**
 * This function use to delete user detail
 * @param {*} req : HTTP request
 * @param {*} res : HTTP response
 */
exports.deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    
    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return commonResponse(res, 400, null, "Valid ID parameter is required", "v1-auth-server-010");
    }
    
    console.log("Deleting user with ID:", id);
    
    // Delete from user model
    const result = await deleteUsers(id);
    
    console.log("Delete user result:", result);
    
    // Fix: For MySQL, we check the success property instead of modifiedCount
    if (result.success) {
      commonResponse(res, 200, result);
    } else {
      commonResponse(res, 404, null, result.message || "No Records to delete", "v1-auth-server-010");
    }
  } catch (error) {
    console.log("deleteUser ERROR::", error);
    
    // Handle specific error cases
    if (error.message.includes("No user found")) {
      return commonResponse(
        res,
        404,
        null,
        "User not found",
        "v1-auth-server-010"
      );
    }
    
    commonResponse(res, 500, null, error?.message || "server error", "v1-auth-server-011");
  }
};