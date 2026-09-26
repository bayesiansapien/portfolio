import { stitch } from './stitch';

// Splits text into words that each stitch into place on their own.
export default function Stitched({ text, from, revealed, extra = 0 }) {
  // Collapse any run of whitespace so feed text with stray spaces or line
  // breaks can't produce empty pieces.
  return String(text ?? '').split(/\s+/).filter(Boolean).map((word, k) => (
    <span key={k}>
      <span className="inline-block" style={stitch(from + k, revealed, extra)}>{word}</span>{' '}
    </span>
  ));
}
