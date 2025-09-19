import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./features/authSlice";
import thunk from "redux-thunk";
import logger from "redux-logger";

// Auth persist configuration
const authPersistConfig = {
  key: "auth", // Key for local storage
  storage // Storage engine type (localStorage)
};

// Persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Combine reducers
const rootReducer = combineReducers({
  // Persisted reducers
  auth: persistedAuthReducer
});

// Middlewares
const middleware = [thunk];

// Check if the environment is in development
if (process.env.NODE_ENV === "development") {
  // Include the logger middleware only in development
  middleware.push(logger);
}

// Configure and create the Redux store
const store = configureStore({
  reducer: rootReducer,
  middleware: [...middleware]
});

// Persistor object for rehydration
const persistor = persistStore(store);

export { store, persistor };
