import { ImBin } from "react-icons/im";
import { useFetcher } from "react-router";
import type { CartItem } from "~/models/cart.server";


export function CartItem({ item }: { item: CartItem }) {
  const fetcher = useFetcher({ key: "manage-cart-item" });

  return (

    <li className="list-row items-center">
      <div><img className="size-9 rounded-box" src={item.product?.thumbnail || ""} alt="Imagen de producto" /></div>
      <div className="text-xs">
        <div> {item.product?.name}</div>
        <div className="list-col-wrap text-xs uppercase font-semibold opacity-60">{item.price?.info?.length > 30 ? `${item.price.info.slice(0, 18)}...` : item.price.info}</div>
      </div>
      <div className="text-xs">
        £{item.price?.amount / 100} x {item.quantity}
      </div>
      <div className="flex gap-1.5">
        <fetcher.Form method="post">
          <input type="hidden" name="priceId" value={item.price.id} />
          <input type="hidden" name="productId" value={item.product.id} />
          <button
            type="submit"
            name="action"
            value={"decrease"}
            className="btn btn-ghost btn-circle shadow btn-xs"
          >
            -
          </button>
        </fetcher.Form>
        <fetcher.Form method="post">
          <input type="hidden" name="priceId" value={item.price.id} />
          <input type="hidden" name="productId" value={item.product.id} />
          <button
            type="submit"
            name="action"
            value={"addToCart"}
            className="btn btn-ghost btn-circle shadow btn-xs"
          >
            +
          </button>
        </fetcher.Form>
        <fetcher.Form method="post">
          <input type="hidden" name="action" value={"remove"} />
          <input type="hidden" name="priceId" value={item.price.id} />
          <button
            type="submit"
            name="action"
            value={"remove"}
            className="btn btn-ghost btn-circle shadow btn-xs"
          >
            <ImBin size={20} className="my-auto text-red-500" />
          </button>
        </fetcher.Form>
      </div>
    </li>

  );
}


