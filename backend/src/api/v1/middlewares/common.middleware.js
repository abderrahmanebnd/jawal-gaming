const { commonResponse, decrypt, refreshSessionTokenCookie } = require("../common/common");
const { validationResult } = require("express-validator");
const config = require("../../../config/config.json");
const jwt = require("jsonwebtoken");
const common = require("../common/common");
/**
 * This function use to validate client requests
 * @param {*} req: HTTP request
 * @param {*} res: HTTP response
 * @param {*} next: next() function that pass the control
 * @returns
 */
const requestErrorHandler = (req, res, next) => {
  const errors = validationResult(req);
  // Checking for errors
  if (!errors.isEmpty()) {
    commonResponse(res, 400, { errors: errors?.errors }, "invalid client request", "v1-common-001");
    return;
  }
  next();
};

const getSessionTokenFromCookie = (requiredRoles = []) => {
  return (req, res, next) => {
    const sessionTokenCookie = req?.cookies?.sessionTokenCookie;

    // Step 1: Check if the cookie exists
    if (!sessionTokenCookie) {
      commonResponse(res, 401, null, "Cookie not found", "v1-common-002");
      return;
    }

    try {
      // Step 2: Decrypt the session token
      const decryptedSessionToken = decrypt(sessionTokenCookie);
      if (!decryptedSessionToken) {
        commonResponse(res, 401, null, "Invalid session token", "v1-common-003");
        return;
      }

      // Step 3: Verify the token
      const decoded = jwt.verify(decryptedSessionToken, config.cookieSecretKey);
      req.sessionToken = decoded;

      // Step 4: Role Verification
      if (!(requiredRoles?.length > 0) || !decoded?.roles?.some(role => requiredRoles.includes(role))) {
        commonResponse(res, 403, null, "Access forbidden: insufficient permissions!", "v1-common-005");
        return;
      }
      common.refreshSessionTokenCookie(res, decoded);
    } catch (error) {
      commonResponse(res, 401, null, { error: error.message }, "v1-common-004");
      return;
    }
    next();
  };
};

const commonMiddleware = { requestErrorHandler, getSessionTokenFromCookie };

module.exports = commonMiddleware;
