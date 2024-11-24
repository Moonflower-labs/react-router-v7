import { ImBin } from "react-icons/im";
import { useFetcher } from "react-router";
import type { CartItem } from "~/models/cart.server";

export function CartItem({ item }: { item: CartItem }) {
  const fetcher = useFetcher({ key: "manage-cart-item" });

  return (
    <tr>
      <td>
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="mask mask-squircle w-12 h-12">
              <img src={item.product?.thumbnail || ""} alt="Imagen de producto" />
            </div>
          </div>
        </div>
      </td>
      <td>
        {item.product?.name}
        <br />
        <span className="font-semibold text-primary">
          {item.price?.info?.length > 30 ? `${item.price.info.slice(0, 18)}...` : item.price.info}
        </span>
      </td>
      <td className="text-center">£{item.price?.amount / 100}</td>
      <td className="text-center">x{item.quantity}</td>
      <th>
        <div className="flex gap-2 align-middle my-auto">
          <fetcher.Form method="post">
            <input type="hidden" name="priceId" value={item.price.id} />
            <input type="hidden" name="productId" value={item.product.id} />
            <button
              type="submit"
              name="action"
              value={"decrease"}
              className="btn btn-outline btn-primary btn-xs"
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
              className="btn btn-outline btn-primary  btn-xs"
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
              className="btn btn-ghost btn-xs"
            >
              <ImBin size={22} className="my-auto text-red-500" />
            </button>
          </fetcher.Form>
        </div>
      </th>
    </tr>
  );
}
