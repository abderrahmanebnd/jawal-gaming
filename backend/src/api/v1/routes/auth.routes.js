const { commonMiddleware } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const { auth } = require("../validators");

module.exports = function (app) {
  // Current API version in use
  const apiVersion = "v1";

  // Add user route
  app.post(
    `/api/${apiVersion}/auth/user-management/add-user`,
    [...auth.signUpInitiateValidator, commonMiddleware.requestErrorHandler],
    controller.signUp
  );
  // Edit user route
  app.post(
    `/api/${apiVersion}/auth/user-management/edit-user`,
    [...auth.editSignUpValidator, commonMiddleware.requestErrorHandler],
    controller.editSignUp
  );
  // Get user route
  app.get(
    `/api/${apiVersion}/auth/user-management/get-user`,
    [...auth.getUserValidator, commonMiddleware.requestErrorHandler],
    controller.getUser
  );
  // Delete user route
  app.delete(
    `/api/${apiVersion}/auth/user-management/delete-user`,
    [...auth.deleteUserValidator, commonMiddleware.requestErrorHandler],
    controller.deleteUser
  );
  // SignIn route
  app.post(`/api/${apiVersion}/auth/signIn`, [...auth.signInValidator, commonMiddleware.requestErrorHandler], controller.signIn);
  // SignOut route
  app.get(`/api/${apiVersion}/auth/signOut`, [commonMiddleware.requestErrorHandler], controller.signOut);
};
