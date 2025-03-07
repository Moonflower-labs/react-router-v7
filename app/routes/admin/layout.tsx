import { AiFillProduct } from "react-icons/ai";
import { BiCategoryAlt, BiSolidVideos } from "react-icons/bi";
import { FaBars, FaHome, FaQuestion, FaRegImages } from "react-icons/fa";
import { GiQuillInk } from "react-icons/gi";
import { HiMiniShoppingBag } from "react-icons/hi2";
import { PiUsersThreeFill } from "react-icons/pi";
import { RiLiveLine, RiWebhookFill } from "react-icons/ri";
import { href, NavLink, Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { requireUserId } from "~/utils/session.server";
import { useCallback, useState } from "react";
import { motion } from "motion/react";
import { MdOutlineClose } from "react-icons/md";

export async function loader({ request }: Route.LoaderArgs) {
  return await requireUserId(request);
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(true);
  // Ref callback to capture the sidebar element
  const setSidebarRef = useCallback((node: HTMLDivElement | null) => {
    if (node && !collapsed) {
      const activeLink = node.querySelector(".active");
      activeLink?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [collapsed]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Collapsible Sidebar */}
      <motion.div
        animate={{
          height: collapsed ? 0 : "auto",
          width: collapsed ? 0 : "90%",
          opacity: collapsed ? 0 : 1,
        }}
        initial={false}
        ref={setSidebarRef}
        className="grid grid-rows-2 grid-flow-col gap-2 p-2 bg-base-200 sticky top-[72px] left-1.5 rounded-lg shadow-md overflow-x-auto z-50 w-full max-h-fit"
      >
        {!collapsed && (
          <>
            {LINKS.map(({ href, icon, text }) => (
              <NavLink
                key={href}
                to={href}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 rounded-md transition-all ${isActive ? "bg-primary text-primary-content" : ""
                  }`
                }
              >
                {icon}
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {text}
                </motion.span>
              </NavLink>
            ))}
          </>
        )}
      </motion.div>

      {/* Floating Collapse Button */}
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        className={` md:flex fixed left-1 top-[80px] btn btn-sm btn-circle bg-base-200/90 shadow-md z-50`}
        animate={{ left: collapsed ? 10 : "92%" }}
      >
        {collapsed ?
          <FaBars /> :
          <MdOutlineClose />}
      </motion.button>
      {/* Main Content */}
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