import type { Review } from "~/models/review.server";
import type { User } from "~/models/user.server";
import { Suspense, useCallback, useEffect, useRef } from "react";
import { FaStar } from "react-icons/fa6";
import { Await, useAsyncValue, useFetcher, useRouteLoaderData } from "react-router";
import ReviewsSkeleton from "~/components/skeletons/ReviewsSkeleton";
import { formatDate } from "~/utils/format";

const ReviewsSection = ({ reviews }: { reviews: Review[] }) => {

  return (
    <Suspense fallback={<ReviewsSkeleton />}>
      <Await resolve={reviews} errorElement={<p className="text-error text-xl text-center col-span-full py-6">⚠️ Error cargando los reviews!</p>}>
        <Reviews />
      </Await>
    </Suspense>
  );
};

export default ReviewsSection;

function Reviews() {
  const reviewsData = useAsyncValue() as Review[];
  const user = useRouteLoaderData("root")?.user as User;

  const renderStars = useCallback((score: number) => {
    const starArray = Array.from({ length: 5 });

    return starArray.map((_, index) => <FaStar key={index} className={index < score ? "text-warning" : "text-gray-400"} size={20} />);
  }, []);

  return (
    <section className="flex flex-col justify-center mb-6">
      <h2 className="font-semibold text-center text-3xl text-primary mb-4">Reviews</h2>
      <div className="carousel w-full lg:w-[85%] rounded-lg shadow-xl mx-auto mb-8 max-h-60 align-middle bg-neutral-content/10">
        {reviewsData?.length > 0 ? (
          reviewsData?.map((slide, index) => (
            <div key={slide.id} id={slide.id} className="carousel-item relative w-full flex-col items-center">
              <div className="rating pt-4">{renderStars(slide.score)}</div>
              <div className="w-full p-8 text-center">{slide.text}</div>
              <div className="text-sm opacity-80 pb-3 font-bold">
                {slide?.user?.username} {formatDate(slide.createdAt)}
              </div>
              <div className="absolute flex justify-between transform -translate-y-1/2 left-0 right-0 top-1/2">
                <a href={`#${reviewsData[index === 0 ? reviewsData.length - 1 : index - 1]?.id}`} className="btn btn-circle btn-ghost text-primary">
                  ❮
                </a>
                <a href={`#${reviewsData[index === reviewsData.length - 1 ? 0 : index + 1]?.id}`} className="btn btn-circle btn-ghost text-primary">
                  ❯
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full p-8 text-center">No hay reviews todavía.</div>
        )}
      </div>
      {user ? <ReviewForm /> : <div className="text-2xl text-center text-primary">Inicia sesión para dar tu opinión</div>}
    </section>
  );
}

function ReviewForm() {
  const fetcher = useFetcher({ key: "review" });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.message) {
      formRef.current?.reset(); // Reset the form
    }
  }, [fetcher.data?.message, fetcher.state, formRef]);

  return (
    <>
      <div className="font-semibold text-2xl text-center text-primary mb-6">Deja tu opinión</div>
      <fetcher.Form method="post" ref={formRef} className="text-center bg-neutral-content/10 p-6 rounded-lg shadow-lg w-96 mx-auto">
        <div className="rating mx-auto mb-6">
          <input type="radio" name="score" defaultValue={1} className="mask mask-star-2 bg-warning" />
          <input type="radio" name="score" defaultValue={2} className="mask mask-star-2 bg-warning" />
          <input type="radio" name="score" defaultValue={3} className="mask mask-star-2 bg-warning" />
          <input type="radio" name="score" defaultValue={4} className="mask mask-star-2 bg-warning" />
          <input type="radio" name="score" defaultValue={5} defaultChecked className="mask mask-star-2 bg-warning" />
        </div>
        <label className="form-control mb-3">
          <textarea name="text" className="textarea textarea-bordered h-24" placeholder="Review"></textarea>
        </label>
        {fetcher?.data?.error && <div className="text-error mb-4">{fetcher?.data?.error}</div>}
        <button className="btn btn-sm btn-primary">Confirmar</button>
      </fetcher.Form>
    </>
  );
}
