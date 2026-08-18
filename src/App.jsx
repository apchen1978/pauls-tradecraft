import { MotionConfig } from "motion/react";
import { LangProvider } from "./i18n.jsx";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import Works from "./components/Works.jsx";
import Capabilities from "./components/Capabilities.jsx";
import HowIWork from "./components/HowIWork.jsx";
import About from "./components/About.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <LangProvider>
      <MotionConfig reducedMotion="user">
        <div className="min-h-[100dvh]">
          <Nav />
          <main>
            <Hero />
            <Works />
            <Capabilities />
            <HowIWork />
            <About />
            <Contact />
          </main>
          <Footer />
        </div>
      </MotionConfig>
    </LangProvider>
  );
}
