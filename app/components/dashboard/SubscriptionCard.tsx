import { use } from "react";
import { BiErrorCircle } from "react-icons/bi";
import { IoOptionsOutline } from "react-icons/io5";
import { Link, href } from "react-router";
import type { UserSubscription } from "~/models/subscription.server";
import { translateSubscriptionStatus } from "~/utils/translations";

export function SubscriptionCard({ promise, planData }: { promise: Promise<UserSubscription>, planData: any }) {
    const subscription = use(promise)

    return (
        <div className="rounded-lg border shadow-lg p-4 text-center flex flex-col">
            <h2 className="text-xl text-primary font-semibold py-3">Subscripción</h2>
            {subscription ? (
                <>
                    <div className="flex-grow">
                        <div className="flex-grow flex flex-col items-center">
                            <div className="avatar">
                                <div className="w-20 rounded-lg mb-3">
                                    <img src={planData.img} />
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
    )
}


export function SubscriptionSkeleton() {
    return (
        <div className="rounded-lg border shadow-lg p-4 text-center flex flex-col">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col justify-center items-center gap-4">
                    <div className="skeleton h-5 w-24"></div>
                    <div className="skeleton h-20 w-20 shrink-0 rounded-lg"></div>
                    <div className="flex flex-col items-center gap-4">
                        <div className="skeleton h-5 w-20"></div>
                        <div className="skeleton h-4 w-40"></div>
                    </div>
                </div>
                <div className="skeleton h-6 w-full"></div>
            </div>
        </div>
    )
}