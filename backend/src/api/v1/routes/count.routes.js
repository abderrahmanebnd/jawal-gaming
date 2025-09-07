const { commonMiddleware } = require("../middlewares");
const controller = require("../controllers/count.controller");

module.exports = function (app) {
  // Current API version in use
  const apiVersion = "v1";

  // Add game route
  app.post(
    `/api/${apiVersion}/game/add-like`,
    [commonMiddleware.requestErrorHandler],
    controller.addLike
  );

  //get game route
  app.post(
    `/api/${apiVersion}/game/updateViews`,
    [commonMiddleware.requestErrorHandler],
    controller.updateViews
  );
};