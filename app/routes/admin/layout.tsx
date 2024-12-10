import { AiFillProduct } from "react-icons/ai";
import { BiCategoryAlt, BiSolidVideos } from "react-icons/bi";
import { FaHome, FaQuestion, FaRegImages } from "react-icons/fa";
import { GiQuillInk } from "react-icons/gi";
import { HiMiniShoppingBag } from "react-icons/hi2";
import { PiUsersThreeFill } from "react-icons/pi";
import { RiWebhookFill } from "react-icons/ri";
import { NavLink, Outlet } from "react-router";
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
        className="bg-base-200 flex flex-wrap md:flex-nowrap flex-row md:flex-col gap-1 pt-1 justify-center md:justify-start w-full overflow-x-auto md:w-52 sticky top-[72px] md:fixed md:left-0 z-50 h-auto md:h-[calc(100vh-72px)] rounded-lg">

        <NavLink
          to={"admin"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-start items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          end
          viewTransition>
          <FaHome size={24} />
        </NavLink>
        <NavLink
          to={"/admin/post"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-start items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <GiQuillInk size={20} />
          <span className="text-xs md:text-lg">Posts</span>
        </NavLink>
        <NavLink
          to={"/admin/videos"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-start items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <BiSolidVideos size={20} />
          <span className="text-xs md:text-lg">Videos</span>
        </NavLink>
        <NavLink
          to={"/admin/categories"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-start items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <BiCategoryAlt size={20} />
          <span className="text-xs md:text-lg">Categorías</span>
        </NavLink>
        <NavLink
          to={"admin/questions"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-start items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <FaQuestion size={20} />
          <span className="text-xs md:text-lg">Preguntas</span>
        </NavLink>
        <NavLink
          to={"admin/orders"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-start items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <HiMiniShoppingBag size={20} />
          <span className="text-xs md:text-lg">Pedidos</span>
        </NavLink>
        <NavLink
          to={"admin/products"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-start items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <AiFillProduct size={20} />
          <span className="text-xs md:text-lg">Productos</span>
        </NavLink>
        <NavLink
          to={"admin/gallery"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-start items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <FaRegImages size={20} />
          <span className="text-xs md:text-lg">Imágenes</span>
        </NavLink>
        <NavLink
          to={"admin/users"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-start items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <PiUsersThreeFill size={20} />
          <span className="text-xs md:text-lg">Usuarios</span>
        </NavLink>
        <NavLink
          to={"admin/webhooks"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-start items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <RiWebhookFill size={20} />
          <span className="text-xs md:text-lg">Webhooks</span>
        </NavLink>
        <NavLink
          to={"admin/emails"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-start items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <RiWebhookFill size={20} />
          <span className="text-xs md:text-lg">Emails</span>
        </NavLink>
      </div>
      <div className="min-h-screen px-3 w-full">
        <Outlet />
      </div>
    </div>
  );
}
