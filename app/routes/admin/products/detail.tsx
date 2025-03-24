import { data, Form, href, Link, useNavigation } from "react-router";
import type { Route } from "./+types/detail";
import { createPrice, deletePrice, getProduct, updatePrice } from "~/models/product.server";
import ActionError from "~/components/framer-motion/ActionError";
import { useEffect, useRef, useState } from "react";
import { TbTrash } from "react-icons/tb";
import { CiEdit } from "react-icons/ci";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { Price } from "@prisma/client";

export async function loader({ params }: Route.LoaderArgs) {
  if (!params.id) {
    throw data({ message: "No ID param found" }, { status: 400 });
  }
  const product = await getProduct(params.id);
  return { product };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const { id: productId } = params;
  const amount = Number(formData.get("amount"));
  const info = formData.get("info") as string;
  const active = formData.get("active") === "on";

  switch (request.method) {
    case "POST": {

      let errors: any = {};
      if (!info) {
        errors.info = "Escribe información sobre el precio";
      }

      if (!amount || amount < 0) {
        errors.amount = "Precio debe de ser un número";
      }
      if (Object.keys(errors).length > 0) {
        return { errors };
      }

      try {
        await createPrice({ productId, amount, info, active });
        break;
      } catch (error) {
        console.error(error);
        return { error: "Something went wrong" };
      }
    }
    case "PATCH": {
      const id = formData.get("priceId") as string;
      let errors: any = {};
      if (!info) {
        errors.info = "Escribe información sobre el precio";
      }

      if (!amount || amount < 0) {
        errors.amount = "Precio debe de ser un número";
      }
      if (Object.keys(errors).length > 0) {
        return { errors };
      }

      try {
        await updatePrice(id, { productId, amount, info, active });
        break;
      } catch (error) {
        console.error(error);
        return { error: "Something went wrong" };
      }
    }
    case "DELETE": {
      const priceId = formData.get("priceId");
      if (!priceId) {
        return { error: "No priceId found" };
      }
      try {
        await deletePrice(priceId as string);
      }
      catch (error) {
        console.error(error);
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2003") {
            return { error: "No se puede eliminar un precio existente en algún pedido" };
          }
        }

        return { error: "Ha ocurrido un error" };
      }
    }
  }

  return { success: true };
}

export default function detail({ loaderData, actionData }: Route.ComponentProps) {
  const product = loaderData?.product;
  const { errors } = actionData || {};
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null); // Ref for dialog
  const editDialogRef = useRef<HTMLDialogElement>(null); // Ref for dialog
  const navigation = useNavigation();
  const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);



  useEffect(() => {
    if (navigation.state === "idle" && !actionData?.errors && dialogRef.current) {
      dialogRef.current.close(); // Close on redirect completion
    }
    if (navigation.state === "idle" && !actionData?.errors && editDialogRef.current) {
      editDialogRef.current.close(); // Close on redirect completion
    }
  }, [navigation.state, actionData]);

  const handleEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    const priceId = event.currentTarget.dataset.priceid; // Get price ID from data attribute
    const price = product?.prices.find(p => p.id === priceId); // Find matching price
    if (price) {
      setSelectedPrice(price);
      editDialogRef.current?.showModal();
    }
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-primary my-4">{product?.name}</h2>
      <div className="avatar mb-5">
        <div className="w-24 rounded">
          <img src={product?.thumbnail as string} alt={product?.name} className="avatar" />
        </div>
      </div>
      <p className="font-bold">Descripción:</p>
      <p className="mb-4">{product?.description}</p>

      <div>
        {actionData?.error && <ActionError actionData={{ error: actionData.error }} />}
        <p className="font-bold">Precios:</p>
        {product?.prices.length ? product.prices.map(price => (
          <div key={price.id} className="flex justify-between items-center gap-3 mt-2" >
            <div className="flex justify-between w-4/5">
              {price.info} <span> £{price.amount / 100}</span>
            </div>
            <div className="flex gap-3 items-center">
              {price.active ? <div aria-label="success" className="status status-success"></div> : <div aria-label="error" className="status status-error"></div>}
              <button className="btn btn-sm btn-ghost btn-circle shadow" data-priceid={price.id} onClick={handleEdit} >
                <CiEdit size={24} className="text-info" />
              </button>
            </div>


            <Form method="DELETE" onSubmit={(e) => {
              if (!confirm(`Seguro que quieres borrar ${price.info}?`))
                e.preventDefault();
            }}>
              <input type="hidden" name="priceId" value={price.id} />
              <button type="submit" className="btn btn-sm btn-circle btn-ghost shadow" disabled={navigation.state === "submitting"}>
                <TbTrash size={24} className="text-error" />
              </button>
            </Form>
          </div>
        )) : <div>No hay precios</div>}


        {/* Edit Price Dialog */}
        <dialog id="edit_price_modal" className="modal" ref={editDialogRef}>
          <div className="modal-box">
            {selectedPrice &&
              <Form method="PATCH" className="card max-w-xs items-center mx-auto pb-4 flex flex-col">
                <input type="hidden" name="priceId" value={selectedPrice.id} />
                <label className="input input-lg mb-3">
                  <span className="label">Info</span>
                  <input type="text" name={"info"} defaultValue={selectedPrice?.info} placeholder="Color Rosa, Talla xl..." />
                </label>
                {errors?.displayName && <ActionError actionData={{ error: errors.displayName }} />}
                <fieldset className="fieldset">
                  <label className="input input-lg mb-3">
                    <span className="label">Precio</span>
                    <input type="number" min={0} name={"amount"} defaultValue={selectedPrice?.amount} />
                  </label>
                  {errors?.amount && <ActionError actionData={{ error: errors.amount }} />}
                  <p className="fieldset-label">⚠️ En céntimos, £1 = 100</p>
                </fieldset>
                <fieldset className="fieldset">
                  <label className="fieldset-label">
                    <input type="checkbox" defaultChecked name="active" className="toggle toggle-primary" />
                    Active
                  </label>
                </fieldset>
                <div className="flex justify-end gap-3 mt-4">
                  <button type="reset" onClick={() => editDialogRef.current?.close()} className="btn btn-primary btn-outline btn-sm">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={navigation.state !== "idle"}>
                    {navigation.state === "submitting" ? "Editando" : "Editar"}
                  </button>
                </div>
              </Form>}
          </div>
        </dialog>

        <button className="btn btn-sm btn-primary my-2" onClick={() => dialogRef.current?.showModal()}>Añadir precio</button>
        <Link to={href("/admin/products/:id/edit", { id: product?.id as string })} className="btn btn-sm btn-info m-2" >Editar este Producto</Link>

        {/* Add Price Dialog */}
        <dialog id="add_price_modal" className="modal" ref={dialogRef}>
          <div className="modal-box">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            </form>
            <Form ref={formRef} method="post" className="card max-w-xs items-center mx-auto pb-4 flex flex-col">
              <label className="input input-lg mb-3">
                <span className="label">Info</span>
                <input type="text" name={"info"} placeholder="Color Rosa, Talla xl..." />
              </label>
              {errors?.displayName && <ActionError actionData={{ error: errors.displayName }} />}

              <fieldset className="fieldset">
                <label className="input input-lg mb-3">
                  <span className="label">Precio</span>
                  <input type="number" min={0} name={"amount"} />
                </label>
                {errors?.amount && <ActionError actionData={{ error: errors.amount }} />}

                <p className="fieldset-label">⚠️ En céntimos, £1 = 100</p>
              </fieldset>
              <fieldset className="fieldset">
                <label className="fieldset-label">
                  <input type="checkbox" defaultChecked name="active" className="toggle toggle-primary" />
                  Active
                </label>
              </fieldset>
              <div className="flex justify-end gap-3 mt-4">
                <button type="reset" className="btn btn-primary btn-outline btn-sm" onClick={() => dialogRef.current?.close()} >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={navigation.state !== "idle"}>
                  {navigation.state === "submitting" ? "Creando" : "Crear"}
                </button>
              </div>
            </Form>
          </div>
        </dialog>
      </div>
    </div>
  );
}
