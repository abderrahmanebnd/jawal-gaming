const { commonMiddleware } = require("../middlewares");
const controller = require("../controllers/game.controller");

//TODO: we should add authMiddleware to protect these routes only for admin users

module.exports = function (app) {
  // Current API version in use
  const apiVersion = "v1";

  // Add game route
  app.post(
    `/api/${apiVersion}/game/add-game`,
    [commonMiddleware.requestErrorHandler],
    controller.addGame
  );

  //get game route
  app.get(
    `/api/${apiVersion}/game/view-game`,
    [commonMiddleware.requestErrorHandler],
    controller.viewGame
  );
  app.get(
    `/api/${apiVersion}/game/stats`,
    [commonMiddleware.requestErrorHandler],
    controller.getGameStats
  );

  app.get(
    `/api/${apiVersion}/game/top`,
    [commonMiddleware.requestErrorHandler],
    controller.getTopGames
  );

  app.get(`/api/${apiVersion}/game/by-ids`,
    [commonMiddleware.requestErrorHandler],
    controller.getByIdsPaged);

  //get game by id route
  app.get(
    `/api/${apiVersion}/game/id-game`,
    [commonMiddleware.requestErrorHandler],
    controller.getById
  );


  //Delete game route
  app.delete(
    `/api/${apiVersion}/game/delete-game`,
    [commonMiddleware.requestErrorHandler],
    controller.deleteGame
  );

};
