import { data, href, Link, useRouteLoaderData } from "react-router";
import StoreSkeleton from "~/components/skeletons/StoreSkeleton";
import type { Route } from "./+types/store";
import { Suspense, use } from "react";
import { addToCart } from "~/models/cart.server";
import { getAllProducts, type Product } from "~/models/product.server";
import type { User } from "~/models/user.server";
import { ProductItem } from "~/components/shop/ProductItem";
import { getUserId } from "~/middleware/sessionMiddleware";
import { CustomAlert } from "~/components/shared/info";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const baseUrl = url.origin

  const products = getAllProducts()// Return promise to suspend
  return { products, baseUrl };
}

export async function action({ request, context }: Route.ActionArgs) {
  const userId = getUserId(context);
  const formData = await request.formData();
  const productId = formData.get("productId");
  const priceId = formData.get("priceId");
  const action = formData.get("action");

  switch (action) {
    case "addToCart": {
      // Handle add to cart
      await addToCart(String(userId), String(productId), String(priceId), 1);
      break;
    }
    default: {
      throw data("productId or/and priceId missing", { status: 400 });
    }
  }
  return { success: true };
}

export default function Store({ loaderData }: Route.ComponentProps) {
  const user = useRouteLoaderData("root")?.user as User;


  return (
    <main className="min-h-screen mx-2">
      <h2 className="text-3xl text-center text-primary font-semibold pt-3 mb-4">Tienda</h2>
      {!user && (
        <CustomAlert level="warning" className="mb-8">
          <div className="text-center">
            Si estás suscrito a cualquier plan de <span className="text-primary font-bold">La Flor Blanca</span>, asegúrate de
            <Link to={href("/login")} className="link link-primary">
              {" "}
              iniciar sesión
            </Link>{" "}
            para aprovecharte de los descuentos de miembros:
            <ul className="text-start list-disc w-fit mx-auto pt-1">
              <li>
                5% ~ Personalidad
              </li>
              <li>
                10% ~ Alma
              </li>
              <li>
                15% ~ Espíritu.
              </li>
            </ul>
            <Link to={href("/plans")} className="btn btn-primary btn-xs float-end mt-3">
              {" "}
              Ver Planes de Suscripción
            </Link>
          </div>
        </CustomAlert>
      )}
      <Suspense fallback={<StoreSkeleton />}>
        <Products productPromise={loaderData?.products} baseUrl={loaderData?.baseUrl} />
      </Suspense>
    </main>
  );
}


function Products({ productPromise, baseUrl }: { productPromise: Promise<Product[]>, baseUrl: string }) {
  const products = use(productPromise)

  return (
    <div>
      {products?.length > 0 ?
        (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center pb-4 min-h-screen">
            {products.map((item: Product) =>
              <ProductItem key={item.id} item={item} baseUrl={baseUrl} />)}
          </div>
        ) : (
          <div className="text-2xl text-center mx-auto col-span-full">No hay productos que mostrar</div>
        )}
    </div>
  )
}
