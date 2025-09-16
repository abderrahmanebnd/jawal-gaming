const { commonMiddleware } = require("../middlewares");
const controller = require("../controllers/game.controller");
const authController = require("../controllers/auth.controller");

//TODO: we should add authMiddleware to protect these routes only for admin users

module.exports = function (app) {
  // Current API version in use
  const apiVersion = "v1";

  //get game route
  app.get(
    `/api/${apiVersion}/game/view-game`,
    [commonMiddleware.requestErrorHandler],
    controller.viewGame
  );

  app.get(
    `/api/${apiVersion}/game/top`,
    [commonMiddleware.requestErrorHandler],
    controller.getTopGames
  );

  app.get(
    `/api/${apiVersion}/game/by-ids`,
    [commonMiddleware.requestErrorHandler],
    controller.getByIdsPaged
  );

  //get game by id route
  app.get(
    `/api/${apiVersion}/game/id-game`,
    [commonMiddleware.requestErrorHandler],
    controller.getById
  );

  // Add game route
  app.post(
    `/api/${apiVersion}/game/add-game`,
    [authController.protect,authController.restrictTo('admin'),commonMiddleware.requestErrorHandler],
    controller.addGame
  );

  //Delete game route
  app.delete(
    `/api/${apiVersion}/game/delete-game`,
    [authController.protect,authController.restrictTo('admin'),commonMiddleware.requestErrorHandler],
    controller.deleteGame
  );
};
