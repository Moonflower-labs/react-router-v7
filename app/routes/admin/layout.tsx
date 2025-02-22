import { AiFillProduct } from "react-icons/ai";
import { BiCategoryAlt, BiSolidVideos } from "react-icons/bi";
import { FaHome, FaQuestion, FaRegImages } from "react-icons/fa";
import { GiQuillInk } from "react-icons/gi";
import { HiMiniShoppingBag } from "react-icons/hi2";
import { PiUsersThreeFill } from "react-icons/pi";
import { RiLiveLine, RiWebhookFill } from "react-icons/ri";
import { href, NavLink, Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { requireUserId } from "~/utils/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  return await requireUserId(request);
}

export default function AdminLayout() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="hidden md:block w-52 shrink-0" />
      <div
        role="tablist"
        className="bg-base-200 flex flex-wrap md:flex-nowrap flex-row md:flex-col gap-1 py-1 justify-center md:justify-start w-full overflow-x-auto md:w-52 sticky top-[72px] md:fixed md:left-0 z-50 h-auto md:h-[calc(100vh-72px)] rounded-lg">
        {LINKS.map(({ href, icon, text }) => (
          <NavLink
            to={href}
            role="tab"
            className={({ isActive }) =>
              `flex flex-col justify-start items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
            }
            end
            viewTransition>
            {icon}
            {text ? <span className="text-xs md:text-lg">{text}</span> : null}
          </NavLink>))}
      </div>
      <div className="min-h-screen px-3 w-full">
        <Outlet />
      </div>
    </div>
  );
}

const LINKS = [
  { href: href("/admin"), icon: <FaHome size={24} /> },
  { href: href("/admin/post"), icon: <GiQuillInk size={20} />, text: "Posts" },
  { href: href("/admin/videos"), icon: <BiSolidVideos size={20} />, text: "Videos" },
  { href: href("/admin/categories"), icon: <BiCategoryAlt size={20} />, text: "Categorías" },
  { href: href("/admin/questions"), icon: <FaQuestion size={20} />, text: "Preguntas" },
  { href: href("/admin/orders"), icon: <HiMiniShoppingBag size={20} />, text: "Pedidos" },
  { href: href("/admin/products"), icon: <AiFillProduct size={20} />, text: "Productos" },
  { href: href("/admin/live-sessions"), icon: <RiLiveLine size={20} />, text: "Sessiones" },
  { href: href("/admin/gallery"), icon: <FaRegImages size={20} />, text: "Imágenes" },
  { href: href("/admin/users"), icon: <PiUsersThreeFill size={20} />, text: "Usuarios" },
  { href: href("/admin/webhooks"), icon: <RiWebhookFill size={20} />, text: "Webhooks" },
  { href: href("/admin/emails"), icon: <RiWebhookFill size={20} />, text: "Emails" },
]