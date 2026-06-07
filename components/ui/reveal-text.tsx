"use client";

import { m } from "motion/react";
import { useEffect, useState } from "react";

interface RevealTextProps {
  text?: string;
  textColor?: string;
  overlayColor?: string;
  fontSize?: string;
  letterDelay?: number;
  overlayDelay?: number;
  overlayDuration?: number;
  springDuration?: number;
  letterImages?: string[];
}

export function RevealText({
  text = "BogorXplore",
  textColor = "text-zinc-900",
  overlayColor = "text-[#ff5caf]",
  fontSize = "text-[clamp(3.6rem,9vw,10rem)]",
  letterDelay = 0.08,
  overlayDelay = 0.05,
  overlayDuration = 0.4,
  springDuration = 600,
  letterImages = [
    "https://sportandtourism.bogorkab.go.id/wp-content/uploads/2023/07/1-5-250x250.jpg",
    "https://sportandtourism.bogorkab.go.id/wp-content/uploads/2023/07/1-9-250x250.jpg",
    "https://sportandtourism.bogorkab.go.id/wp-content/uploads/2023/07/1-8-250x250.jpg",
    "https://sportandtourism.bogorkab.go.id/wp-content/uploads/2023/07/1-10-250x250.jpg",
    "https://sportandtourism.bogorkab.go.id/wp-content/uploads/2023/06/15-250x250.jpg",
    "https://sportandtourism.bogorkab.go.id/wp-content/uploads/2023/07/1-3-250x250.jpg",
    "https://sportandtourism.bogorkab.go.id/wp-content/uploads/2023/06/2-1-250x250.jpg",
    "https://sportandtourism.bogorkab.go.id/wp-content/uploads/2023/06/1-1-250x250.jpg",
    "https://sportandtourism.bogorkab.go.id/wp-content/uploads/2022/10/google-map_yoga-pratama-min-2-250x250.jpg",
    "https://sportandtourism.bogorkab.go.id/wp-content/uploads/2022/09/277392154_1248485765679829_4740211887849995935_n-250x250.jpg",
    "https://sportandtourism.bogorkab.go.id/wp-content/uploads/2021/11/Kerajinan_Koran_Bekas_Craft_Sebelas_Kopi_3.width-800-250x250.jpg",
  ],
}: RevealTextProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showOverlayText, setShowOverlayText] = useState(false);

  useEffect(() => {
    const lastLetterDelay = (text.length - 1) * letterDelay;
    const totalDelay = lastLetterDelay * 1000 + springDuration;

    const timer = window.setTimeout(() => {
      setShowOverlayText(true);
    }, totalDelay);

    return () => window.clearTimeout(timer);
  }, [text.length, letterDelay, springDuration]);

  return (
    <div className="relative flex items-center justify-center">
      <div className="flex flex-wrap justify-center pb-4">
        {text.split("").map((letter, index) => (
          <m.span
            key={`${letter}-${index}`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`${fontSize} relative cursor-pointer overflow-visible pb-[0.12em] font-black leading-[1.08] tracking-normal`}
            initial={{
              scale: 0.95,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              delay: index * letterDelay,
              type: "spring",
              damping: 8,
              stiffness: 200,
              mass: 0.8,
            }}
          >
            <m.span
              className={`absolute inset-0 ${textColor}`}
              animate={{
                opacity: hoveredIndex === index ? 0 : 1,
              }}
              transition={{ duration: 0.1 }}
            >
              {letter}
            </m.span>

            <m.span
              className="bg-cover bg-clip-text bg-no-repeat text-transparent"
              animate={{
                opacity: hoveredIndex === index ? 1 : 0,
                backgroundPosition: hoveredIndex === index ? "10% center" : "0% center",
              }}
              transition={{
                opacity: { duration: 0.1 },
                backgroundPosition: {
                  duration: 3,
                  ease: "easeInOut",
                },
              }}
              style={{
                backgroundImage: `url('${letterImages[index % letterImages.length]}')`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {letter}
            </m.span>

            {showOverlayText && (
              <m.span
                className={`pointer-events-none absolute inset-0 ${overlayColor}`}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  delay: index * overlayDelay,
                  duration: overlayDuration,
                  times: [0, 0.1, 0.7, 1],
                  ease: "easeInOut",
                }}
              >
                {letter}
              </m.span>
            )}
          </m.span>
        ))}
      </div>
    </div>
  );
}
