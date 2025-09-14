import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/js/bootstrap.bundle.js";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthProvider.jsx";

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      
      <AuthProvider>
      <BrowserRouter>

        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);
