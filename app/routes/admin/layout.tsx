import { AiFillProduct } from "react-icons/ai";
import { BiCategoryAlt, BiSolidVideos } from "react-icons/bi";
import { FaQuestion } from "react-icons/fa";
import { GiQuillInk } from "react-icons/gi";
import { HiMiniShoppingBag } from "react-icons/hi2";
import { PiUsersThreeFill } from "react-icons/pi";
import { NavLink, Outlet } from "react-router";
import tarotIcon from "~/icons/tarot.svg"

export default function AdminLayout() {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="hidden md:block w-64 shrink-0 h-screen" />
      <div
        role="tablist"
        className="bg-base-100 flex flex-row md:flex-col flex-wrap gap-1 pt-1 justify-evenly md:justify-start w-full md:w-64 sticky top-[72px] md:fixed md:left-0 z-50 rounded-lg">
        <NavLink
          to={"/admin/post"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-center items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <GiQuillInk size={20} />
          <span className="text-xs md:text-lg">Posts</span>
        </NavLink>
        <NavLink
          to={"/admin/videos"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-center items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <BiSolidVideos size={20} />
          <span className="text-xs md:text-lg">Videos</span>
        </NavLink>
        <NavLink
          to={"admin"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-center items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <div className="avatar">
            <div className="w-6 rounded">
              <img src={tarotIcon} />
            </div>
          </div>
          <span className="text-xs md:text-lg">Tarot</span>
        </NavLink>
        <NavLink
          to={"/admin/categories"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-center items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <BiCategoryAlt size={20} />
          <span className="text-xs md:text-lg">Categorías</span>
        </NavLink>
        <NavLink
          to={"admin/questions"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-center items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <FaQuestion size={20} />
          <span className="text-xs md:text-lg">Preguntas</span>
        </NavLink>
        <NavLink
          to={"admin/orders"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-center items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <HiMiniShoppingBag size={20} />
          <span className="text-xs md:text-lg">Pedidos</span>
        </NavLink>
        <NavLink
          to={"admin/products"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-center items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <AiFillProduct size={20} />
          <span className="text-xs md:text-lg">Productos</span>
        </NavLink>
        <NavLink
          to={"admin/users"}
          role="tab"
          className={({ isActive }) =>
            `flex flex-col justify-center items-center md:flex-row gap-2 border rounded-md p-2 ${isActive && "bg-primary text-primary-content"}`
          }
          viewTransition>
          <PiUsersThreeFill size={20} />
          <span className="text-xs md:text-lg">Usuarios</span>
        </NavLink>
      </div>
      <div className="min-h-screen px-3 w-full">
        <Outlet />
      </div>
    </div>
  );
}

export function AdminLayoutGrid() {
  return (
    // Main container with grid layout for md screens
    <div className="md:grid md:grid-cols-[272px_1fr] px-2 md:px-0">
      {/* Sidebar for md screens and up */}
      <div className="hidden md:block bg-primary/50 min-h-screen">
        <nav role="tablist" className="flex flex-col sticky top-20">
          <NavLink to={"/admin/post"} role="tab" className={({ isActive }) => `tab ${isActive && "tab-active"}`} preventScrollReset={true} viewTransition>
            Posts
          </NavLink>
          {/* ... other NavLinks ... */}
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex flex-col">
        {/* Mobile tabs */}
        <div role="tablist" className="md:hidden tabs tabs-bordered bg-secondary/50 overflow-x-auto">
          <NavLink to={"/admin/post"} role="tab" className={({ isActive }) => `tab ${isActive && "tab-active"}`} preventScrollReset={true} viewTransition>
            Posts
          </NavLink>
        </div>
        {/* Content area */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
