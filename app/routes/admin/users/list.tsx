import { prisma } from "~/db.server";
import type { Route } from "./+types/list";
import { Form } from "react-router";
import { ImBin } from "react-icons/im";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { getUserSubscription } from "~/models/subscription.server";
import { requireUserId } from "~/utils/session.server";

export async function loader({ }: Route.LoaderArgs) {
  const users = await prisma.user.findMany({ include: { subscription: { include: { plan: true } } } });
  return users;
}
export async function action({ request }: Route.ActionArgs) {
  const [formData, currentUserId] = await Promise.all([
    request.formData(), requireUserId(request)
  ]);
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
  const users = loaderData;

  useEffect(() => {
    if (actionData?.success && actionData?.username) {
      toast.success(`Usuario ${actionData?.username} ha sido eliminado`);
    }
    if (!actionData?.success && actionData?.message) {
      toast.error(`${actionData?.message}`);
    }
  }, [actionData]);

  return (
    <div>
      <h2 className="text-2xl text-primary text-center font-bold my-4">Usuarios</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {users &&
          users.map(user => (
            <div key={user.id} className="p-8 mb-6 border rounded-lg shadow">
              <div className="mb-4">
                <p>Nombre de usuario: {user.username}</p>
                <p>Stripe customerId: {user.customerId}</p>
                <p>Email: {user.email}</p>
                <p>ID: {user.id}</p>
              </div>
              <Form method="delete">
                <button type="submit" name="userId" value={user.id} className=" btn btn-sm btn-outline btn-error">
                  <ImBin size={24} />
                </button>
              </Form>
            </div>
          ))}
      </div>
    </div>
  );
}
