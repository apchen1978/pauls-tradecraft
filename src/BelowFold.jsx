import { useEffect } from "react";
import TryIt from "./components/TryIt.jsx";
import DecisionMoment from "./components/DecisionMoment.jsx";
import ThreeQuestions from "./components/ThreeQuestions.jsx";
import OneDeal from "./components/OneDeal.jsx";
import HumanAiEditorial from "./components/HumanAiEditorial.jsx";
import { WorksFlagship, default as Works } from "./components/Works.jsx";
import DealReadiness from "./components/DealReadiness.jsx";
import SemanticaCaseStudy from "./components/SemanticaCaseStudy.jsx";
import Showcase from "./components/Showcase.jsx";
import AiLabEntry from "./components/AiLabEntry.jsx";
import FlowLine from "./components/FlowLine.jsx";
import Garage from "./components/Garage.jsx";
import Capabilities from "./components/Capabilities.jsx";
import CommercialOutcomes from "./components/CommercialOutcomes.jsx";
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
      <TryIt />
      <DecisionMoment />
      <ThreeQuestions />
      {/* Business line first (Paul 2026-10-16): the questions lead straight into one deal, the flagship and the works;
          the playful works and the AI Lab follow once the business story is complete. Nothing removed or folded. */}
      <OneDeal />
      <FlowLine />
      <WorksFlagship />
      <HumanAiEditorial />
      <Works />
      <SemanticaCaseStudy />
      <FlowLine />
      <Showcase />
      <AiLabEntry />
      <FlowLine />
      <Garage />
      <FlowLine />
      <Capabilities />
      <DealReadiness />
      <CommercialOutcomes />
      <Library />
      <FlowLine />
      <About />
      <Contact />
    </>
  );
}
