import { Link, NavLink, Outlet, useLocation, useMatches } from "react-router";
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
  const matches = useMatches();
  const { hash, pathname } = useLocation();

  return (
    <>
      <div
        role="navigation"
        data-testid="members-layout"
        className="bg-base-100 flex flex-col gap-1 py-1 justify-center sticky top-[72px] z-50 md:w-fit rounded-lg md:bg-transparent mx-auto">
        <div className="grid grid-cols-3 gap-1 w-full max-w-3xl bg-base-100 rounded-md">
          <NavLink
            to={"/personality"}
            role="tab"
            className={({ isActive }) =>
              `flex flex-col justify-center items-center md:flex-row gap-2 border rounded-md p-2 shadow ${isActive && "bg-primary text-primary-content"}`
            }
            // preventScrollReset={true}
            viewTransition
          >
            <div className="hidden md:block avatar">
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
            // preventScrollReset={true}
            viewTransition
          >
            <div className="hidden md:block avatar">
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
            // preventScrollReset={true}
            viewTransition
          >
            <div className="hidden md:block avatar">
              <div className="w-8 rounded">
                <img src={spiritImg} />
              </div>
            </div>
            <span>Espíritu</span>
          </NavLink>
        </div>
        <ScrollToHash />
        {matches
          .filter(
            (match: any) =>
              match.handle && match.handle.links
          )
          .map((match: any, index) => (
            <div key={index} className="md:bg-base-100 rounded flex gap-2 justify-center items-center">
              {match.handle.links.map((link: any) =>
                <Link key={link.to} to={link.to}
                  className={`hover:scale-110 transition-all ease-in-out duration-300 ${link.to === pathname + hash && "badge badge-primary"}`}
                  viewTransition
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}
      </div>
      <Outlet />
    </>
  );
}
