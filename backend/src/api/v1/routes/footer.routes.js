const { commonMiddleware } = require("../middlewares");
const controller = require("../controllers/footer.controller");

//TODO: we should add authMiddleware to protect these routes only for admin users

module.exports = function (app) {
  // Current API version in use
  const apiVersion = "v1";

  // Add game route
  app.post(
    `/api/${apiVersion}/footer/add-footer`,
    [commonMiddleware.requestErrorHandler],
    controller.addFooter
  );

  //Draft game route
  app.get(
    `/api/${apiVersion}/footer/view-footer`,
    [commonMiddleware.requestErrorHandler],
    controller.viewFooter
  );

  //Delete game route
  app.delete(
    `/api/${apiVersion}/footer/delete-footer`,
    [commonMiddleware.requestErrorHandler],
    controller.deleteFooter
  );

};
