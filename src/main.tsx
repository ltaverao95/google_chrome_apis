import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";

import App from "./App";
import "./styles/global.css";
import "./styles/theme.css";
import "./styles/project-styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
      <SpeedInsights />
      <App />
  </React.StrictMode>
);
