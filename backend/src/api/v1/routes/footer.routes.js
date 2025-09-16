const { commonMiddleware } = require("../middlewares");
const controller = require("../controllers/footer.controller");
const authController = require("../controllers/auth.controller");

//TODO: we should add authMiddleware to protect these routes only for admin users

module.exports = function (app) {
  // Current API version in use
  const apiVersion = "v1";

  //Draft game route
  app.get(
    `/api/${apiVersion}/footer/view-footer`,
    [commonMiddleware.requestErrorHandler],
    controller.viewFooter
  );

  // Add game route
  app.post(
    `/api/${apiVersion}/footer/add-footer`,
    [authController.protect,authController.restrictTo('admin'),commonMiddleware.requestErrorHandler],
    controller.addFooter
  );
  //Delete game route
  app.delete(
    `/api/${apiVersion}/footer/delete-footer`,
    [authController.protect,authController.restrictTo('admin'),commonMiddleware.requestErrorHandler],
    controller.deleteFooter
  );
};
