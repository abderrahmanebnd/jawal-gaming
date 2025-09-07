const { check, body } = require("express-validator");

// Validator for sign up request
const signUpInitiateValidator = [
  // Validation rule for email
  check("email").notEmpty().withMessage("Email address is required.").isEmail().withMessage("Email address is invalid."),
  // Validation rule for id
  body("_id").optional(),
  // Validation rule for password
  body("password")
    .if(body("_id").not().exists())
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must have at least 8 characters.")
];
// Validator for edit user request
const editSignUpValidator = [
  // Validation rule for username
  check("username").notEmpty().withMessage("username is required."),
  // Validation rule for email
  check("email").notEmpty().withMessage("Email address is required.").isEmail().withMessage("Email address is invalid."),
  // Validation rule for role
  check("role").notEmpty().withMessage("User role is required."),
  // Validation rule for status
  check("status").notEmpty().withMessage("Status is required."),
  // Validation rule for modify date
  check("modifyDate").notEmpty().withMessage("Modify date is required.")
];
// Validator for signIn request
const signInValidator = [
  // Validation rule for email
  check("email").notEmpty().withMessage("Email address is required.").isEmail().withMessage("Email address is invalid."),
  // Validation rule for password
  check("password").notEmpty().withMessage("Password is required.")
];
// Validator for get user detail request
const getUserValidator = [
  // Validation rule for pageNo
  check("pageNo").notEmpty().withMessage("PageNo is required."),
  // Validation rule for pageSize
  check("pageSize").notEmpty().withMessage("PageSize is required.")
];
// Validator for delete user detail request
const deleteUserValidator = [
  // Validation rule for id
  check("id").notEmpty().withMessage("ID is required.")
];

const auth = {
  signUpInitiateValidator,
  editSignUpValidator,
  signInValidator,
  getUserValidator,
  deleteUserValidator
};

module.exports = auth;
