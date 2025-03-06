import type { ProductReview } from "@prisma/client";
import { FaStar } from "react-icons/fa";
import { href, Link, useFetcher } from "react-router";
import type { Product } from "~/models/product.server";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  WhatsappIcon,
  XIcon,
  TelegramIcon,
  TelegramShareButton,
} from 'react-share';


export const ProductItem = ({ item, baseUrl }: { item: Product, baseUrl: string }) => {
  const fetcher = useFetcher({ key: "add-to-cart" });
  const productUrl = `${baseUrl}${href("/store/product/:productId/reviews", { productId: item.id })}`;

  const calculateAverageRating = (reviews: ProductReview[]): number => {
    if (!reviews || reviews.length === 0) return 0;

    const totalScore = reviews.reduce((sum, review) => sum + review.score, 0);
    const average = totalScore / reviews.length;

    return Number(average.toFixed(1)); // Round to 1 decimal place and convert to number
  };
  const averageRating = calculateAverageRating(item.reviews as ProductReview[])

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
            <label className="select w-full mt-4 mb-6">
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
        <div className="flex justify-between items-center">
          <div className="flex flex-row gap-2 items-center j">
            <FaStar size={24} />
            <span>{averageRating > 0 ? averageRating : null}</span>
          </div>
          <Link
            to={href("/store/product/:productId/reviews", { productId: item.id })}
            className="text-sm font-bold py-4 text-end"
          >
            <span className="border-base-300 badge badge-secondary shadow">Ver Reviews</span>
          </Link>
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <TelegramShareButton url={productUrl} title={item.name}>
            <TelegramIcon size={32} round />
          </TelegramShareButton>
          <FacebookShareButton url={productUrl} title={item.name}>
            <FacebookIcon size={32} round />
          </FacebookShareButton>
          <TwitterShareButton url={productUrl} title={item.name}>
            <XIcon size={32} round />
          </TwitterShareButton>
          <WhatsappShareButton url={productUrl} title={item.name}>
            <WhatsappIcon size={30} round />
          </WhatsappShareButton>
        </div>
      </div>
    </div>
  );
};
