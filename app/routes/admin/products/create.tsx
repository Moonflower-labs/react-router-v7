import { Form } from "react-router";
import InfoAlert from "~/components/shared/info";

export default function CreateProduct() {
  return (
    <div className="md:w-2/3 mx-auto">
      <h2 className="text-2xl text-primary my-4 text-center">Crea un Producto</h2>
      <InfoAlert className="alert-warning w-fit">
        <span>Este producto no será creado en stripe!</span>
      </InfoAlert>
      <Form method="POST"></Form>
    </div>
  );
}
