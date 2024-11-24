import { data } from "react-router";
import type { Route } from "./+types/detail";
import { getProduct } from "~/models/product.server";

export async function loader({ params }: Route.LoaderArgs) {
  if (!params.id) {
    throw data({ message: "No ID param found" }, { status: 400 });
  }
  const product = await getProduct(params.id);
  return { product };
}

export default function detail({ loaderData }: Route.ComponentProps) {
  const product = loaderData?.product;
  return (
    <div className="p-10 md:w-2/3 mx-auto">
      <h2 className="text-2xl font-bold text-primary my-4">{product?.name}</h2>
      <div className="avatar mb-5">
        <div className="w-24 rounded">
          <img src={product?.thumbnail as string} alt="" className="avatar" />
        </div>
      </div>
      <p className="font-bold mb-3">Descripción:</p>
      <p className="mb-4">{product?.description}</p>
      <p className="font-bold mb-3">Precios:</p>
      {product?.prices?.map(price => (
        <div key={price.id}>
          <div>
            {price.info} £{price.amount / 100}
          </div>
        </div>
      ))}
    </div>
  );
}
