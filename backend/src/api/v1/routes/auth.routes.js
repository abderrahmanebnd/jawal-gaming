const { commonMiddleware } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const { auth } = require("../validators");

module.exports = function (app) {
  // Current API version in use
  const apiVersion = "v1";

  // Edit user route
  // app.post(
  //   `/api/${apiVersion}/auth/user-management/edit-user`,
  //   [...auth.editSignUpValidator, commonMiddleware.requestErrorHandler],
  //   controller.editSignUp
  // );
  // Get user route
  // app.get(
  //   `/api/${apiVersion}/auth/user-management/get-user`,
  //   [...auth.getUserValidator, commonMiddleware.requestErrorHandler],
  //   controller.getUser
  // );
  // Delete user route
  // app.delete(
  //   `/api/${apiVersion}/auth/user-management/delete-user`,
  //   [...auth.deleteUserValidator, commonMiddleware.requestErrorHandler],
  //   controller.deleteUser
  // );

  // Add user route (signup)
  app.post(
    `/api/${apiVersion}/auth/user-management/add-user`,
    [...auth.signUpInitiateValidator, commonMiddleware.requestErrorHandler],
    controller.signup
  );

  // SignIn route
  app.post(
    `/api/${apiVersion}/auth/signIn`,
    [...auth.signInValidator, commonMiddleware.requestErrorHandler],
    controller.login
  );
  app.post(
    `/api/${apiVersion}/auth/verify-otp`,
    [commonMiddleware.requestErrorHandler],
    controller.verifyOtp
  );

  // SignOut route
  app.post(
    `/api/${apiVersion}/auth/signOut`,
    [commonMiddleware.requestErrorHandler],
    controller.logout
  );

  app.post(
    `/api/${apiVersion}/auth/me`,
    [commonMiddleware.requestErrorHandler],
    controller.getMe
  );

}