const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const apiEndPoints = {

  //User Management
  signIn: `${BASE_URL}/api/v1/auth/signIn`,
  signOut: `${BASE_URL}/api/v1/auth/signOut`,
  getMe: `${BASE_URL}/api/v1/auth/me`,
  verifyOtp: `${BASE_URL}/api/v1/auth/verify-otp`,
  resendOtp: `${BASE_URL}/api/v1/auth/resend-otp`,
  addUser: `${BASE_URL}/api/v1/auth/user-management/add-user`,
  editUser: `${BASE_URL}/api/v1/auth/user-management/edit-user`,
  getUser: `${BASE_URL}/api/v1/auth/user-management/get-user`,
  deleteUser: `${BASE_URL}/api/v1/auth/user-management/delete-user`,

  //Game Management
  addGame: `${BASE_URL}/api/v1/game/add-game`,
  viewGame: `${BASE_URL}/api/v1/game/view-game`,
  byIdGame: `${BASE_URL}/api/v1/game/id-game`,
  deleteGame: `${BASE_URL}/api/v1/game/delete-game`,
  topGames: `${BASE_URL}/api/v1/game/top`,
  getGamesByIds: `${BASE_URL}/api/v1/game/by-ids`,

  //Nav Management
  addNav: `${BASE_URL}/api/v1/nav/add-nav`,
  viewNav: `${BASE_URL}/api/v1/nav/view-nav`,
  deleteNav: `${BASE_URL}/api/v1/nav/delete-nav`,


  //Footer Management
  addFooter: `${BASE_URL}/api/v1/footer/add-footer`,
  viewFooter: `${BASE_URL}/api/v1/footer/view-footer`,
  deleteFooter: `${BASE_URL}/api/v1/footer/delete-footer`,

  toggleLike: `${BASE_URL}/api/v1/game/add-like`,
  updateViews: `${BASE_URL}/api/v1/game/updateViews`,
};
