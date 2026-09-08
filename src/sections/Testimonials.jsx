import { ArrowUpRight, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState } from "react";
import { AnimatedBorderButton } from "../components/AnimatedBorderButton";

const testimonials = [
  {
    quote:
      "Lucas brings a thoughtful, disciplined approach to engineering and can be trusted to execute effectively with minimal oversight. His combination of ownership, consistency, and receptiveness to feedback makes him a valuable asset to any team.",
    author: "Cynthia Garris",
    role: "Product Manager - Prev. Hexaware Technologies",
    profilePicture: "/testimonial-pics/cynthia-garris.jpg",
  },
  {
    quote:
      "Lucas consistently showed up with a “can-do” attitude and followed through with strong results, even when stepping into unfamiliar and challenging territory. He takes real ownership of what he works on and holds himself to a high standard.",
    author: "Austin Howard",
    role: "Software Developer - Prev. Hexaware Technologies",
    profilePicture: "/testimonial-pics/austin-howard.jpg",
  },
  {
    quote:
      "Beyond his technical skills, what really sets Lucas apart is his willingness to help others succeed. He’s always open to lending a hand, sharing context, or jumping in to unblock a teammate, regardless of whether it’s officially 'his' responsibility.",
    author: "Alexandra Hawks",
    role: "Scrum Master  - Prev. Hexaware Technologies",
    profilePicture: "/testimonial-pics/alexandra-hawks.jpg",
  },
];

export const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const next = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const previous = () => {
    setActiveIndex(
      (prevIndex) =>
        (prevIndex - 1 + testimonials.length) % testimonials.length,
    );
  };

  return (
    <section id="testimonials" className="py-10 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mx-auto max-w-3xl mb-16">
          <span className="text-secondary-foreground text-sm font-medium tracking-wider uppercase animate-fade-in">
            What Co-Workers Say
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 animate-fade-in animation-delay-100 text-secondary-foreground">
            Thoughtful words from
            <span className="font-serif italic font-normal text-white">
              {" "}
              great teammates.
            </span>
          </h2>
        </div>

        {/* Quotes */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="glass p-8 rounded-3xl md:p-12 glow-border animate-fade-in animation-delay-200">
              <div className="absolute -top-4 left-8 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Quote className="w-6 h-6 text-primary-foreground" />
              </div>

              {/* Hidden slides still size the shared grid cell at every width. */}
              <div className="grid">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.author}
                    aria-hidden={index !== activeIndex}
                    className={`col-start-1 row-start-1 min-w-0 flex flex-col ${index === activeIndex ? "visible" : "invisible"}`}
                  >
                    <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-8 pt-4 flex-1">
                      "{testimonial.quote}"
                    </blockquote>

                    <div className="flex items-center gap-4">
                      <img
                        src={testimonial.profilePicture}
                        alt={testimonial.author}
                        className="w-14 h-14 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
                      />

                      <div className="min-w-0">
                        <div className="font-semibold">
                          {testimonial.author}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nav */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={previous}
                className="p-3 rounded-full glass hover:bg-primary/10 hover:text-primary transition-all"
              >
                <ChevronLeft />
              </button>

              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex ? "w-8 bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="p-3 rounded-full glass hover:bg-primary/10 hover:text-primary transition-all"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
        <div className="text-center mt-8 animate-fade-in animation-delay-300">
          <AnimatedBorderButton
            href="https://www.linkedin.com/in/lucassproat/details/recommendations/?detailScreenTabIndex=0"
            target="_blank"
          >
            View All On LinkedIn
            <ArrowUpRight className="w-5 h-5" />
          </AnimatedBorderButton>
        </div>
      </div>
    </section>
  );
};
