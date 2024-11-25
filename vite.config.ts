import { reactRouter } from "@react-router/dev/vite";
import { reactRouterDevTools } from "react-router-devtools";
import tsconfigPaths from "vite-tsconfig-paths";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer]
    }
  },
  plugins: [
    mode === "development" && reactRouterDevTools(),
    reactRouter(),
    tsconfigPaths()
  ].filter(Boolean)
}));
