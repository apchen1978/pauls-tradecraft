import { motion } from "motion/react";
import DecisionWorkflowAnimation from "./DecisionWorkflowAnimation.jsx";

// The human-call sequence used to live at the bottom of a collapsed library
// panel. It now sits in the open path, directly under the hero, so the gold
// "human call" beat is part of the first scroll rather than a disclosure.
export default function DecisionMoment() {
  return (
    <section id="decision-moment" className="relative scroll-mt-24 border-b border-line bg-bone">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12 lg:pb-16 lg:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative overflow-hidden rounded-card border border-amber/25 bg-card px-4 py-5 md:px-8 md:py-8"
        >
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
          <DecisionWorkflowAnimation className="decision-flow--lead" />
        </motion.div>
      </div>
    </section>
  );
}
