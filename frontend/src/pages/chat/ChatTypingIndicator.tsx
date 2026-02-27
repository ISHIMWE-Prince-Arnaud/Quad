import { motion, type Easing } from "framer-motion";

const dotVariants = {
  animate: (i: number) => ({
    y: [0, -4, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      delay: i * 0.15,
      ease: "easeInOut" as Easing,
    },
  }),
};

export function ChatTypingIndicator({
  typingUsers,
}: {
  typingUsers: Record<string, string>;
}) {
  const count = Object.keys(typingUsers).length;
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="px-6 pb-2">
      <div className="inline-flex items-center gap-2.5 rounded-2xl border border-border/30 bg-card/80 backdrop-blur-sm px-4 py-2 text-[11px] font-semibold text-muted-foreground shadow-sm">
        <div className="flex items-center gap-[3px]">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              custom={i}
              variants={dotVariants}
              animate="animate"
              className="h-[5px] w-[5px] rounded-full bg-primary/50"
            />
          ))}
        </div>
        <span className="leading-none">
          {Object.values(typingUsers).slice(0, 3).join(", ")}
          {count > 3 ? ` and ${count - 3} others` : ""}
          {count === 1 ? " is typing" : " are typing"}
        </span>
      </div>
    </motion.div>
  );
}
