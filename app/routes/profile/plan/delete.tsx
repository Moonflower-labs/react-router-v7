import { ActionFunctionArgs, Form } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const method = request.method;
  if (method === "DELETE") {
    try {
    } catch (error) {
      console.error(error);
    }
  }
  return null;
}

export default function Component() {
  return (
    <div className="text-center">
      <h2 className="text-2xl text-primary my-3">Cancela tu suscripción</h2>
      <p className="mb-4 max-w-xl mx-auto px-3">
        Al cancelar tu suscripción ya no se volverá a renovar, y perderás acceso a las páginas y contenido desde esa misma fecha.
      </p>
      <Form method="delete" className="py-2 mx-auto">
        <button className="btn btn-outline btn-error btn-sm">Cancelar ahora</button>
      </Form>
    </div>
  );
}
