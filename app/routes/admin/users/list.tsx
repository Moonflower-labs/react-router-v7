import { prisma } from "~/db.server";
import type { Route } from "./+types/list";
import { Form } from "react-router";
import { ImBin } from "react-icons/im";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { getUserSubscription } from "~/models/subscription.server";
import { formatDate } from "~/utils/format";
import { getSessionContext } from "~/middleware/sessionMiddleware";

export async function loader({ }: Route.LoaderArgs) {
  const users = await prisma.user.findMany({ include: { subscription: { include: { plan: true } }, profile: { select: { avatar: true } } } });
  return { users };
}
export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData()
  const currentUserId = getSessionContext(context).get("userId")
  const userId = formData.get("userId");
  if (currentUserId && currentUserId === userId) {
    return { success: false, message: "No te puedes borrar a ti mismo" };
  }
  if (!userId || typeof userId !== "string") {
    return { success: false, message: "No puedes borrar este usuario" };
  }
  // Check if the user has an Active Subscription
  const userSubscription = await getUserSubscription(userId);
  if (userSubscription?.status === "active") {
    return { success: false, message: "No puedes borrar un usuario con subscripción activa" };
  }
  const deletedUser = await prisma.user.delete({ where: { id: userId } });
  return { success: true, username: deletedUser.username };
}

export default function UserList({ loaderData, actionData }: Route.ComponentProps) {
  const { users } = loaderData;

  useEffect(() => {
    if (actionData?.success && actionData?.username) {
      toast.success(`Usuario ${actionData?.username} ha sido eliminado`);
    }
    if (!actionData?.success && actionData?.message) {
      toast.error(`${actionData?.message}`);
    }
  }, [actionData]);

  return (
    <div className="mb-3">
      <h2 className="text-2xl text-primary text-center font-bold my-4">Usuarios</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users &&
          users.map(user => (
            <div key={user.id} className="card bg-base-100 shadow-sm">
              <div className="card-body relative">
                <p className="absolute top-2.5 right-2.5 badge badge-xl">{user.subscription?.plan.name ?? "No member"}</p>
                <div className="avatar">
                  <div className="w-18 rounded-full">
                    <img src={user.profile?.avatar || "/logo.svg"} />
                  </div>
                </div>
                <h2 className="card-title">{user.username}</h2>
                <div className="mb-4">
                  <p>Creado: {formatDate(user.createdAt)}</p>
                  <p>Email: {user.email}</p>
                  <p>ID: {user.id}</p>
                  <p>Stripe customerId: {user.customerId}</p>
                </div>
                <div className="justify-end card-actions">
                  <Form method="delete">
                    <button type="submit" name="userId" value={user.id} className="btn btn- btn-circle btn-ghost shadow">
                      <ImBin className="text-error" size={24} />
                    </button>
                  </Form>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
