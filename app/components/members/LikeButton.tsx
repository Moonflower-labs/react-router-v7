import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useFetcher } from "react-router";

interface Props {
  object: string;
  id: string;
  isLiked: boolean;
}

function Like({ object, id, isLiked }: Props) {
  const fetcher = useFetcher();

  const liked = fetcher.formData
    ? // check the formData to be optimistic
    fetcher.formData.get("action") === "like"
    : // if its not posting to the action, use the record's value
    isLiked;

  return (
    <fetcher.Form method="post" className="my-auto">
      <input type="hidden" name={object} value={id} />
      <input type="hidden" name="intent" value="like" />
      <AnimatedHeartButton liked={liked} />
    </fetcher.Form>
  );
}
export const LikeButton = React.memo(Like);





interface AnimatedHeartButtonProps {
  liked: boolean;
}

const AnimatedHeartButton: React.FC<AnimatedHeartButtonProps> = ({ liked }) => {
  return (
    <button
      type="submit"
      name="action" value={liked ? "dislike" : "like"}
      className="relative"
    >
      <AnimatePresence mode="wait">
        {liked ? (
          <motion.div
            key="liked"
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 15
              }
            }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 15, -15, 0]
              }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
                times: [0, 0.2, 0.5, 0.8],
                repeat: 1,
                repeatDelay: 1
              }}
            >
              <FaHeart className="text-primary" size={25} />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="disliked"
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 15
              }
            }}
            exit={{ scale: 0 }}
            whileHover={{
              scale: 1.1,
              rotate: [-5, 5, -5, 0]
            }}
            whileTap={{ scale: 0.9 }}
          >
            <FaRegHeart className="text-primary" size={25} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default AnimatedHeartButton;
