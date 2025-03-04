import { useFetcher } from "react-router";
import type { Product } from "~/models/product.server";

export const ProductItem = ({ item }: { item: Product }) => {
  const fetcher = useFetcher({ key: "add-to-cart" });

  return (
    <div className="card w-[92%] bg-base-200 mx-auto shadow-lg">
      <figure className="p-10 pt-10">
        <img src={item?.thumbnail || ""} alt={item?.name} className="aspect-square rounded-xl" />
      </figure>
      <div className="card-body px-10">
        <h2 className="card-title">{item?.name}</h2>
        <p>{item?.description}</p>
        <div className="card-actions justify-center items-center">
          <fetcher.Form method="post" className="text-center w-full">
            <label className="select w-full my-4">
              <input type="hidden" name="productId" value={item.id} />
              <input type="hidden" name="quantity" value={1} />
              <span className="label">Elige uno</span>
              <select name="priceId" className="">
                {item?.prices &&
                  item.prices.map(price => (
                    <option key={price.id} value={price.id}>
                      {price?.info} £{price.amount / 100}
                    </option>
                  ))}
              </select>
            </label>
            <button type="submit" name="action" value={"addToCart"} className="btn btn-primary mx-auto">
              Añadir a la cesta
            </button>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
};
