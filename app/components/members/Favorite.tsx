import { AnimatePresence, motion } from "framer-motion";
import { FaStar, FaRegStar } from "react-icons/fa";
import { useFetcher } from "react-router";
import { Post } from "~/models/post.server";
import { Video } from "~/models/video.server";

export function Favorite({ object, isFavorite }: { object: Post | Video; isFavorite?: boolean }) {
  const fetcher = useFetcher();
  const favorite = fetcher.formData ? fetcher.formData?.get("action") === "add" : isFavorite;

  return (
    <fetcher.Form method="post" className="my-auto">
      <fieldset disabled={fetcher.state !== "idle"}>
        <input type="hidden" name="id" value={object?.id} />
        <input type="hidden" name="action" value={favorite ? "remove" : "add"} />
        <input type="hidden" name="intent" value="favorite" />
        <AnimatedStarButton favorite={favorite || false} objectId={object?.id} />
      </fieldset>
    </fetcher.Form>
  );
}



interface AnimatedStarButtonProps {
  favorite: boolean;
  objectId: string;
}

const AnimatedStarButton = ({ favorite, objectId }: AnimatedStarButtonProps) => {
  return (
    <button
      type="submit"
      className="text-accent text-xl relative"
      name="id"
      value={objectId}
    >
      <AnimatePresence mode="wait">
        {favorite ? (
          <motion.div
            key="favorite"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: 1,
              y: 0,
              rotate: [0, 360],  // Full rotation
            }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              rotate: {
                duration: 0.5,
                ease: "easeOut"
              }
            }}
            whileHover={{
              filter: "brightness(1.2)",
              scale: 1.1,
              y: -3
            }}
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}  // Floating effect
              transition={{
                y: {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <FaStar size={25} />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="unfavorite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{
              scale: 1.1,
              y: -2,
              transition: {
                duration: 0.2,
                ease: "easeOut"
              }
            }}
          >
            <FaRegStar size={25} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default AnimatedStarButton;
