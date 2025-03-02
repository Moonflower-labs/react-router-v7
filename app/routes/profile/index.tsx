import { getUserProfile, updateUserAvatar } from "~/models/profile.server";
import type { Route } from "./+types/index";
import { requireUserId } from "~/utils/session.server";
import { Link, useSubmit } from "react-router";
import { translateSubscriptionStatus } from "~/utils/translations";
import { IoOptionsOutline } from "react-icons/io5";
import { useState } from "react";
import { getSubscriptionData } from "~/integrations/stripe";
import { GoArrowRight } from "react-icons/go";
import { getUserOrderCount } from "~/models/order.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  try {
    const [userProfile, orderCount] = await Promise.all([
      getUserProfile(String(userId)), getUserOrderCount(String(userId))
    ])

    const planName = userProfile?.subscription?.plan?.name
    return { userProfile, orderCount, planData: planName ? getSubscriptionData(planName) : null };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const avatar = formData.get("avatar");
  await updateUserAvatar(userId, String(avatar));
  return { success: true, message: "Avatar actualizado" };
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const profile = loaderData?.userProfile?.profile;
  const subscription = loaderData?.userProfile?.subscription;
  const favorites = loaderData?.userProfile?.favorites;
  const orderCount = loaderData?.orderCount
  const favPosts = favorites?.filter((favorite) => favorite.postId !== null);
  const favVids = favorites?.filter((favorite) => favorite.videoId !== null);
  const [avatar, setAvatar] = useState(profile?.avatar || "/avatars/girl.jpg");
  const submit = useSubmit();

  return (
    <div className="px-4 mb-6">
      <h1 className="text-2xl text-center text-primary font-bold my-3">Perfil</h1>
      {profile ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-lg border shadow-lg p-4 text-center flex flex-col">
            <h2 className="text-xl text-center text-primary font-semibold py-3">Avatar</h2>
            <div className="flex-grow flex flex-col items-center">
              <div className="avatar mx-auto mb-4">
                <div className="w-24 rounded-full">
                  <img src={avatar} className="object-top" />
                </div>
              </div>
            </div>
            <select
              name="avatar"
              id="avatar"
              className="select select-sm w-full"
              onChange={e => {
                setAvatar(e.currentTarget.value), submit({ avatar: e.currentTarget.value }, { method: "POST", navigate: false });
              }}
              defaultValue={avatar}>
              <option value="/avatars/teenage-girl.jpg">Tenage Girl</option>
              <option value="/avatars/girl.jpg">Girl</option>
              <option value="/avatars/dark-valentine.jpg">Dark Valentine</option>
              <option value="/avatars/wizard.jpg">Wizard</option>
              <option value="/avatars/crystal.jpg">Crystal</option>
              <option value="/avatars/geisha.jpg">Geisha</option>
              <option value="/avatars/fox.jpg">Fox</option>
            </select>
          </div>

          <div className="rounded-lg border shadow-lg p-4 text-center flex flex-col">
            <h2 className="text-xl text-primary font-semibold py-3">Subscripción</h2>
            {subscription ? (
              <>
                <div className="flex-grow">
                  <div className="flex-grow flex flex-col items-center">
                    <div className="avatar">
                      <div className="w-20 rounded-lg mb-3">
                        <img src={loaderData?.planData?.img} />
                      </div>
                    </div>
                  </div>
                  <span className={`badge mb-4 ${subscription?.status === "active" ? "badge-success" : "badge-warning"}`}>{translateSubscriptionStatus(subscription?.status)}</span>
                  <div>
                    Plan <span>{subscription?.plan?.name}</span>
                  </div>
                </div>
                <Link to={"subscription"} className="text-primary flex justify-end badge-s" viewTransition>
                  <IoOptionsOutline size={24} />
                </Link>
              </>
            ) : (
              <>
                <div className="mb-4">Todavía no te has suscrito a nigún plan 🙁</div>
                <Link to={"/plans"} className="btn btn-sm btn-primary" viewTransition>
                  Planes de suscripción
                </Link>
              </>
            )}
          </div>

          <div className="rounded-lg border shadow-lg p-4">
            <h2 className="text-xl text-center text-primary font-semibold py-3">
              <Link to={"favorites"} className="link link-primary" viewTransition>
                Mis favoritos
              </Link>
            </h2>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span>Post favoritos </span>
                <span className="badge badge-primary badge-outline">{favPosts?.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Videos favoritos </span>
                <span className="badge badge-primary badge-outline">{favVids?.length}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border shadow-lg p-4">
            <h2 className="text-xl text-center text-primary font-semibold py-3">Preguntas Realizadas</h2>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span>Personalidad</span> <span className="badge badge-primary badge-outline">{profile?.basicQuestionCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Live</span> <span className="badge badge-primary badge-outline">{profile?.liveQuestionCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Tarot</span> <span className="badge badge-primary badge-outline">{profile?.tarotQuestionCount}</span>
              </div>
              <Link to={"questions"} className="text-primary flex justify-end" viewTransition>
                <GoArrowRight size={24} />
              </Link>
            </div>
          </div>

          <div className="rounded-lg border shadow-lg p-4">
            <div className="flex flex-col justify-evenly gap-2 h-full">
              <h2 className="text-xl text-center text-primary font-semibold py-3">Mis Pedidos</h2>
              <div className="flex justify-between">
                {orderCount && orderCount > 1 ?
                  <>
                    Pedidos realizados
                    <span className="badge badge-primary badge-outline">{orderCount}</span>
                  </>
                  : <span>Todavía no has hecho ningún pedido.</span>
                }
              </div>
              <div className="flex justify-between">
                <span>Aquí podrás ver tus pedidos</span>
                <Link to={"orders"} viewTransition><GoArrowRight size={24} /></Link>
              </div>
            </div>
          </div>
          <div className="rounded-lg border shadow-lg p-4">
            <h2 className="text-xl text-center text-primary font-semibold py-3">Mis Facturas</h2>
            <div className="flex justify-center">
              <span>Listado de facturas de tu Suscripción, para ver online o descargar PDF.</span>
              <Link to={"invoices"} viewTransition><GoArrowRight size={24} /></Link>
            </div>
          </div>

        </div>
      ) : (
        <div>No hemos encontrado tu perfil</div>
      )}
    </div>
  );
}
