import { SparkleIcon } from "lucide-react";
const STAR_COUNT = 150;

const randomIntInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const starArray = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 15 + Math.random() * 20,
  delay: Math.random() * 5,
  size: randomIntInRange(8, 15),
}));

export const Stars = () => {
  return (
    <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
      {starArray.map((star) => (
        <SparkleIcon
          key={star.id}
          fill="white"
          className="absolute w-3.5 h-3.5 opacity-25"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}`,
            height: `${star.size}`,
            animation: `slow-drift ${star.duration}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
};
