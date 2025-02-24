import type { Review } from "~/models/review.server";
import type { User } from "~/models/user.server";
import { Suspense, use, useCallback, useState } from "react";
import { FaStar } from "react-icons/fa6";
import { useFetcher, useRouteLoaderData } from "react-router";
import ReviewsSkeleton from "~/components/skeletons/ReviewsSkeleton";
import { formatDate } from "~/utils/format";
import { AnimatePresence, motion } from "motion/react";

const ReviewsSection = ({ reviews }: { reviews: Promise<Review[]> }) => {
  const user = useRouteLoaderData("root")?.user as User;

  return (
    <main id="reviews" className="mx-3">
      <h2 className="font-semibold text-center text-3xl mb-6">Opiniones</h2>
      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsCarousel reviewsPromise={reviews} />
      </Suspense>
      {user ? <ReviewForm /> : <div className="text-2xl text-center text-primary mb-4">Inicia sesión para dar tu opinión</div>}
    </main>

  );
};

export default ReviewsSection



const ReviewsCarousel = ({ reviewsPromise }: { reviewsPromise: Promise<Review[]> }) => {

  const [activeSlide, setActiveSlide] = useState(0);
  const [startTouch, setStartTouch] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const reviews = use<Review[]>(reviewsPromise)
  const renderStars = useCallback((score: number) => {
    const starArray = Array.from({ length: 5 });
    return starArray.map((_, index) => (
      <FaStar key={index} className={index < score ? "text-warning" : "text-base-300"} size={24} />
    ));
  }, []);

  const prevSlide = () => {
    setSlideDirection('right');
    setActiveSlide((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setSlideDirection('left');
    setActiveSlide((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touchStart = e.touches[0].clientX;
    setStartTouch(touchStart);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    if (startTouch - touchEnd > 50) {
      setSlideDirection('left');
      nextSlide(); // Swipe left (next)
    } else if (touchEnd - startTouch > 50) {
      setSlideDirection('right');
      prevSlide(); // Swipe right (previous)
    }
  };

  const variants = {
    initial: (direction: 'left' | 'right') => ({
      x: !direction ? 0 : direction === 'left' ? 700 : -700,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1
    },
    exit: (direction: 'left' | 'right' | null) => ({
      x: direction === 'left' ? -700 : 700,
      opacity: 0
    })
  };

  return (
    <section className="flex flex-col justify-center mb-14">
      <div
        className="h-60 relative w-full lg:w-[70%] rounded-lg shadow-xl mx-auto align-middle bg-base-200 border border-base-300 overflow-x-hidden overflow-y-auto"
        onTouchStart={handleTouchStart} // Set up touch start event
        onTouchEnd={handleTouchEnd} // Set up touch end event
      >
        <AnimatePresence mode="wait" custom={slideDirection}>
          {reviews?.length > 0 ? (
            reviews.map((slide, index) => (
              activeSlide === index ?
                <motion.div
                  key={slide.id}
                  custom={slideDirection}
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.6 }}
                  className={`w-full h-full flex flex-col justify-center items-center`}
                >
                  <div className="pt-4 flex justify-center">{renderStars(slide.score)}</div>
                  <div className="w-full p-8 text-center">{slide.text}</div>
                  <div className="flex justify-center text-sm opacity-80 pb-3 font-bold">
                    {slide?.user?.username} {formatDate(slide.createdAt)}
                  </div>
                </motion.div>
                : null
            ))
          ) : (
            <div className="w-full p-8 text-center">No hay reviews todavía.</div>
          )}
        </AnimatePresence>
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
      <h2 className="font-semibold text-3xl text-center mb-6">Deja tu opinión</h2>
      <fetcher.Form method="post" ref={formRef} className="text-center bg-base-200 border border-base-300 p-6 rounded-lg shadow-lg w-full lg:w-96 mx-auto mb-6">
        <div className="rating mx-auto mb-6">
          <input type="radio" name="score" defaultValue={1} className="mask mask-star-2 bg-warning" />
          <input type="radio" name="score" defaultValue={2} className="mask mask-star-2 bg-warning" />
          <input type="radio" name="score" defaultValue={3} className="mask mask-star-2 bg-warning" />
          <input type="radio" name="score" defaultValue={4} className="mask mask-star-2 bg-warning" />
          <input type="radio" name="score" defaultValue={5} defaultChecked className="mask mask-star-2 bg-warning" />
        </div>
        <label>
          <textarea name="text" className="textarea textarea-lg h-24 mb-3" placeholder="Review"></textarea>
        </label>
        {fetcher?.data?.error && <div className="text-error mb-4">{fetcher?.data?.error}</div>}
        <button className="btn btn-sm btn-primary">Confirmar</button>
      </fetcher.Form>
    </>
  );
}