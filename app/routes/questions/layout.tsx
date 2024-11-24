import { NavLink, Outlet } from "react-router";
import { FaQuestion } from "react-icons/fa";
import personalityImg from "~/icons/plan-personality.svg"
import soulImg from "~/icons/plan-soul.svg"
import spiritImg from "~/icons/plan-spirit.svg"
import type { Route } from "./+types/layout";
import { requireUserId } from "~/utils/session.server";

export async function loader({ request }: Route.LoaderArgs) {
  return requireUserId(request)
}

export default function Layout() {
  return (
    <>
      <div
        role="navigation"
        className="bg-base-100 flex gap-1 py-1 justify-evenly md:justify-center sticky top-[72px] z-50 md:w-fit rounded-lg md:bg-transparent mx-auto">
        <div className="grid grid-cols-3 gap-1 w-full max-w-3xl bg-base-100 rounded-md">
          <NavLink
            to={"/questions"}
            role="tab"
            className={({ isActive }) =>
              `flex flex-col justify-center items-center md:flex-row gap-2 border rounded-md p-2 shadow ${isActive && "bg-primary text-primary-content"}`
            }
            viewTransition
            end>
            <div className="avatar">
              <div className="w-8 rounded">
                <img src={personalityImg} />
              </div>
            </div>
            <span>Personalidad</span>
            <FaQuestion size={22} />
          </NavLink>
          <NavLink
            to={"/questions/tarot"}
            role="tab"
            className={({ isActive }) =>
              `flex flex-col justify-center items-center md:flex-row gap-2 border rounded-md p-2 shadow ${isActive && "bg-primary text-primary-content"}`
            }
            viewTransition>
            <div className="avatar">
              <div className="w-8 rounded">
                <img src={soulImg} />
              </div>
            </div>
            <span>Tarot</span>
            <FaQuestion size={22} />
          </NavLink>
          <NavLink
            to={"/questions/live"}
            role="tab"
            className={({ isActive }) =>
              `flex flex-col justify-center items-center md:flex-row gap-2 border rounded-md p-2 shadow ${isActive && "bg-primary text-primary-content"}`
            }
            viewTransition>
            <div className="avatar">
              <div className="w-8 rounded">
                <img src={spiritImg} />
              </div>
            </div>
            <span>Directo</span>
            <FaQuestion size={22} />
          </NavLink>
        </div>
      </div>
      <div className="px-3">
        <Outlet />
      </div>
    </>
  );
}
