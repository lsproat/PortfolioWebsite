import { Button } from "@/components/button";
import { ArrowRight } from "lucide-react";
import { RiGithubFill, RiLinkedinFill } from "@remixicon/react";
import { AnimatedBorderButton } from "../components/AnimatedBorderButton";

const dots = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 15 + Math.random() * 20,
  delay: Math.random() * 5,
}));

export const Profile = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/profile-background-tmp.png"
          alt="Profile image"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-linear-to-b from-background/90 via-background/20 to-background" />
      </div>

      {/* Dots */}
      <div className="absolute inset-0 overflow-hidden">
        {dots.map((dot) => (
          <div
            key={dot.id}
            className="absolute w-1.5 h-1.5 rotate-45 opacity-40"
            style={{
              backgroundColor: "#6767e9",
              left: `${dot.left}%`,
              top: `${dot.top}%`,
              animation: `slow-drift ${dot.duration}s ease-in-out infinite`,
              animationDelay: `${dot.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="grid lg:grid-col-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-8">
            <div className="animate-fade-in">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-primary">
                <span className="w-2 h-2 bg-primary rotate-45 animate-pulse" />
                Software Engineer
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in animation-delay-100">
                Turning{" "}
                <span className="text-primary glow-text">complex ideas</span>
                <br />
                into{" "}
                <span className="font-serif italic font-normal text-white">
                  reliable
                </span>{" "}
                software.
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg animate-fade-in animation-delay-200">
                I'm Lucas Sproat, a software engineer specializing in .NET,
                cloud computing, and React. I build fast, scalable systems that
                deliver smooth and reliable user experiences.
              </p>
            </div>

            {/* Calls to action */}
            <div className="flex flex-wrap gap-4 animate-fade-in animation-delay-300">
              <Button size="lg">
                Contact Me <ArrowRight className="w-5 h-5" />
              </Button>
              <AnimatedBorderButton />
            </div>

            {/* External Links */}
            <div className="flex items-center gap-4 animate-fade-in animation-delay-400">
              <span className="text-sm text-muted-foreground">Socials: </span>
              {[
                { icon: RiGithubFill, href: "https://github.com/lsproat" },
                {
                  icon: RiLinkedinFill,
                  href: "https://www.linkedin.com/in/lucassproat/",
                },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="p-2 rounded-full glass hover:bg-primary/10 hover:text-primary transition-all duration-300"
                >
                  {<social.icon className="w-5 h-5" />}
                </a>
              ))}
            </div>
          </div>
          {/* Right */}
          <div className="relative animate-fade-in animation-delay-300">
            {/* Photo */}
            <div className="relative max-w-md mx-auto">
              <div
                className="absolute inset-0 rounded-3xl bg-linear-to-br
               from-primary/30 via-transparent to-primary/10 blur-2xl animate-pulse"
              />
              <div className="relative glass rounded-3xl p-2 glow-border">
                <img
                  src="/profile-picture-tmp.JPEG"
                  alt="Lucas Sproat"
                  className="w-full aspect-4/5 object-cover rounded-2xl"
                />

                {/* Badges */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
