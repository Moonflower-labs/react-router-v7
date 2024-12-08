import type { Review } from "~/models/review.server";
import type { User } from "~/models/user.server";
import { Suspense, useCallback, useState } from "react";
import { FaStar } from "react-icons/fa6";
import { Await, useFetcher, useRouteLoaderData } from "react-router";
import ReviewsSkeleton from "~/components/skeletons/ReviewsSkeleton";
import { formatDate } from "~/utils/format";

const ReviewsSection = ({ reviews }: { reviews: Promise<Review[]> }) => {

  return (
    <Suspense fallback={<ReviewsSkeleton />}>
      <Await resolve={reviews} errorElement={<p className="text-error text-xl text-center col-span-full py-6">⚠️ Error cargando los reviews!</p>}>
        {(resolvedReviews) =>
          <section>
            <ReviewsCarousel reviewsData={resolvedReviews} />
          </section>
        }
      </Await>
    </Suspense>
  );
};

export default ReviewsSection

const ReviewsCarousel = ({ reviewsData }: { reviewsData: Review[] }) => {
  const user = useRouteLoaderData("root")?.user as User;
  const [activeSlide, setActiveSlide] = useState(0);
  const [startTouch, setStartTouch] = useState(0);

  const renderStars = useCallback((score: number) => {
    const starArray = Array.from({ length: 5 });
    return starArray.map((_, index) => (
      <FaStar key={index} className={index < score ? "text-warning" : "text-gray-400"} size={20} />
    ));
  }, []);

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? reviewsData.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === reviewsData.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touchStart = e.touches[0].clientX;
    setStartTouch(touchStart);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    if (startTouch - touchEnd > 50) {
      nextSlide(); // Swipe left (next)
    } else if (touchEnd - startTouch > 50) {
      prevSlide(); // Swipe right (previous)
    }
  };

  return (
    <section className="flex flex-col justify-center mb-6">
      <h2 className="font-semibold text-center text-3xl text-primary mb-4">Opiniones</h2>
      <div
        className="carousel w-full lg:w-[70%] rounded-lg shadow-xl mx-auto mb-8 max-h-60 align-middle bg-neutral-content/10"
        onTouchStart={handleTouchStart} // Set up touch start event
        onTouchEnd={handleTouchEnd} // Set up touch end event
      >
        {reviewsData?.length > 0 ? (
          reviewsData.map((slide, index) => (
            <div
              key={slide.id}
              className={`carousel-item relative w-full flex-col justify-center items-center ${activeSlide === index ? "block" : "hidden"}`}
            >
              <div className="rating pt-4 flex justify-center">{renderStars(slide.score)}</div>
              <div className="w-full p-8 text-center">{slide.text}</div>
              <div className="flex justify-center text-sm opacity-80 pb-3 font-bold">
                {slide?.user?.username} {formatDate(slide.createdAt)}
              </div>
              <div className="absolute flex justify-between transform -translate-y-1/2 left-0 right-0 top-1/2">
                <button
                  className="btn btn-circle btn-ghost text-primary"
                  onClick={prevSlide}
                >
                  ❮
                </button>
                <button
                  className="btn btn-circle btn-ghost text-primary"
                  onClick={nextSlide}
                >
                  ❯
                </button>
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
};


function ReviewForm() {
  const fetcher = useFetcher({ key: "review" });
  const formRef = useCallback((node: HTMLFormElement | null) => {
    if (node && fetcher.state === "idle" && fetcher.data?.message) {
      node.reset();
    }
  }, [fetcher.state, fetcher.data?.message]);


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