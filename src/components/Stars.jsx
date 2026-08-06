import { SparkleIcon } from "lucide-react";

const randomIntInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const starArray = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 15 + Math.random() * 20,
  delay: Math.random() * 5,
  size: randomIntInRange(8, 15),
}));

export const Stars = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {starArray.map((star) => (
        <SparkleIcon
          key={star.id}
          fill="white"
          className="absolute w-3.5 h-3.5 opacity-40"
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
