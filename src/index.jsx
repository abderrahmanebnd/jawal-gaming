import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/js/bootstrap.bundle.js";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";
import { HelmetProvider } from "react-helmet-async";

const container = document.getElementById("root");

// ⚡ Hydrate if server/prerendered HTML already exists
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    container,
    <React.StrictMode>
      <HelmetProvider>
        <BrowserRouter>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <App />
            </PersistGate>
          </Provider>
        </BrowserRouter>
      </HelmetProvider>
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <HelmetProvider>
        <BrowserRouter>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <App />
            </PersistGate>
          </Provider>
        </BrowserRouter>
      </HelmetProvider>
    </React.StrictMode>
  );
}
