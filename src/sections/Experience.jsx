import { Astroid } from "lucide-react";
import { useTimelineProgress } from "../hooks/useTimelineProgress";

const experiences = [
  {
    period: "Jan 2026 — May 2026",
    role: "Software Engineer",
    company: "Hexaware Technologies",
    description:
      "Helped migrate a microservices platform to a new Azure tenant, standardizing environments, deployment configurations, and CI/CD pipelines. Supported cloud modernization efforts that improved release reliability, scalability, performance, and resource efficiency.",
    technologies: ["C#", "ASP.NET Core", "Microsoft Azure", "CI/CD"],
    current: true,
  },
  {
    period: "Mar 2023 — Jan 2026",
    role: "Software Engineer",
    company: "Figo Pet Insurance",
    description:
      "Helped transition a legacy API to an Azure-based microservices architecture supporting thousands of daily users. Improved application performance by more than 50%, reducing latency by hundreds of milliseconds while increasing scalability and reducing service coupling.",
    technologies: ["C#", ".NET", "Microservices", "Redis"],
    current: false,
  },
  {
    period: "Feb 2022 — Mar 2023",
    role: "Junior Software Engineer",
    company: "Figo Pet Insurance",
    description:
      "Built full-stack features for an internal C#/.NET and React application used to manage customer, pet, and policy data. Improved customer-data synchronization and asynchronous processing using Azure Service Bus and Azure Functions.",
    technologies: ["C#", ".NET", "React", "Azure Functions"],
    current: false,
  },
  {
    period: "Jun 2021 — Aug 2021",
    role: "Data Science Intern",
    company: "XSELL Technologies",
    description:
      "Independently scoped and delivered a Python data-processing project that transformed structured CSV data into directed graph visualizations, helping model customer relationships and business workflows.",
    technologies: [
      "Python",
      "Data Processing",
      "Data Visualization",
      "Graph Modeling",
    ],
    current: false,
  },
  {
    period: "Jun 2019 — Aug 2019",
    role: "Software Engineer Intern",
    company: "ArkusNexus",
    description:
      "Diagnosed and resolved bugs across web and mobile applications while implementing changes based on user stories and QA feedback. Collaborated with engineers, QA, and product stakeholders in an Agile development environment.",
    technologies: ["React", "C#", "Jira", "Debugging"],
    current: false,
  },
];
export const Experience = () => {
  const { timelineRef, lightRef, cardRefs, activeIndex } =
    useTimelineProgress();
  return (
    <section id="experience" className="py-10 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3x1 mb-16">
          <span className="text-secondary-foreground text-sm font-medium tacking-wider uppercase">
            Career Journey
          </span>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight animate-fade-in animation-delay-100 text-secondary-foreground">
            Experience that{" "}
            <span className="font-serif italic font-normal text-white">
              {" "}
              speaks volumes.
            </span>
          </h2>
          <p className="text-muted-foreground animate-fade-in animation-delay-200">
            A visualization of my career and information of each major step.
            From intern, to junior, to full software developer.
          </p>
        </div>

        <div className="relative">
          <div
            ref={timelineRef}
            className="timeline-glow absolute z-20 left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-linear-to-b from-primary/70 via-primary/30 to to-transparent md:-translate-x-1/2 shadow-[o_0_25px_rgba(121,97,239,0.8)]"
          >
            <span
              ref={lightRef}
              className="absolute top-0 left-1/2 size-5 pointer-events-none text-primary"
              style={{ visibility: "hidden" }}
              aria-hidden="true"
            >
              <Astroid
                fill="currentColor"
                className="absolute inset-0 size-full"
              />
              <Astroid
                fill="currentColor"
                className="absolute inset-0 size-full origin-center motion-safe:animate-ping"
              />
            </span>
          </div>

          <div className="space-y-12">
            {experiences.map((experience, index) => (
              <div
                key={index}
                className="relative grid md:grid-cols-2 gap-8 animate-fade-in"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                {/* Dots */}
                <div
                  className="absolute left-px md:left-1/2 top-0 w-2 h-2 bg-primary rounded-full -translate-x-1/2 ring-4 ring-background z-10"
                  aria-hidden="true"
                />

                {/* Experience card content */}
                <div
                  className={`pl-8 md:pl-0 ${index % 2 === 0 ? "md:pr-16 md:text-right" : "md:col-start-2 md:pl-16"}`}
                >
                  <div
                    ref={(element) => {
                      cardRefs.current[index] = element;
                    }}
                    className={`glass p-6 rounded-2xl border ${activeIndex === index ? "border-primary glow-border" : "border-primary/30"} transition-colors duration-500`}
                  >
                    <span className="text-sm text-primary font-medium">
                      {experience.period}
                    </span>
                    <h3 className="text-xl font-semibold mt-2">
                      {experience.role}
                    </h3>
                    <p className="text-muted-foreground">
                      {experience.company}
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                      {experience.description}
                    </p>
                    <div
                      className={`flex flex-wrap gap-2 mt-4 ${index % 2 === 0 ? "md:justify-end" : ""}`}
                    >
                      {experience.technologies.map((technology, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-3 py-1 bg-surface text-xs rounded-full text-muted-foreground"
                        >
                          {technology}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
