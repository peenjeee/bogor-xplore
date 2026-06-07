"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m, type Variants } from "motion/react";

interface AnimatedTextCycleProps {
  words: string[];
  interval?: number;
  className?: string;
}

const containerVariants: Variants = {
  hidden: {
    y: -20,
    opacity: 0,
    filter: "blur(2px)",
  },
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    y: 20,
    opacity: 0,
    filter: "blur(2px)",
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

export default function AnimatedTextCycle({
  words,
  interval = 5000,
  className = "",
}: AnimatedTextCycleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [interval, words.length]);

  if (!words.length) return null;

  const currentWord = words[currentIndex] ?? words[0];

  return (
    <m.span className="relative inline-block align-baseline">
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={currentWord}
          className={`inline-block font-bold ${className}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ whiteSpace: "nowrap" }}
        >
          {currentWord}
        </m.span>
      </AnimatePresence>
    </m.span>
  );
}
