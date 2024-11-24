import { NavLink, Outlet } from "react-router";
import personalityImg from "~/icons/plan-personality.svg"
import soulImg from "~/icons/plan-soul.svg"
import spiritImg from "~/icons/plan-spirit.svg"

export default function MembersLayout() {
  return (
    <>
      <div
        role="navigation"
        data-testid="members-layout"
        className="bg-base-100 flex gap-1 py-1 justify-evenly md:justify-center sticky top-[72px] z-50 md:w-fit rounded-lg md:bg-transparent mx-auto">
        <div className="grid grid-cols-3 gap-1 w-full max-w-3xl bg-base-100 rounded-md">
          <NavLink
            to={"/personality"}
            role="tab"
            className={({ isActive }) =>
              `flex flex-col justify-center items-center md:flex-row gap-2 border rounded-md p-2 shadow ${isActive && "bg-primary text-primary-content"}`
            }
            preventScrollReset={true}
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
            to={"/soul"}
            role="tab"
            className={({ isActive }) =>
              `flex flex-col justify-center items-center md:flex-row gap-2 border rounded-md p-2 shadow ${isActive && "bg-primary text-primary-content"}`
            }
            preventScrollReset={true}
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
            to={"/spirit"}
            role="tab"
            className={({ isActive }) =>
              `flex flex-col justify-center items-center md:flex-row gap-2 border rounded-md p-2 shadow ${isActive && "bg-primary text-primary-content"}`
            }
            preventScrollReset={true}
            viewTransition
          >
            <div className="avatar">
              <div className="w-8 rounded">
                <img src={spiritImg} />
              </div>
            </div>
            <span>Espíritu</span>
          </NavLink>
        </div>
      </div>
      <Outlet />
    </>
  );
}
