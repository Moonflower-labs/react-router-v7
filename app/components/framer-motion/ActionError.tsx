import { motion } from "motion/react";

export default function ActionError({ actionData }: { actionData: { error: string | null } }) {
  return (
    <>
      {actionData?.error && (
        <motion.div
          key={actionData?.error}
          initial={{ x: -220 }}
          animate={{ x: 0 }}
          exit={{ opacity: 0, x: 220 }} // Animate out when removed
          transition={{ type: "spring", stiffness: 300 }}
          className="text-error mb-3">
          {actionData?.error}
        </motion.div>
      )}
    </>
  );
}
