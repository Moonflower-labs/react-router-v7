import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, prefix, route } from "@react-router/dev/routes";
import { adminRoutes } from "./routes/admin/routes";

export default [
  index("routes/home/home.tsx"),
  // Auth
  layout("routes/auth/layout.tsx", [
    route("login", "routes/auth/login.tsx"),
    route("logout", "routes/auth/logout.tsx"),
    route("register", "routes/auth/register.tsx"),
    route("forgot-password", "routes/auth/forgot-password.tsx"),
    route("reset-password", "routes/auth/reset-password.tsx")
  ]),

  // Payments
  ...prefix("payments", [
    layout("routes/payments/layout.tsx", [
      route("subscribe", "routes/payments/subscribe.tsx"),
      route("setup", "routes/payments/setup.tsx"),
      route("checkout", "routes/payments/payment.tsx")
    ]),
    route("success", "routes/payments/success.tsx")
  ]),
  route("store", "routes/shop/store.tsx"),
  route("cart", "routes/shop/cart.tsx"),
  route("help", "routes/help.tsx"),

  // Profile
  ...prefix("profile", [
    layout("routes/profile/layout.tsx", [
      index("routes/profile/index.tsx"),
      route("favorites", "routes/profile/favorites.tsx"),
      route("invoices", "routes/profile/invoices.tsx"),
      route("subscription", "routes/profile/subscription.tsx"),
      route("orders", "routes/profile/orders.tsx"),
      route("plan", "routes/profile/plan/index.tsx", [
        // index("routes/profile/plan/index.tsx"),
        route("update", "routes/profile/plan/update.tsx"),
        route("delete", "routes/profile/plan/delete.tsx"),
        route("confirmation", "routes/profile/plan/confirmation.tsx")
      ]),
      route("questions", "routes/profile/questions.tsx")
    ])
  ]),
  // Questions
  route("questions", "routes/questions/layout.tsx", [
    index("routes/questions/basic.tsx"),
    route("live", "routes/questions/live.tsx"),
    route("tarot", "routes/questions/tarot.tsx")
  ]),
  // Members
  layout("routes/members/layout.tsx", [
    // Personality plan
    ...prefix("personality", [
      index("routes/members/personality/index.tsx"),
      route("post/:id", "routes/members/personality/detail.tsx")
    ]),
    // Soul plan
    ...prefix("soul", [
      index("routes/members/soul/index.tsx"),
      route("video/:id", "routes/members/soul/detail.tsx")
    ]),

    // Spirit plan
    ...prefix("spirit", [
      index("routes/members/spirit/index.tsx"),
      route("video/:id", "routes/members/spirit/detail.tsx"),
      route("live", "routes/members/spirit/live.tsx")
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
] satisfies RouteConfig;
