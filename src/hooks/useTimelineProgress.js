import { useEffect, useRef, useState } from "react";

// Select the card beside viewport center, or the nearest card across a gap.
export const useTimelineProgress = () => {
  const timelineRef = useRef(null); // Attach to the actual vertical line.
  const lightRef = useRef(null); // Attach to a positioned child of that line.
  const cardRefs = useRef([]); // Attach to each card's visible bordered element.
  const [activeIndex, setActiveIndex] = useState(null);
  const selectedIndexRef = useRef(null);

  useEffect(() => {
    let frameId = null;
    const selectCard = (index) => {
      if (index === selectedIndexRef.current) return;
      selectedIndexRef.current = index;
      setActiveIndex(index);
    };

    const update = () => {
      frameId = null;
      const timeline = timelineRef.current;
      const light = lightRef.current;
      if (!timeline || !light) return;

      // These measurements share the viewport's coordinate system.
      const lineRect = timeline.getBoundingClientRect();
      const screenCenter = window.innerHeight / 2;
      const positionOnLine = screenCenter - lineRect.top;

      if (
        lineRect.height <= 0 ||
        positionOnLine < 0 ||
        positionOnLine > lineRect.height
      ) {
        light.style.visibility = "hidden";
        selectCard(null);
        return;
      }

      // Distance to the card's vertical interval is zero while beside it.
      // In gaps, switch at the midpoint between the neighboring card edges.
      // Actual bounds adapt to text wrapping and viewport size without thresholds.
      let nearestIndex = null;
      let nearestDistance = Infinity;
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        if (rect.height <= 0) return;
        const distance = Math.max(
          rect.top - screenCenter,
          screenCenter - rect.bottom,
          0,
        );
        // Strict comparison gives ties to the first card, keeping one selection.
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      // Opacity of icon
      const progress = Math.max(
        0,
        Math.min(1, positionOnLine / lineRect.height),
      );
      const split = 0.7;
      const opacity =
        progress <= split
          ? 1 + (0.6 - 1) * (progress / split)
          : 0.6 * (1 - (progress - split) / (1 - split));

      light.style.opacity = String(opacity);
      light.style.transform = `translateY(${positionOnLine}px) translate(-50%, -50%)`;
      light.style.visibility = "visible";

      // Pixel movement stays outside React; only changing cards causes a render.
      selectCard(nearestIndex);
    };

    // Several scroll events can arrive before a frame. Schedule only one update.
    const scheduleUpdate = () => {
      if (frameId === null) frameId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    // Also remeasure if wrapping text or loaded content changes timeline height.
    const observer = new ResizeObserver(scheduleUpdate);
    if (timelineRef.current) observer.observe(timelineRef.current);
    for (const card of cardRefs.current) {
      if (card) observer.observe(card);
    }
    // Listen above the rows so their entrance animation events bubble here.
    const timelineContainer = timelineRef.current?.parentElement;
    timelineContainer?.addEventListener("animationend", scheduleUpdate);
    scheduleUpdate();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      observer.disconnect();
      timelineContainer?.removeEventListener("animationend", scheduleUpdate);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, []);

  return { timelineRef, lightRef, cardRefs, activeIndex };
};
