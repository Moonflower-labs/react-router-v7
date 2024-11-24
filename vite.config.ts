import { reactRouter } from "@react-router/dev/vite";
import { reactRouterDevTools } from "react-router-devtools";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    // reactRouterDevTools(),
    reactRouter({
      // async prerender({ getStaticPaths }) {
      //   let posts = await fetchPosts({ page: 1, pageSize: 10 });
      //   let staticPaths = getStaticPaths();
      //   return staticPaths.concat(posts.posts.map((post) => post.id));
      // },
    }),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      app: path.resolve(__dirname, "./app")
    }
  }
});
