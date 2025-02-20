import { reactRouter } from "@react-router/dev/vite";
import { reactRouterDevTools } from "react-router-devtools";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { remixPWA } from "@remix-pwa/dev";

export default defineConfig(({ mode }) => ({
  plugins: [
    mode === "development" && reactRouterDevTools(),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    remixPWA()
  ].filter(Boolean)
}));
