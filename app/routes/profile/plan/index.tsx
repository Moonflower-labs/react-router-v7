import { Outlet } from "react-router";
import type { Route } from "./+types/index";
import { requireUserId } from "~/utils/session.server";
import { getUserSubscription } from "~/models/subscription.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  return getUserSubscription(userId);
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const subscription = loaderData;
  // console.log(subscription)

  return (
    <div className="text-center">
      <h2 className="text-2xl text-primary font-bold py-4">Administra tu Plan</h2>

      {subscription ? (
        <div className="overflow-x-auto mt-8 w-full">
          {/* <Subscription data={data.data} /> */}
          <Outlet context={{ subscription }} />
        </div>
      ) : (
        <div className="text-xl text-center text-semibold pt-8">No tienes ninguna suscripción.</div>
      )}
    </div>
  );
}
