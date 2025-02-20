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

export default function MembersLayout({ }: Route.ComponentProps) {

  return (
    <>
      <div
        key={'members-nav'}
        role="navigation"
        data-testid="members-layout"
        className="flex flex-col gap-1 justify-center sticky top-[72px] z-40 md:w-fit rounded-lg mx-auto pb-5">
        <div className="grid grid-cols-3 gap-1 w-full max-w-3xl px-2">
          {LINKS.map((link: any) =>
            <NavLink
              key={link.to}
              to={link.to}
              role="tab"
              className={({ isActive }) =>
                `flex flex-col justify-center items-center gap-1 border border-base-200 rounded-lg p-2 shadow-sm ${isActive ? "bg-primary text-primary-content" : "bg-base-100"} transition-all ease-out duration-200`
              }
              // preventScrollReset={true}
              viewTransition
            >
              <div className="flex flex-row gap-1 justify-center items-center">
                <div className="avatar">
                  <div className="w-6 rounded">
                    <img src={link.imageSrc} />
                  </div>
                </div>
                <span>{link.name}</span>
              </div>
            </NavLink>
          )}
        </div>
        <ScrollToHash />
      </div>
      <div className="mx-2">
        <Outlet />
      </div>

    </>
  );
}


const LINKS = [
  {
    to: "/members/personality",
    imageSrc: personalityImg,
    name: "Personalidad"
  },
  {
    to: "/members/soul",
    imageSrc: soulImg,
    name: "Alma"
  },
  {
    to: "/members/spirit",
    imageSrc: spiritImg,
    name: "Espíritu"
  },
]