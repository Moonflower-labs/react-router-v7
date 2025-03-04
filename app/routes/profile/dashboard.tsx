import { getUserProfile, updateUserAvatar } from "~/models/profile.server";
import type { Route } from "./+types/dashboard";
import { requireUserId } from "~/utils/session.server";
import { href, Link, useSubmit, type SubmitFunction } from "react-router";
import { translateSubscriptionStatus } from "~/utils/translations";
import { IoOptionsOutline } from "react-icons/io5";
import { useState, type Dispatch, type SetStateAction } from "react";
import { getSubscriptionData, type SubscriptionPlan } from "~/integrations/stripe";
import { GoArrowRight } from "react-icons/go";
import { getUserOrderCount } from "~/models/order.server";
import { BiErrorCircle } from "react-icons/bi";
import cloudinary from "~/integrations/cloudinary/service.server";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request);
  try {
    const [userProfile, orderCount] = await Promise.all([
      getUserProfile(String(userId)), getUserOrderCount(String(userId))
    ])
    const avatars = await cloudinary.api.resources({
      type: "upload",
      prefix: "avatars",
    })

    const planName = userProfile?.subscription?.plan?.name
    return { userProfile, orderCount, avatars: avatars.resources, planData: planName ? getSubscriptionData(planName as SubscriptionPlan["name"]) : null };
  } catch (error) {
    console.error(error);
    return {};
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
  const { orderCount, userProfile, avatars } = loaderData
  const profile = userProfile?.profile;
  const subscription = userProfile?.subscription;
  const favorites = userProfile?.favorites;
  const favPosts = favorites?.filter((favorite) => favorite.postId !== null);
  const favVids = favorites?.filter((favorite) => favorite.videoId !== null);
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar || "/avatars/girl.jpg");
  const submit = useSubmit();
  console.log(avatars)


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
                  <img src={selectedAvatar} className="object-top" />
                </div>
              </div>
            </div>
            <AvatarSelector
              avatars={avatars}
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={setSelectedAvatar}
              submit={submit} />

            {/* <div className="w-full">
              <label htmlFor="avatar" className="label">Select Avatar</label>
              <div className="avatar-selector grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                {avatars.length > 0 ? (
                  avatars.map((avatar: any) => {
                    const thumbnailUrl = avatar.secure_url.replace(
                      '/upload/',
                      '/upload/w_100,h_100,c_fill,g_auto,q_auto/'
                    );
                    return (
                      <div
                        key={avatar.asset_id}
                        className={`avatar-option cursor-pointer rounded-lg overflow-hidden border-2 ${avatar.secure_url === avatar ? 'border-primary' : 'border-transparent'
                          } hover:border-primary transition-all`}
                        onClick={() => {
                          setSelectedAvatar(avatar.secure_url);
                          submit(
                            { avatar: avatar.secure_url },
                            { method: 'POST', navigate: false }
                          );
                        }}
                      >
                        <div key={avatar.asset_id} className="avatar mx-auto mb-4">
                          <div className={`w-24 rounded-full ${avatar.secure_url === selectedAvatar ? "border-4 border-primary" : ""}`}>
                            <img src={thumbnailUrl} className="object-top" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="col-span-full text-center">No avatars disponibles</p>
                )}
              </div>
            </div> */}

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
                  {subscription.status === "past_due" && (
                    <div role="alert" className="alert alert-error my-2">
                      <BiErrorCircle size={24} />
                      <div className="text-center">
                        <p className="mb-1.5">Renovacion Incompleta! No hemos podido recolectar el pago de su suscripción.</p>
                        <Link
                          to={`${href("/payments/subscribe")}?missed=true&subscriptionId=${subscription.id}&plan=${subscription.plan.name}`}
                          className="text-center link link-primary"
                        >Resolver informacion de pago invalida</Link>
                      </div>
                    </div>
                  )}
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
                {orderCount && orderCount > 0 ?
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


import { motion, AnimatePresence } from 'framer-motion';

interface AvatarSelectorPops {
  avatars: any[],
  setSelectedAvatar: Dispatch<SetStateAction<string>>,
  selectedAvatar: string,
  submit: SubmitFunction,
}

function AvatarSelector({ avatars, setSelectedAvatar, submit, selectedAvatar }: AvatarSelectorPops) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        className="btn btn-sm btn-outline w-full mb-2 flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{isOpen ? 'Esconder Avatars' : 'Ver Avatars'}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="avatar-selector grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-base-100 rounded-lg"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {avatars.length > 0 ? (
              avatars.map((avatar) => {
                const thumbnailUrl = avatar.secure_url.replace(
                  '/upload/',
                  '/upload/w_100,h_100,c_fill,g_auto,q_auto/'
                );
                return (
                  <motion.div
                    key={avatar.asset_id}
                    className={`cursor-pointer overflow-hidden transition-all`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedAvatar(avatar.secure_url);
                      submit(
                        { avatar: avatar.secure_url },
                        { method: 'POST', navigate: false }
                      );
                    }}
                  >
                    <div className="avatar mx-auto mb-4">
                      <div
                        className={`w-24 rounded-full ${avatar.secure_url === selectedAvatar ? 'border-4 border-primary' : ''
                          }`}
                      >
                        <img src={thumbnailUrl} className="object-top" alt={avatar.public_id.split('/').pop()} />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p className="col-span-full text-center">No avatars disponibles</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}