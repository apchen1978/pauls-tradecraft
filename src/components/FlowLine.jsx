import { useEffect, useRef } from "react";

// A thin pine → mint → gold line between homepage sections. It draws from left to right
// the first time it scrolls into view. Desktop only (see .flow-line in index.css); decorative.
export default function FlowLine() {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) {
      node?.classList.add("in");
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        node.classList.add("in");
        io.disconnect();
      }
    }, { rootMargin: "0px 0px -15% 0px" });
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="flow-line" aria-hidden="true">
      <span />
    </div>
  );
}
