// /utility/api.js
// Mock API functions for future backend integration

export class GameAPI {
  static async getAllGames() {
    // In production, replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: [], // Games from backend
          total: 0
        });
      }, 1000);
    });
  }

  static async getGame(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: null // Game from backend
        });
      }, 500);
    });
  }

  static async createGame(gameData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { ...gameData, id: Date.now() }
        });
      }, 1000);
    });
  }

  static async updateGame(id, gameData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { ...gameData, id }
        });
      }, 1000);
    });
  }

  static async deleteGame(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }
}

export class ContentAPI {
  static async getNavLinks() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: []
        });
      }, 500);
    });
  }

  static async updateNavLinks(links) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: links
        });
      }, 500);
    });
  }

  static async getFooterLinks() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: []
        });
      }, 500);
    });
  }

  static async updateFooterLinks(links) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: links
        });
      }, 500);
    });
  }
}