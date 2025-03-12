import { Form, useFetcher } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { GiHeraldicSun } from "react-icons/gi";

export function Rating({ hasRated }: { hasRated: boolean }) {
  const fetcher = useFetcher();

  const animationProperties = {
    initial: { opacity: 0, rotateX: 90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: 90 },
    transition: { duration: 0.4 }
  };

  return (
    <AnimatePresence mode="wait">
      {hasRated ? (
        <motion.div key={"rated"} {...animationProperties}>
          <div className="badge badge-outline">Ya has valorado esta respuesta 👍</div>
        </motion.div>
      ) : (
        <motion.div key={"rating"} {...animationProperties}>
          <fetcher.Form method="post" className="rating rating-md gap-1 my-auto border p-3 rounded-md bg-secondary/15 align-middle">
            <div>Valora esta respuesta</div>
            <input type="hidden" name="intent" value="rating" />
            <input type="radio" name="rating-value" className="mask mask-heart bg-primary" defaultValue={1} />
            <input type="radio" name="rating-value" className="mask mask-heart bg-primary" defaultValue={2} />
            <input type="radio" name="rating-value" className="mask mask-heart bg-primary" defaultValue={3} defaultChecked />
            <button className="btn btn-primary btn-sm">Votar</button>
          </fetcher.Form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



interface RatingFormProps {
  maxRating?: number;
  hasRated: boolean;
}

export default function RatingForm({ maxRating = 5, hasRated = false }: RatingFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (rate: number) => {
    setRating(rate);
  };

  const handleMouseEnter = (rate: number) => setHoverRating(rate);
  const handleMouseLeave = () => setHoverRating(0);

  // Enhanced animation variants
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const starVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    },
    hover: {
      scale: 1.2,
      rotate: 15,
      transition: {
        duration: 0.2
      }
    },
    tap: { scale: 0.9 }
  };

  const submitButtonVariants = {
    initial: { scale: 0 },
    animate: {
      scale: rating > 0 ? 1 : 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {hasRated ? (
        <motion.div
          key="rated"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 260,
              damping: 20
            }
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="border rounded-lg p-4 shadow-lg bg-primary/20"
        >
          <motion.div
            initial={{ y: 10 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.5, repeat: 1 }}
          >
            Ya has valorado esta respuesta 👍
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="rating"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="p-4"
        >
          <Form method="post" className="flex flex-col items-center">
            <input type="hidden" name="rating-value" value={rating} />
            <input type="hidden" name="intent" value="rating" />

            <div className="flex gap-3 mb-6">
              {Array.from({ length: maxRating }, (_, i) => i + 1).map(rate => (
                <motion.button
                  key={rate}
                  variants={starVariants}
                  whileHover="hover"
                  whileTap="tap"
                  type="button"
                  onClick={() => handleClick(rate)}
                  onMouseEnter={() => handleMouseEnter(rate)}
                  onMouseLeave={handleMouseLeave}
                  className="focus:outline-none"
                >
                  <GiHeraldicSun
                    size={35}
                    className={`transition-all duration-300 ${rate <= (hoverRating || rating)
                      ? "text-yellow-400 drop-shadow-lg"
                      : "text-gray-400"
                      }`}
                  />
                </motion.button>
              ))}
            </div>

            <motion.button
              variants={submitButtonVariants}
              type="submit"
              className="btn btn-primary"
              disabled={rating === 0}
            >
              Submit Rating
            </motion.button>
          </Form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}