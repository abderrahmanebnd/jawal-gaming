const { commonMiddleware } = require("../middlewares");
const controller = require("../controllers/game.controller");

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
    `/api/${apiVersion}/game/top`,
    [commonMiddleware.requestErrorHandler],
    controller.getTopGames
  );

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
