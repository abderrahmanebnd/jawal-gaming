const { commonMiddleware } = require("../middlewares");
const controller = require("../controllers/nav.controller");

module.exports = function (app) {
  // Current API version in use
  const apiVersion = "v1";

  // Add game route
  app.post(
    `/api/${apiVersion}/nav/add-nav`,
    [commonMiddleware.requestErrorHandler],
    controller.addNav
  );

  //Draft game route
  app.get(
    `/api/${apiVersion}/nav/view-nav`,
    [commonMiddleware.requestErrorHandler],
    controller.viewNav
  );

  //Delete game route
  app.delete(
    `/api/${apiVersion}/nav/delete-nav`,
    [commonMiddleware.requestErrorHandler],
    controller.deleteNav
  );

};
