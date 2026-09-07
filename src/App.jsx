import { Profile } from "@/sections/Profile";
import { About } from "@/sections/About";
import { Experience } from "@/sections/Experience";
import { Projects } from "@/sections/Projects";
import { ContactMe } from "@/sections/ContactMe";
import { Navbar } from "@/layout/Navbar";
import { Stars } from "./components/Stars";
import { Testimonials } from "./sections/Testimonials";
import { Footer } from "./layout/Footer";

function App() {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <Stars />
        <Profile />
        <About />
        <Experience />
        <Projects />
        <Testimonials />
        <ContactMe />
      </main>
      <Footer />
    </div>
  );
}

export default App;
