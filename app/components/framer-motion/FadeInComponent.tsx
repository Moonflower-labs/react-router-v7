import { motion } from "motion/react";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export function FadeInComponent({ children }: { children: React.ReactNode }) {

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      transition={{ duration: 0.8 }}
      className=""
    >
      {children}
    </motion.div>
  );
}
