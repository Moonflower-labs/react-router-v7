import { NavLink, Outlet } from "react-router";
import personalityImg from "~/icons/plan-personality.svg"
import soulImg from "~/icons/plan-soul.svg"
import spiritImg from "~/icons/plan-spirit.svg"
import type { Route } from "./+types/layout";
import { requireUserId } from "~/utils/session.server";
import ScrollToHash from "~/components/shared/ScrollToHash";


export async function loader({ request }: Route.LoaderArgs) {
  return requireUserId(request)
}

export default function MembersLayout() {

  return (
    <>
      <div
        role="navigation"
        data-testid="members-layout"
        className="bg-base-100 flex flex-col gap-1 py-1 justify-center sticky top-[72px] z-50 md:w-fit rounded-lg md:bg-transparent mx-auto">
        <div className="grid grid-cols-3 gap-1 w-full max-w-3xl bg-base-100 rounded-md">
          <NavLink
            to={"/members/personality"}
            role="tab"
            className={({ isActive }) =>
              `flex flex-row justify-center items-center gap-1 border rounded-md p-2 shadow ${isActive && "bg-primary text-primary-content"}`
            }
            // preventScrollReset={true}
            viewTransition
          >
            <div className="avatar">
              <div className="w-8 rounded">
                <img src={personalityImg} />
              </div>
            </div>
            <span>Personalidad</span>
          </NavLink>
          <NavLink
            to={"/members/soul"}
            role="tab"
            className={({ isActive }) =>
              `flex flex-row justify-center items-center gap-1 border rounded-md p-2 shadow ${isActive && "bg-primary text-primary-content"}`
            }
            // preventScrollReset={true}
            viewTransition
          >
            <div className="avatar">
              <div className="w-8 rounded">
                <img src={soulImg} />
              </div>
            </div>
            <span>Alma</span>
          </NavLink>
          <NavLink
            to={"/members/spirit"}
            role="tab"
            className={({ isActive }) =>
              `flex flex-row justify-center items-center gap-1 border rounded-md p-2 shadow ${isActive && "bg-primary text-primary-content"}`
            }
            // preventScrollReset={true}
            viewTransition
          >
            <div className=" avatar">
              <div className="w-8 rounded">
                <img src={spiritImg} />
              </div>
            </div>
            <span>Espíritu</span>
          </NavLink>
        </div>
        <ScrollToHash />
      </div>
      <Outlet />
    </>
  );
}
