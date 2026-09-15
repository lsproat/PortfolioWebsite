import { AlertCircle, CheckCircle, Mail, MapPin, Send } from "lucide-react";
import { Button } from "@/components/Button";
import { useRef, useState } from "react";
import { Turnstile } from "@/components/Turnstile";

const contactInfo = [
  {
    icon: Mail,
    label: "Message",
    value: "Contact me using the form or on LinkedIn",
    href: "",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Chicago, IL",
    href: "#",
  },
];

export const ContactMe = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    website: "",
  });
  const submitting = useRef(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    type: null, // 'success' or 'error
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting.current) return;
    if (!formData.name.trim() || formData.message.trim().length < 10) {
      setSubmitStatus({ type: "error", message: "Enter your name and a message of at least 10 characters." });
      return;
    }
    if (!turnstileToken) {
      setSubmitStatus({ type: "error", message: "Please complete verification before sending." });
      return;
    }
    submitting.current = true;
    setIsLoading(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, turnstileToken }),
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok || (await response.json()).ok !== true) throw new Error();

      setSubmitStatus({
        type: "success",
        message: "Message sent successfully!",
      });
      setFormData({ name: "", email: "", message: "", website: "" });
    } catch {
      setSubmitStatus({
        type: "error",
        message:
          "We couldn't confirm your message was sent. Please complete verification and try again.",
      });
    } finally {
      setIsLoading(false);
      submitting.current = false;
      setTurnstileToken("");
      setResetKey((value) => value + 1);
    }
  };
  return (
    <section id="contact" className="py-10 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mx-auto max-w-3xl mb-16">
          <span className="text-secondary-foreground text-sm font-medium tracking-wider uppercase animate-fade-in">
            Contact Me
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 animate-fade-in animation-delay-100 text-secondary-foreground">
            Send a message,
            <span className="font-serif italic font-normal text-white">
              {" "}
              and let's talk!
            </span>
          </h2>
          <p className="text-muted-foreground animate-fade-in animation-delay-200">
            I am happy to connect with anyone who wants to talk about projects,
            opportunities, or anything else software related. Send me a message
            here or connect with me on LinkedIn and we can talk there too.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="glass p-8 rounded-3xl border border-primary/30 animate-fade-in animation-delay-300">
            <form className="space-y-6" onSubmit={handleSubmit} aria-busy={isLoading}>
              <div hidden aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
              </div>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  maxLength={100}
                  disabled={isLoading}
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your name..."
                  className="w-full px-4 py-3 bg-surface rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  autoComplete="email"
                  maxLength={254}
                  disabled={isLoading}
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 bg-surface rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  minLength={10}
                  maxLength={5000}
                  disabled={isLoading}
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Your message..."
                  className="w-full px-4 py-3 bg-surface rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>

              <Turnstile onToken={setTurnstileToken} resetKey={resetKey} />
              {!turnstileToken && !isLoading && (
                <p role="status" className="text-sm text-muted-foreground">Waiting for verification before sending.</p>
              )}
              <Button
                className="w-full disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                size="lg"
                disabled={isLoading || !turnstileToken}
              >
                {isLoading ? (
                  <>Sending</>
                ) : (
                  <>
                    Send message
                    <Send className="w-5 h-5" />
                  </>
                )}
              </Button>

              {submitStatus.type && (
                <div
                  role={submitStatus.type === "error" ? "alert" : "status"}
                  className={`flex items-center gap-3
                     p-4 rounded-xl ${
                       submitStatus.type === "success"
                         ? "bg-green-500/10 border border-green-500/20 text-green-400"
                         : "bg-red-500/10 border border-red-500/20 text-red-400"
                     }`}
                >
                  {submitStatus.type === "success" ? (
                    <CheckCircle className="w-5 h-5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0" />
                  )}
                  <p className="text-sm">{submitStatus.message}</p>
                </div>
              )}
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-13 animate-fade-in animation-delay-400">
            <div className="glass rounded-3xl p-8">
              <h3 className="text-xl font-semibold mb-6">
                Contact Information
              </h3>
              <div className="space-y-4">
                {contactInfo.map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {item.label}
                      </div>
                      <div className="font-medium">{item.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Availability Card */}
            <div className="glass rounded-3xl p-8 border border-primary/30">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">Currently Available</span>
              </div>
              <p className="text-muted-foreground text-sm">
                I'm currently open to new opportunities and exciting projects.
                Whether you need a full-time engineer or a freelance consultant,
                let's talk!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
