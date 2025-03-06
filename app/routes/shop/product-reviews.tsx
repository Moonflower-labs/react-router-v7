import { createProductReview, getProduct, getProductReviews } from '~/models/product.server';
import type { Route } from './+types/product-reviews'
import { Form, href, Link } from 'react-router';
import { useCallback } from 'react';
import { FaArrowLeft, FaStar } from 'react-icons/fa';
import { getUserId } from '~/utils/session.server';
import { formatDate } from '~/utils/format';
import ActionError from '~/components/framer-motion/ActionError';


export function meta({ data, location }: Route.MetaArgs) {
    const { product, baseUrl } = data;
    const postUrl = `${baseUrl}${location.pathname}`;

    return [
        { name: "description", content: "Check out this awesome post!" },
        //  Open Graph required
        { property: "og:url", content: postUrl },
        { property: "og:type", content: "producct" },
        { property: "og:title", content: product?.name },
        { property: "og:description", content: "Producto de La Flor Blanca" },
        { property: "og:image", content: product?.thumbnail },
        // X specific
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: product?.name },
        { name: "twitter:description", content: "Check out this awesome product!" },
        { name: "twitter:image", content: product?.thumbnail },
        { title: product?.name },
    ];
}

export async function loader({ params, request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const baseUrl = url.origin
    const page = parseInt(url.searchParams.get("page") || "1", 10);

    const [product, { reviews, totalReviews }] = await Promise.all([
        getProduct(params.productId),
        getProductReviews(params.productId, page),
    ]);

    return { product, reviews, page, totalReviews, baseUrl };
}

export async function action({ request, params }: Route.ActionArgs) {
    const formData = await request.formData()
    const productId = params.productId
    const score = formData.get("productRating");
    const title = formData.get("title");
    const text = formData.get("text");
    let userId = await getUserId(request)
    if (!score || !title || typeof title !== "string" || !text || typeof text !== "string") {
        return { error: "Debes de escribir un título y review" }
    }
    if (userId?.startsWith("guest-")) {
        userId = undefined
    }
    try {
        const review = await createProductReview({ productId, score: Number(score), title, text, userId })
        return { success: true, review }
    } catch (e) {
        console.error(e)
    }

    return {};
}

export default function ProductReviews({ loaderData, actionData }: Route.ComponentProps) {
    const { product, reviews, page, totalReviews } = loaderData
    const pageSize = 3; // Match getProductReviews default
    const totalPages = Math.ceil(totalReviews / pageSize);
    // const reviews = product?.reviews

    const formRef = useCallback((node: HTMLFormElement | null) => {
        if (node && actionData?.success) {
            node.reset();
        }
    }, [actionData?.success]);

    const renderStars = useCallback((score: number) => {
        const starArray = Array.from({ length: 5 });
        return starArray.map((_, index) => (
            <FaStar key={index} className={index < score ? "text-warning" : "text-base-300"} size={24} />
        ));
    }, []);

    return (
        <main className='min-h-screen p-4'>
            <Link to={href("/store")} className='btn btn-primary'><FaArrowLeft />Atrás</Link>
            <h1 className='text-3xl my-4 text-center'>Producto</h1>
            <div className='mb-4 text-center'>
                <img src={product?.thumbnail || ""} alt={product?.name} className='rounded-box w-56 mx-auto' />
                <div className='flex flex-col gap-2 mt-2 max-w-lg mx-auto'>
                    <p className='font-bold text-lg'>{product?.name}</p>
                    <p>{product?.description}</p>
                </div>
            </div>
            <section className='text-center'>
                <h2 className='text-2xl mb-4'>Opiniones sobre el Producto</h2>
                {reviews && reviews.length > 0 ? (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 w-full'>
                        {reviews.map((review) => (
                            <div key={review.id} className="card card-border bg-base-100 w-full">
                                <div className="card-body">
                                    <div className="pt-4 mb-3 flex justify-center">{renderStars(review.score)}</div>
                                    <h2 className="card-title mx-auto">{review.title}</h2>
                                    <p>{review.text}</p>
                                    <p className='text-xs'>{formatDate(review.createdAt)}</p>
                                    <div className="card-actions justify-end">
                                        <span>{review.user ? review.user.username : "Anónimo"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Todavía no hay ningún review de este producto.</p>
                )}
                {totalReviews > pageSize && (
                    <div className="join pt-10">
                        <Link
                            to={`?page=${page - 1}`}
                            className={`join-item btn btn-sm btn-outline btn-primary ${page === 1 ? 'btn-disabled' : ''}`}
                            preventScrollReset
                            aria-disabled={page === 1}
                            viewTransition
                        >
                            Anterior
                        </Link>
                        <div className='join-item btn btn-sm btn-outline btn-primary pointer-events-none'>
                            Página {page} de {totalPages}
                        </div>
                        <Link
                            to={`?page=${page + 1}`}
                            className={`join-item btn btn-sm btn-outline btn-primary ${page === totalPages ? 'btn-disabled' : ''}`}
                            preventScrollReset
                            aria-disabled={page === totalPages}
                            viewTransition
                        >
                            Siguiente
                        </Link>
                    </div>
                )}
            </section>
            <section className='mt-10 text-center'>
                <h2 className='text-2xl font-bold mb-3'>¿ Has probado este producto ?</h2>
                <p className='mb-4'>Cuéntanos que te ha parecido</p>
                <Form method='POST' ref={formRef} className='max-w-96 mx-auto p-6 rounded-lg border border-base-200'>
                    <div className="rating rating-md">
                        <input type="radio" name="productRating" className="rating-hidden" aria-label="clear" />
                        <input type="radio" name="productRating" value={1} className="mask mask-star-2 bg-warning" aria-label="1 star" />
                        <input type="radio" name="productRating" value={2} className="mask mask-star-2 bg-warning" aria-label="2 star" />
                        <input type="radio" name="productRating" value={3} className="mask mask-star-2 bg-warning" aria-label="3 star" />
                        <input type="radio" name="productRating" value={4} className="mask mask-star-2 bg-warning" aria-label="4 star" />
                        <input type="radio" name="productRating" value={5} className="mask mask-star-2 bg-warning" aria-label="5 star" defaultChecked />
                    </div>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Título</legend>
                        <input type="text" name='title' className="input input-lg w-full" placeholder="Título" />
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Tu Opinión</legend>
                        <textarea className="textarea textarea-lg h-24 w-full" name='text' placeholder="Mi opinión sobre este producto..." ></textarea>
                    </fieldset>
                    {actionData?.error && <ActionError actionData={actionData} />}
                    <button type='submit' className='btn btn-primary my-3'>Enviar</button>
                </Form>
            </section>
        </main>
    )
}
