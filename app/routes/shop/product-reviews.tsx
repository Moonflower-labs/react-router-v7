import { createProductReview, getProduct } from '~/models/product.server';
import type { Route } from './+types/product-reviews'
import { Form, href, Link } from 'react-router';
import { useCallback } from 'react';
import { FaStar } from 'react-icons/fa';
import { getUserId } from '~/utils/session.server';
import { formatDate } from '~/utils/format';
import ActionError from '~/components/framer-motion/ActionError';

export async function loader({ params }: Route.LoaderArgs) {
    const product = await getProduct(params.productId);

    return { product };
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
    const { product } = loaderData
    const reviews = product?.reviews

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
        <main className='min-h-screen text-center p-4'>
            <Link to={href("/store")} className='btn btn-primary'>Atrás</Link>
            <h1 className='text-3xl mb-4'>Información del Producto</h1>
            <div>
                <img src={product?.thumbnail || ""} alt={product?.name} className='rounded-box w-56' />
            </div>
            <section>
                <h2 className='text-2xl mb-4'>Product Reviews</h2>
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
            </section>
            {/* Hide if no user */}
            <section className='mt-10'>
                <Form method='POST' ref={formRef} className='max-w-96 mx-auto'>
                    <div className="rating rating-md">
                        <input type="radio" name="productRating" className="rating-hidden" aria-label="clear" />
                        <input type="radio" name="productRating" value={1} className="mask mask-star-2" aria-label="1 star" />
                        <input type="radio" name="productRating" value={2} className="mask mask-star-2" aria-label="2 star" defaultChecked />
                        <input type="radio" name="productRating" value={3} className="mask mask-star-2" aria-label="3 star" />
                        <input type="radio" name="productRating" value={4} className="mask mask-star-2" aria-label="4 star" />
                        <input type="radio" name="productRating" value={5} className="mask mask-star-2" aria-label="5 star" />
                    </div>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Título</legend>
                        <input type="text" name='title' className="input" placeholder="Título" />
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Tu Opinión</legend>
                        <textarea className="textarea h-24" name='text' placeholder="Mi opinión sobre este producto..." ></textarea>
                    </fieldset>
                    {actionData?.error && <ActionError actionData={actionData} />}
                    <button type='submit' className='btn btn-primary my-3'>Enviar</button>
                </Form>
            </section>
        </main>
    )
}
