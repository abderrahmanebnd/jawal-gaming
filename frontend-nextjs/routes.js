export const RoutePaths = {
  base: "/",
  home: "/",
  notFound: "/not-found",
  game: "/:id",
  login: "/edarat-jeddah88",
  adminDashboard: "/dokhool-aledara623",
  userDashboard: "/",
  privacyPolicy:"/privacy-policy",
  verifyOtp:"/verify-otp"
};

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const apiEndPoints = {
  //User Management
  signIn: `${BASE_URL}/auth/signIn`,
  signOut: `${BASE_URL}/auth/signOut`,
  getMe: `${BASE_URL}/auth/me`,
  verifyOtp: `${BASE_URL}/auth/verify-otp`,
  resendOtp: `${BASE_URL}/auth/resend-otp`,
  addUser: `${BASE_URL}/auth/user-management/add-user`,
  editUser: `${BASE_URL}/auth/user-management/edit-user`,
  getUser: `${BASE_URL}/auth/user-management/get-user`,
  deleteUser: `${BASE_URL}/auth/user-management/delete-user`,

  //Game Management
  addGame: `${BASE_URL}/game/add-game`,
  viewGame: `${BASE_URL}/game/view-game`,
  byIdGame: `${BASE_URL}/game/id-game`,
  deleteGame: `${BASE_URL}/game/delete-game`,
  topGames: `${BASE_URL}/game/top`,
  getGamesByIds: `${BASE_URL}/game/by-ids`,

  //Nav Management
  addNav: `${BASE_URL}/nav/add-nav`,
  viewNav: `${BASE_URL}/nav/view-nav`,
  deleteNav: `${BASE_URL}/nav/delete-nav`,

  //Footer Management
  addFooter: `${BASE_URL}/footer/add-footer`,
  viewFooter: `${BASE_URL}/footer/view-footer`,
  deleteFooter: `${BASE_URL}/footer/delete-footer`,

  toggleLike: `${BASE_URL}/game/add-like`,
  updateViews: `${BASE_URL}/game/updateViews`,
  gameStats: `${BASE_URL}/game/stats`,
};
