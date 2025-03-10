import { getUserProfile, updateUserAvatar } from "~/models/profile.server";
import type { Route } from "./+types/dashboard";
import { Link } from "react-router";
import { Suspense } from "react";
import { getUserOrderCount } from "~/models/order.server";
import { getUserSubscription } from "~/models/subscription.server";
import OrderCard from "~/components/dashboard/OrderCard";
import { GoArrowRight } from "react-icons/go";
import FavoritesCard, { FavoritesSkeleton } from "~/components/dashboard/FavoritesCard";
import QuestionsCard, { QuestionsSkeleton } from "~/components/dashboard/QuestionsCard";
import { AvatarCard, AvatarSkeleton } from "~/components/dashboard/AvatarCard";
import { SubscriptionCard, SubscriptionSkeleton } from "~/components/dashboard/SubscriptionCard";
import { fetchAvatars } from "~/integrations/cloudinary/utils.server";
import { getSubscriptionData, type SubscriptionPlan } from "~/integrations/stripe";
import { getUserContext } from "~/utils/contexts.server";


export async function loader({ context }: Route.LoaderArgs) {
  const user = getUserContext(context)
  const profile = getUserProfile(String(user?.id))
  const subscription = getUserSubscription(String(user?.id))
  const orderCount = getUserOrderCount(String(user?.id))
  const avatars = fetchAvatars()
  const planName = user?.subscription?.plan?.name
  const planData = planName ? getSubscriptionData(planName as SubscriptionPlan["name"]) : null

  return { profile, orderCount, avatars, userAvatar: user?.profile?.avatar, planData, subscription };

}

export async function action({ request, context }: Route.ActionArgs) {
  const user = getUserContext(context)
  const formData = await request.formData();
  const avatar = formData.get("avatar");
  await updateUserAvatar(String(user?.id), String(avatar));
  return { success: true, message: "Avatar actualizado" };
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const { orderCount, profile, subscription, avatars, userAvatar, planData } = loaderData

  return (
    <div className="px-4 mb-6">
      <h1 className="text-2xl text-center text-primary font-bold my-3">Perfil</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <Suspense fallback={<AvatarSkeleton />}>
          <AvatarCard userAvatar={userAvatar} avatars={avatars} />
        </Suspense>
        <Suspense fallback={<SubscriptionSkeleton />}>
          <SubscriptionCard promise={subscription} planData={planData} />
        </Suspense>
        <Suspense fallback={<FavoritesSkeleton />}>
          <FavoritesCard promise={profile} />
        </Suspense>
        <Suspense fallback={<QuestionsSkeleton />}>
          <QuestionsCard promise={profile} />
        </Suspense>
        <Suspense fallback={<QuestionsSkeleton />}>
          <OrderCard count={orderCount} />
        </Suspense>

        <div className="rounded-lg border shadow-lg p-4">
          <h2 className="text-xl text-center text-primary font-semibold py-3">Mis Facturas</h2>
          <div className="flex justify-center">
            <span>Listado de facturas de tu Suscripción, para ver online o descargar PDF.</span>
            <Link to={"invoices"} viewTransition><GoArrowRight size={24} /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}