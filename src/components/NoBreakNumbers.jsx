// Keeps a number, a range or a percentage on one line. WebKit may break after the
// comma in "17,000" or after the dash in "3,000–5,000" when CJK text sits next to it.
// Text without digits comes back unchanged, so it is safe to wrap any copy.
const NUMBER = /(\d+(?:[,.]\d+)*(?:[–-]\d+(?:[,.]\d+)*)?%?)/;

export default function NoBreakNumbers({ text }) {
  if (typeof text !== "string" || !/\d/.test(text)) return text ?? null;
  return text.split(NUMBER).map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className="whitespace-nowrap" data-nobreak>{part}</span>
    ) : (
      part
    ),
  );
}
