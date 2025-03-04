import { index, layout, prefix, route } from "@react-router/dev/routes";

export const adminRoutes = [
  route("admin", "routes/admin/layout.tsx", [
    index("routes/admin/home.tsx"),
    //  Categories
    ...prefix("categories", [
      index("routes/admin/categories/list.tsx"),
      route("create", "routes/admin/categories/create.tsx"),
      route(":id/edit", "routes/admin/categories/edit.tsx")
    ]),
    //  Emails
    ...prefix("emails", [index("routes/admin/emails/send.tsx")]),
    //  Gallery
    ...prefix("gallery", [
      index("routes/admin/gallery/list.tsx"),
      route("upload", "routes/admin/gallery/upload.tsx")
    ]),
    // Live Sessions
    ...prefix("live-sessions", [
      index("routes/admin/live-sessions/list.tsx"),
      route("create", "routes/admin/live-sessions/create.tsx")
      // route(":id/detail", "routes/admin/live-sessions/detail.tsx")
    ]),
    //  Orders
    ...prefix("orders", [
      index("routes/admin/orders/list.tsx"),
      route(":id/detail", "routes/admin/orders/detail.tsx")
    ]),
    //  Posts
    ...prefix("post", [
      index("routes/admin/posts/list.tsx"),
      route("create", "routes/admin/posts/create.tsx"),
      route(":id/edit", "routes/admin/posts/edit.tsx")
    ]),
    // Products
    ...prefix("products", [
      index("routes/admin/products/list.tsx"),
      route(":id/detail", "routes/admin/products/detail.tsx"),
      route("create", "routes/admin/products/create.tsx"),
      route(":id/edit", "routes/admin/products/edit.tsx")
    ]),
    // Reset Tokens
    route("tokens", "routes/admin/resetToken/reset-token.tsx"),
    //  Questions
    ...prefix("questions", [
      index("routes/admin/questions/list.tsx"),
      route(":id/detail", "routes/admin/questions/detail.tsx")
    ]),
    // Users
    ...prefix("users", [
      index("routes/admin/users/list.tsx")
      // route(":id/edit", "routes/admin/videos/edit.tsx"),
    ]),
    // Video Blogs
    ...prefix("videos", [
      index("routes/admin/videos/list.tsx"),
      route("create", "routes/admin/videos/create.tsx"),
      route(":id/edit", "routes/admin/videos/edit.tsx")
    ]),
    //  Webhooks
    ...prefix("webhooks", [
      index("routes/admin/webhooks/list.tsx"),
      route("create", "routes/admin/webhooks/create.tsx"),
      route("edit/:id", "routes/admin/webhooks/edit.tsx")
    ])
  ])
];
