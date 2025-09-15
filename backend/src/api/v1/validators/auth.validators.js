const { check, body } = require("express-validator");

// Validator for sign up request
const signUpInitiateValidator = [
  // Email
  check("email")
    .notEmpty()
    .withMessage("Email address is required.")
    .isEmail()
    .withMessage("Email address is invalid."),

  // _id (optional for updates)
  body("_id").optional(),

  // Password (only required if creating new user, not updating)
  body("password")
    .if(body("_id").not().exists())
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must have at least 8 characters."),

  // Role (optional but must be either ADMIN or USER if provided)
  body("role")
    .optional()
    .isIn(["user"])
    .withMessage("Role must be USER."),

  // Status (optional but must be one of the allowed values)
  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
    .withMessage("Invalid status."),
];

// Validator for edit user request
const editSignUpValidator = [
  check("username").notEmpty().withMessage("Username is required."),
  check("email")
    .notEmpty()
    .withMessage("Email address is required.")
    .isEmail()
    .withMessage("Email address is invalid."),
  check("role")
    .notEmpty()
    .withMessage("User role is required.")
// .isIn(["ADMIN", "USER"])
    .isIn(["user"])
    .withMessage("Role must be USER."),
  check("status")
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(["ACTIVE", "INACTIVE", "SUSPENDED"])
    .withMessage("Invalid status."),
  check("modifyDate").notEmpty().withMessage("Modify date is required."),
];

// Validator for sign in request
const signInValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email address is required.")
    .isEmail()
    .withMessage("Email address is invalid."),
  check("password").notEmpty().withMessage("Password is required."),
];

// Validator for get user detail request (pagination)
const getUserValidator = [
  check("pageNo")
    .notEmpty()
    .withMessage("PageNo is required.")
    .isInt({ min: 1 })
    .withMessage("PageNo must be a positive integer."),
  check("pageSize")
    .notEmpty()
    .withMessage("PageSize is required.")
    .isInt({ min: 1, max: 100 })
    .withMessage("PageSize must be between 1 and 100."),
];

// Validator for delete user request
const deleteUserValidator = [
  check("id").notEmpty().withMessage("ID is required."),
];

const auth = {
  signUpInitiateValidator,
  editSignUpValidator,
  signInValidator,
  getUserValidator,
  deleteUserValidator,
};

module.exports = auth;
