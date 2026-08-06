import { CloudCog, Gauge, Layers3, ServerCog } from "lucide-react";
import { Stars } from "../components/Stars";

const highlights = [
  {
    icon: ServerCog,
    title: "Backend Systems",
    description:
      "Building scalable C# and .NET services designed for reliability and long-term growth.",
  },
  {
    icon: Gauge,
    title: "Performance",
    description:
      "Reducing latency and improving efficiency through focused backend and system optimization.",
  },
  {
    icon: CloudCog,
    title: "Cloud & DevOps",
    description:
      "Modernizing Azure infrastructure and deployment pipelines for reliable, consistent releases.",
  },
  {
    icon: Layers3,
    title: "Full-Stack Development",
    description:
      "Delivering practical features across APIs, data, and responsive React interfaces.",
  },
];

export const About = () => {
  return (
    <section id="about" className="py-32 relative overflow-hidden">
      <div>
        <div>
          {/* Left */}
          <div>
            <span>About Me</span>
          </div>

          <h2>
            Building the future,
            <span>one component at a time.</span>
          </h2>
        </div>
        <div>{/* Right */}</div>
      </div>
      <Stars />
    </section>
  );
};
