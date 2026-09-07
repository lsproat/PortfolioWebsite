import { SparkleIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  STAR_SETTINGS,
  advanceStarField,
  createStarField,
  resizeStarField,
} from "./starField";

const STAR_IDS = STAR_SETTINGS.layers.flatMap((layer) =>
  Array.from({ length: layer.poolSize }, (_, id) => `${layer.id}:${id}`),
);

export const Stars = () => {
  const containerRef = useRef(null);
  const starRefs = useRef({});

  useEffect(() => {
    const fields = STAR_SETTINGS.layers.map((settings) =>
      createStarField(Math.random, settings),
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId;
    let previousTime;
    let previousScroll = window.scrollY;

    const paint = () => {
      for (const field of fields) {
        for (const star of field.activeStars) {
          const element = starRefs.current[star.id];
          element.style.transform = `translate3d(${star.x}px, ${star.y}px, 0)`;
        }
      }
    };

    for (const field of fields) {
      for (const star of field.stars) {
        const element = starRefs.current[star.id];
        element.style.width = `${star.size}px`;
        element.style.height = `${star.size}px`;
        element.style.opacity = field.settings.opacity;
      }
    }

    const observer = new ResizeObserver(([entry]) => {
      for (const field of fields) {
        resizeStarField(field, entry.contentRect.width, entry.contentRect.height);
        for (const star of field.stars) {
          starRefs.current[star.id].style.visibility = star.active ? "visible" : "hidden";
        }
      }
      paint();
    });
    observer.observe(containerRef.current);

    const animate = (time) => {
      if (previousTime !== undefined) {
        // Prevent a long frame from teleporting stars across the screen.
        const seconds = Math.min((time - previousTime) / 1000, 0.05);
        for (const field of fields) {
          advanceStarField(field, seconds, window.scrollY - previousScroll);
        }
        paint();
      }
      previousTime = time;
      previousScroll = window.scrollY;
      frameId = requestAnimationFrame(animate);
    };

    const syncAnimation = () => {
      cancelAnimationFrame(frameId);
      previousTime = undefined;
      previousScroll = window.scrollY;
      for (const field of fields) field.speed = field.settings.restSpeed;
      if (!document.hidden && !reducedMotion.matches) {
        frameId = requestAnimationFrame(animate);
      }
    };

    document.addEventListener("visibilitychange", syncAnimation);
    reducedMotion.addEventListener("change", syncAnimation);
    syncAnimation();

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
      document.removeEventListener("visibilitychange", syncAnimation);
      reducedMotion.removeEventListener("change", syncAnimation);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-10 overflow-hidden pointer-events-none"
    >
      {STAR_IDS.map((id) => (
        <SparkleIcon
          key={id}
          ref={(element) => { starRefs.current[id] = element; }}
          fill="white"
          className="absolute top-0 left-0"
          style={{ visibility: "hidden" }}
        />
      ))}
    </div>
  );
};
