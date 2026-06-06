import { motion } from "framer-motion";

export function BackgroundFX() {
  return (
    <>
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]"
      />
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.2 }}
        className="pointer-events-none absolute right-0 top-40 h-[420px] w-[420px] rounded-full bg-state-succeed/15 blur-[120px]"
      />
    </>
  );
}
