import { CloudCog, Gauge, Layers3, ServerCog } from "lucide-react";

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
      "Modernizing cloud infrastructure and deployment pipelines for reliable, consistent releases.",
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
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="animate-fade-in">
              <span className="text-secondary-foreground text-sm font-medium tacking-wider uppercase">
                About Me
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight animate-fade-in animation-delay-100 text-secondary-foreground">
              Always building,
              <br />
              <span className="font-serif italic font-normal text-white">
                always learning.
              </span>
            </h2>

            <div className="space-y-4 text-muted-foreground animate-fade-in animation-delay-200">
              <p>
                Software engineer with 5+ years of experience building and
                scaling backend systems using C#, .NET, and Azure. Experienced
                in microservices architecture, performance optimization, and
                cloud-based distributed systems supporting thousands of users.
                Focused on delivering reliable, scalable solutions and
                continuously improving system efficiency.
              </p>
              <p>
                Outside of work, I enjoy gaming and spending time outdoors with
                my golden retriever. I am naturally curious and enjoy learning
                across a wide range of topics, which has led me to explore areas
                beyond web development such as game design, 3D modeling, and
                graphics programming.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 glow-border animate-fade-in animation-delay-300">
              <p className="text-lg font-medium italic text-foreground">
                Mission Statement Here
              </p>
            </div>
          </div>
          {/* Right */}
          <div className="grid sm:grid-cols-2 gap-6">
            {highlights.map((item, index) => (
              <div
                key={index}
                className="glass p-6 rounded-2xl animate-fade-in"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 hover:bg-primary/30">
                  <item.icon className="w-6 h- text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
