export const STORAGE_KEYS = {
  FAVORITES: "jawalgames_favorites",
  GAMES: "jawalgames_games",
  NAV_LINKS: "jawalgames_nav_links",
  FOOTER_LINKS: "jawalgames_footer_links",
  ADMIN_SESSION: "jawalgames_admin_session",
};

const isBrowser = typeof window !== "undefined";

export class StorageManager {
  static get(key) {
    if (!isBrowser) return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  }

  static set(key, value) {
    if (!isBrowser) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Error writing to localStorage:", error);
      return false;
    }
  }

  static remove(key) {
    if (!isBrowser) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing from localStorage:", error);
      return false;
    }
  }

  static getFavorites() {
    return this.get(STORAGE_KEYS.FAVORITES) || [];
  }

  static setFavorites(favorites) {
    return this.set(STORAGE_KEYS.FAVORITES, favorites);
  }

  static getGames() {
    return this.get(STORAGE_KEYS.GAMES);
  }

  static setGames(games) {
    return this.set(STORAGE_KEYS.GAMES, games);
  }

  static getNavLinks() {
    return this.get(STORAGE_KEYS.NAV_LINKS);
  }

  static setNavLinks(links) {
    return this.set(STORAGE_KEYS.NAV_LINKS, links);
  }

  static getFooterLinks() {
    return this.get(STORAGE_KEYS.FOOTER_LINKS);
  }

  static setFooterLinks(links) {
    return this.set(STORAGE_KEYS.FOOTER_LINKS, links);
  }

  static getAdminSession() {
    return this.get(STORAGE_KEYS.ADMIN_SESSION);
  }

  static setAdminSession(session) {
    return this.set(STORAGE_KEYS.ADMIN_SESSION, session);
  }

  static clearAll() {
    Object.values(STORAGE_KEYS).forEach((key) => this.remove(key));
  }
}
