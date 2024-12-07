import { Link, NavLink, Outlet, useNavigation } from "react-router";
import personalityImg from "~/icons/plan-personality.svg"
import soulImg from "~/icons/plan-soul.svg"
import spiritImg from "~/icons/plan-spirit.svg"
import type { Route } from "./+types/layout";
import { requireUserId } from "~/utils/session.server";
import GlobalSpinner from "~/components/shared/GlobalSpinner";

export async function loader({ request }: Route.LoaderArgs) {
  return requireUserId(request)
}

export default function Layout() {

  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <>
      <h2 className="font-semibold text-center py-1 text-xl text-primary/70">Pregúntale a La Flor Blanca</h2>
      <div
        role="navigation"
        className="bg-base-100 flex gap-1 py-1 flex-col justify-center sticky top-[72px] z-50 md:w-fit rounded-lg md:bg-transparent mx-auto">
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
          </NavLink>
        </div>
        <Link
          to={"/personality"}
          className={"btn btn-sm btn-primary shadow mx-auto"}
          viewTransition
        >
          Ir a Respuestas
        </Link>
      </div>
      <div className="px-3">
        {isNavigating && <GlobalSpinner />}
        <Outlet />
      </div>
    </>
  );
}
