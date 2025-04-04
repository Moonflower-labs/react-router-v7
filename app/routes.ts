import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, prefix, route } from "@react-router/dev/routes";
import { adminRoutes } from "./routes/admin/routes";

export default [
  index("routes/welcome/index.tsx"),
  route("about", "routes/welcome/about.tsx"),
  route("plans", "routes/welcome/plans.tsx"),
  route("gallery/", "routes/gallery/index.tsx"),
  route("gallery/image/:id", "routes/gallery/detail.tsx"),

  // Auth
  layout("routes/auth/layout.tsx", [
    route("login", "routes/auth/login.tsx"),
    route("logout", "routes/auth/logout.tsx"),
    route("register", "routes/auth/register.tsx"),
    route("forgot-password", "routes/auth/forgot-password.tsx"),
    route("reset-password", "routes/auth/reset-password.tsx")
  ]),

  // Payments
  route("payments", "routes/payments/layout.tsx", { id: "stripe" }, [
    route("subscribe", "routes/payments/subscribe.tsx"),
    route("setup", "routes/payments/setup.tsx"),
    route("checkout", "routes/payments/payment.tsx")
  ]),
  route("payments/success", "routes/payments/success.tsx"),
  // Store
  route("store", "routes/shop/store.tsx"),
  route("store/product/:productId/reviews", "routes/shop/product-reviews.tsx"),
  route("cart", "routes/shop/cart.tsx"),
  // Help
  route("help", "routes/help.tsx"),
  // Profile
  route("profile", "routes/profile/layout.tsx", [
    index("routes/profile/dashboard.tsx"),
    route("favorites", "routes/profile/favorites.tsx"),
    route("invoices", "routes/profile/invoices.tsx"),
    route("orders/", "routes/profile/orders/list.tsx"),
    route("orders/:orderId", "routes/profile/orders/detail.tsx"),
    route("questions/", "routes/profile/questions.tsx"),
    route("subscription", "routes/profile/subscription/index.tsx", { id: "profile-subscription" }, [
      route("update", "routes/profile/subscription/update.tsx"),
      route("delete", "routes/profile/subscription/delete.tsx")
    ]),
    route("settings", "routes/profile/settings.tsx")
  ]),

  // Members
  route("members", "routes/members/layout.tsx", [
    index("routes/members/index.tsx"),
    // Personality plan
    route("personality", "routes/members/personality/layout.tsx", [
      index("routes/members/personality/index.tsx"),
      route("post/:id", "routes/members/personality/detail.tsx"),
      route("question", "routes/members/personality/question.tsx")
    ]),

    // Soul plan
    route("soul", "routes/members/soul/layout.tsx", [
      index("routes/members/soul/index.tsx"),
      route("video/:id", "routes/members/soul/detail.tsx"),
      route("question", "routes/members/soul/question.tsx")
    ]),
    // Spirit plan
    route("spirit", "routes/members/spirit/layout.tsx", [
      index("routes/members/spirit/index.tsx"),
      route("video/:id", "routes/members/spirit/detail.tsx"),
      route("question", "routes/members/spirit/question.tsx"),
      route("live", "routes/members/spirit/live.tsx"),
      route("live/chat/:roomId", "routes/members/spirit/chat/room.tsx")
    ])
  ]),
  // Live Stream Chat
  route("chat/stream", "routes/members/spirit/chat/stream.tsx"),
  // API Routes
  ...prefix("api", [
    route("/comments", "routes/api/comments.tsx"),
    route("chat/leave", "routes/members/spirit/chat/leave.tsx"),
    route("chat/missed", "routes/members/spirit/chat/missed.tsx"),
    route("order/:orderId/pdf", "routes/api/download-order.tsx"),
    route("update-guest-order", "routes/api/update-guest-order.tsx"),
    route("/webhook", "routes/api/webhooks.tsx")
  ]),

  // Add the admin routes
  ...adminRoutes
  // PWA Manifest Route
  // route("/manifest", "routes/manifest.ts")
] satisfies RouteConfig;
