import { Profile } from "@/sections/Profile";
import { About } from "@/sections/About";
import { Experience } from "@/sections/Experience";
import { Projects } from "@/sections/Projects";
import { ContactMe } from "@/sections/ContactMe";
import { Navbar } from "@/layout/Navbar";

function App() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <Profile />
        <About />
        <Experience />
        <Projects />
        <ContactMe />
      </main>
    </div>
  );
}

export default App;
