import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, prefix, route } from "@react-router/dev/routes";
import { adminRoutes } from "./routes/admin/routes";

export default [
  index("routes/welcome/index.tsx"),
  route("about", "routes/welcome/about.tsx"),
  route("plans", "routes/welcome/plans.tsx"),
  route("gallery", "routes/gallery/index.tsx"),
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
  route("payments", "routes/payments/layout.tsx", [
    route("subscribe", "routes/payments/subscribe.tsx"),
    route("setup", "routes/payments/setup.tsx"),
    route("checkout", "routes/payments/payment.tsx")
  ]),
  route("payments/success", "routes/payments/success.tsx"),
  route("store", "routes/shop/store.tsx"),
  route("cart", "routes/shop/cart.tsx"),
  route("help", "routes/help.tsx"),

  // Profile
  route("profile", "routes/profile/layout.tsx", [
    index("routes/profile/index.tsx"),
    route("favorites", "routes/profile/favorites.tsx"),
    route("invoices", "routes/profile/invoices.tsx"),
    route("subscription", "routes/profile/subscription.tsx"),
    route("orders", "routes/profile/orders.tsx"),
    route("plan", "routes/profile/plan/index.tsx", [
      route("update", "routes/profile/plan/update.tsx"),
      route("delete", "routes/profile/plan/delete.tsx"),
      route("confirmation", "routes/profile/plan/confirmation.tsx")
    ]),
    route("questions", "routes/profile/questions.tsx"),
    route("settings", "routes/profile/settings.tsx")
  ]),

  // Members
  route("members", "routes/members/layout.tsx", [
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
      route("live/chat", "routes/chat/index.tsx"),
      // Live Stream Chat
      route("live/chat/stream", "routes/chat/stream.tsx")
    ])
  ]),

  // API Routes
  ...prefix("api", [
    route("/comments", "routes/api/comments.tsx"),
    route("/create-payment-intent", "routes/api/paymentIntent.tsx"),
    route("/invoice", "routes/api/invoice.tsx"),
    route("/deduct-balance", "routes/api/deduct-balance.tsx"),
    route("/subscription", "routes/api/subscription.tsx"),
    route("/webhook", "routes/api/webhooks.tsx")
  ]),

  // Add the admin routes
  ...adminRoutes
  // PWA Manifest Route
  // route("/manifest", "routes/manifest.ts")
] satisfies RouteConfig;
