import { SectionType } from "@/types";

const REASONING_KEYWORDS = [
  "analogy",
  "series",
  "coding",
  "decoding",
  "brother",
  "sister",
  "mother",
  "father",
  "son",
  "daughter",
  "direction",
  "north",
  "south",
  "east",
  "west",
  "syllogism",
  "odd one out",
  "mirror image",
  "water image",
  "paper folding",
  "cube",
  "dice",
  "venn diagram",
  "pattern",
  "matrix",
  "embedded figure",
];

const GA_KEYWORDS = [
  "constitution",
  "article",
  "amendment",
  "dynasty",
  "emperor",
  "mughal",
  "british",
  "viceroy",
  "governor",
  "river",
  "tributary",
  "capital",
  "national park",
  "wildlife sanctuary",
  "festival",
  "dance",
  "census",
  "who among",
  "discovered",
  "invented",
  "hormone",
  "vitamin",
  "disease",
  "gland",
  "element",
  "chemical",
  "monetary",
  "rbi",
  "president",
  "prime minister",
  "treaty",
  "lok sabha",
  "rajya sabha",
  "fundamental right",
];

const QUANT_KEYWORDS = [
  "percent",
  "percentage",
  "profit",
  "loss",
  "discount",
  "compound interest",
  "simple interest",
  "ratio",
  "proportion",
  "time and work",
  "train",
  "speed",
  "distance",
  "boat",
  "stream",
  "average",
  "fraction",
  "simplification",
  "algebra",
  "equation",
  "hcf",
  "lcm",
  "remainder",
  "divisible",
  "perimeter",
  "area",
  "volume",
  "cylinder",
  "cone",
  "sphere",
];

const ENGLISH_KEYWORDS = [
  "synonym",
  "antonym",
  "correctly spelt",
  "spelt correctly",
  "error spotting",
  "underlined segment",
  "underlined phrase",
  "idiom",
  "phrase",
  "one word substitute",
  "passive voice",
  "active voice",
  "indirect speech",
  "direct speech",
  "cloze test",
  "comprehension",
  "grammatical error",
  "fill in the blank",
  "select the most appropriate",
];

export function classifySectionFallback(
  questionText: string,
  optionsText: string = "",
  currentSection?: SectionType
): SectionType {
  // If already a valid section, verify unless ambiguous
  const validSections: SectionType[] = ["REASONING", "GA", "QUANT", "ENGLISH"];
  if (currentSection && validSections.includes(currentSection)) {
    return currentSection;
  }

  const combined = `${questionText} ${optionsText}`.toLowerCase();

  let reasoningScore = 0;
  let gaScore = 0;
  let quantScore = 0;
  let englishScore = 0;

  for (const kw of REASONING_KEYWORDS) {
    if (combined.includes(kw)) reasoningScore += 2;
  }

  for (const kw of GA_KEYWORDS) {
    if (combined.includes(kw)) gaScore += 2;
  }

  for (const kw of QUANT_KEYWORDS) {
    if (combined.includes(kw)) quantScore += 2;
  }

  for (const kw of ENGLISH_KEYWORDS) {
    if (combined.includes(kw)) englishScore += 2;
  }

  const maxScore = Math.max(reasoningScore, gaScore, quantScore, englishScore);

  if (maxScore === 0) {
    return "GA"; // Safe default
  }

  if (maxScore === reasoningScore) return "REASONING";
  if (maxScore === quantScore) return "QUANT";
  if (maxScore === englishScore) return "ENGLISH";
  return "GA";
}
