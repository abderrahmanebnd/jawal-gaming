const { commonMiddleware } = require("../middlewares");
const controller = require("../controllers/nav.controller");
const authController = require("../controllers/auth.controller");

//TODO: we should add authMiddleware to protect these routes only for admin users

module.exports = function (app) {
  // Current API version in use
  const apiVersion = "v1";

  
  //Draft game route
  app.get(
    `/api/${apiVersion}/nav/view-nav`,
    [commonMiddleware.requestErrorHandler],
    controller.viewNav
  );

  // Add game route
  app.post(
    `/api/${apiVersion}/nav/add-nav`,
    [authController.protect,authController.restrictTo('admin'),commonMiddleware.requestErrorHandler],
    controller.addNav
  );

  //Delete game route
  app.delete(
    `/api/${apiVersion}/nav/delete-nav`,
    [authController.protect,authController.restrictTo('admin'),commonMiddleware.requestErrorHandler],
    controller.deleteNav
  );

};
