import type { Config } from "@react-router/dev/config";
// import { fetchPosts } from "~/models/post.server";

export default {
  ssr: true,

  // any url
  // prerender: ["/", "/help"],

  // async prerender({ getStaticPaths }) {
  //   let posts = await fetchPosts({ page: 1, pageSize: 10 });
  //   let staticPaths = getStaticPaths();
  //   return staticPaths.concat(posts.posts.map(post => post.id));
  // }
  future: {
    unstable_optimizeDeps: true,
    unstable_splitRouteModules: true
  }
} satisfies Config;
