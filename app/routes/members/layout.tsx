import { NavLink, Outlet } from "react-router";
import personalityImg from "~/icons/plan-personality.svg"
import soulImg from "~/icons/plan-soul.svg"
import spiritImg from "~/icons/plan-spirit.svg"
import type { Route } from "./+types/layout";
import { requireUserId } from "~/utils/session.server";
import ScrollToHash from "~/components/shared/ScrollToHash";
import { AnimatePresence, motion } from "motion/react";
import { FaLock, FaLockOpen } from "react-icons/fa6";


export async function loader({ request }: Route.LoaderArgs) {
  return requireUserId(request)
}

export default function MembersLayout({ }: Route.ComponentProps) {

  return (
    <AnimatePresence>
      <div
        role="navigation"
        data-testid="members-layout"
        className="bg-base-100 flex flex-col gap-1 justify-center sticky top-[72px] z-40 md:w-fit rounded-lg bg-transparent mx-auto pb-5">
        <div className="grid grid-cols-3 gap-1 w-full max-w-3xl px-2">
          {LINKS.map((link: any) =>
            <NavLink
              key={link.to}
              to={link.to}
              role="tab"
              className={({ isActive }) =>
                `flex flex-col justify-center items-center gap-1 rounded-lg p-2 pb-1 shadow-md ${isActive ? "bg-primary text-primary-content" : "bg-base-100"} transition-all ease-out duration-200`
              }
            // preventScrollReset={true}
            // viewTransition
            >
              {({ isActive, isPending }) => (
                <>
                  <div className="flex flex-row justify-center items-center">
                    <div className="avatar">
                      <div className="w-6 rounded">
                        <img src={link.imageSrc} />
                      </div>
                    </div>
                    <span>{link.name}</span>
                  </div>
                  {isActive ? <motion.div className="w-full flex flex-end z-50 h-2" layoutId="underline" ><FaLockOpen /></motion.div>
                    : <FaLock />}
                  {/* {isActive ? <motion.div className="block w-full z-50 bg-purple-400 h-2 rounded-md" layoutId="underline" />
                    : <div className="opacity-0 w-full h-2" />} */}
                </>

              )}
            </NavLink>
          )}
        </div>
        <ScrollToHash />
      </div>
      <Outlet />
    </AnimatePresence>
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