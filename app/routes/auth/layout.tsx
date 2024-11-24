import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div data-testid="auth-layout" className="hero min-h-screen">
      <div className="hero-content flex-col lg:flex-row gap-8">
        <img src={"logo.jpeg"} width={200} className="max-w-sm rounded-lg shadow-2xl" alt="" />
        <Outlet />
      </div>
    </div>
  );
}
