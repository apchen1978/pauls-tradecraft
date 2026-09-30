import { useEffect } from "react";
import DecisionMoment from "./components/DecisionMoment.jsx";
import ThreeQuestions from "./components/ThreeQuestions.jsx";
import OneDeal from "./components/OneDeal.jsx";
import HumanAiEditorial from "./components/HumanAiEditorial.jsx";
import { WorksFlagship, default as Works } from "./components/Works.jsx";
import DealReadiness from "./components/DealReadiness.jsx";
import Garage from "./components/Garage.jsx";
import Capabilities from "./components/Capabilities.jsx";
import Library from "./components/Library.jsx";
import About from "./components/About.jsx";
import Contact from "./components/Contact.jsx";

// Everything below the hero, split into its own chunk so the first paint does
// not wait on it. onReady fires once these sections are in the DOM, which is
// when a #hash link can find its target.
export default function BelowFold({ onReady }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return (
    <>
      <DecisionMoment />
      <ThreeQuestions />
      <OneDeal />
      <WorksFlagship />
      <HumanAiEditorial />
      <Works />
      <Garage />
      <Capabilities />
      <DealReadiness />
      <Library />
      <About />
      <Contact />
    </>
  );
}
