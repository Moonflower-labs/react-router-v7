import { href, NavLink, Outlet, redirect } from "react-router";
import personalityImg from "~/icons/plan-personality.svg"
import soulImg from "~/icons/plan-soul.svg"
import spiritImg from "~/icons/plan-spirit.svg"
import type { Route } from "./+types/layout";
import { requireUserId } from "~/utils/session.server";
import ScrollToHash from "~/components/shared/ScrollToHash";
import { getUserSubscription } from "~/models/subscription.server";


export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  const subscription = await getUserSubscription(userId)
  if (!subscription) {
    throw redirect(href("/profile"))
  }
  if (subscription.status === "past_due") {
    throw redirect(`${href("/payments/subscribe")}?missed=true&subscriptionId=${subscription.id}7plan=${subscription.plan.name}`)
  }
}

export default function MembersLayout({ }: Route.ComponentProps) {

  return (
    <>
      <div
        key={'members-nav'}
        role="navigation"
        data-testid="members-layout"
        className="flex flex-col gap-1 justify-center sticky top-[72px] z-40 md:w-fit rounded-lg mx-auto pb-5">
        <div className="join mx-auto w-screen px-1">
          {LINKS.map((link: any) =>
            <NavLink
              key={link.to}
              to={link.to}
              role="tab"
              className={({ isActive }) =>
                `btn join-item w-1/3 justify-center items-center border-base-300 shadow-sm ${isActive ? "btn-primary" : ""} transition-all ease-out duration-200`
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
      </div>
      <ScrollToHash />
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