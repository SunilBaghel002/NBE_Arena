import { SectionType } from "@/types";

export interface SyllabusTopicDefinition {
  id: string;
  name: string;
  section: SectionType;
  keywords: RegExp[];
  description: string;
}

export interface SyllabusTopicMetric {
  id: string;
  name: string;
  section: SectionType;
  description: string;
  totalTested: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  accuracyPercentage: number;
  status: "STRONG" | "MODERATE" | "NEEDS_WORK" | "UNTESTED";
}

/**
 * Official NBEMS Junior Assistant Examination Syllabus
 * Source: data/syllabus/nbe_junior_assistant_syllabus.png
 */
export const OFFICIAL_SYLLABUS_TOPICS: SyllabusTopicDefinition[] = [
  // ==================== 1. GENERAL INTELLIGENCE & REASONING ====================
  {
    id: "reas_semantic_analogy",
    name: "Semantic Analogy",
    section: "REASONING",
    keywords: [
      /::/i,
      /\b(related word|analogous word|select the related|semantic analogy)\b/i,
      /\b(ocean\s*:\s*water|doctor\s*:\s*hospital|country\s*:\s*capital)\b/i,
    ],
    description: "Word association & semantic relationship analogies",
  },
  {
    id: "reas_symbolic_number_analogy",
    name: "Symbolic & Number Analogy",
    section: "REASONING",
    keywords: [
      /\b\d+\s*:\s*\d+\s*::\s*\d+\s*:\s*\?/i,
      /\b(number analogy|letter-cluster analogy|symbolic analogy)\b/i,
      /[A-Z]{2,4}\s*:\s*[A-Z]{2,4}\s*::/i,
    ],
    description: "Numeric patterns, square/cube relations, and letter shifts",
  },
  {
    id: "reas_classification",
    name: "Odd One Out & Classification",
    section: "REASONING",
    keywords: [
      /\b(odd one out|odd letter group|select the odd|does not belong to the group|classification)\b/i,
      /\b(semantic classification|figural classification)\b/i,
    ],
    description: "Grouping by shared properties and identifying outliers",
  },
  {
    id: "reas_series",
    name: "Number & Alphabet Series",
    section: "REASONING",
    keywords: [
      /\b(series|missing number|next term in the series|semantic series|figural series)\b/i,
      /\b\d+,\s*\d+,\s*\d+,\s*\d+,\s*\?/i,
      /[A-Z]{2,3},\s*[A-Z]{2,3},\s*[A-Z]{2,3}/i,
    ],
    description: "Arithmetic, geometric, alternating, and letter series",
  },
  {
    id: "reas_coding_decoding",
    name: "Coding & Decoding",
    section: "REASONING",
    keywords: [
      /\b(coded as|in a certain code language|code for|decoded as|coding & de-?\s*coding)\b/i,
      /\bwritten as ['"]?\d+['"]?/i,
    ],
    description: "Letter substitution, position values, and alphanumeric ciphers",
  },
  {
    id: "reas_blood_relations",
    name: "Blood Relations",
    section: "REASONING",
    keywords: [
      /\b(how is [a-z]+ related to|sister of|brother of|father of|mother of|husband of|wife of|paternal grandfather|maternal uncle|daughter of|son of)\b/i,
      /‘[A-Z]\s*[@#%&*+\-×÷$]\s*[A-Z]’/i,
    ],
    description: "Family tree structures and coded relationship riddles",
  },
  {
    id: "reas_direction_sense",
    name: "Direction Sense Test",
    section: "REASONING",
    keywords: [
      /\b(walks? \d+\s*km|turns? (?:left|right)|north|south|east|west|in which direction|starting point)\b/i,
      /\b(space orientation|spatial orientation)\b/i,
    ],
    description: "Compass orientation, distance vectors, and turn angles",
  },
  {
    id: "reas_mathematical_operations",
    name: "Mathematical & Symbolic Operations",
    section: "REASONING",
    keywords: [
      /\b(if ['"]?\+['"]? means|interchange two signs|interchange of signs|numerical operations|symbolic operations)\b/i,
      /\b(which of the following equations will be correct)\b/i,
    ],
    description: "BODMAS equation balancing under substituted arithmetic signs",
  },
  {
    id: "reas_syllogisms_venn",
    name: "Syllogisms & Venn Diagrams",
    section: "REASONING",
    keywords: [
      /\b(statements:\s*.*\bconclusions:\s*|some [a-z]+ are|all [a-z]+ are|no [a-z]+ is|venn diagram|drawing inferences|syllogistic reasoning)\b/i,
    ],
    description: "Deductive logic, category overlaps, and premise validation",
  },
  {
    id: "reas_non_verbal",
    name: "Non-Verbal & Visual Reasoning",
    section: "REASONING",
    keywords: [
      /\b(mirror image|water image|paper (?:folding|cutting|unfolding)|punched hole|embedded figure|hidden\/embedded|cube|dice|visual memory)\b/i,
    ],
    description: "Spatial transformations, paper fold patterns, and dice/cubes",
  },
  {
    id: "reas_logical_sequence",
    name: "Word Formation & Logical Order",
    section: "REASONING",
    keywords: [
      /\b(arrange the (?:following )?words|meaningful (?:and logical )?order|dictionary (?:order|sequence)|word building)\b/i,
    ],
    description: "Chronological processes, hierarchy levels, and dictionary sorting",
  },

  // ==================== 2. GENERAL AWARENESS ====================
  {
    id: "ga_polity_constitution",
    name: "Indian Polity & Constitution",
    section: "GA",
    keywords: [
      /\b(constitution|constitutional|amendment|fundamental (?:right|duty)|preamble|article \d+|parliament|lok sabha|rajya sabha)\b/i,
      /\b(president of india|prime minister|chief minister|governor|supreme court|high court|attorney general|election commission)\b/i,
    ],
    description: "Articles, governance bodies, constitutional amendments, and rights",
  },
  {
    id: "ga_history_freedom",
    name: "Indian History & National Movement",
    section: "GA",
    keywords: [
      /\b(dynasty|sultanate|mughal|british rule|viceroy|treaty of|battle of|rebellion|revolt of 1857|swaraj|ashoka|harappa|maurya|gupta|chola|gandhi|congress session|non-cooperation|quit india)\b/i,
    ],
    description: "Ancient civilizations, medieval empires, and Indian freedom struggle",
  },
  {
    id: "ga_geography",
    name: "Indian & Physical Geography",
    section: "GA",
    keywords: [
      /\b(river|tributary|mountain pass|himalayas|western ghats|national park|wildlife sanctuary|soil|monsoon|latitude|longitude|strait|peninsula|island|biosphere reserve)\b/i,
    ],
    description: "River drainage, mountain ranges, climate, agriculture, and states",
  },
  {
    id: "ga_science",
    name: "General Science (Physics, Chem, Bio)",
    section: "GA",
    keywords: [
      /\b(photosynthesis|vitamin|hormone|enzyme|cell|mitochondria|chemical formula|periodic table|newton's law|acid|base|ph scale|disease|bacteria|virus|malaria|tuberculosis|typhoid|optics|reflection|refraction|electric current)\b/i,
    ],
    description: "Everyday scientific phenomena, human physiology, and hygiene",
  },
  {
    id: "ga_economy",
    name: "Indian Economy & Banking",
    section: "GA",
    keywords: [
      /\b(rbi|reserve bank|monetary policy|repo rate|reverse repo|gdp|fiscal deficit|inflation|five-year plan|planning commission|niti aayog|census (?:of )?2011|national income|taxation|gst)\b/i,
    ],
    description: "Macroeconomic indicators, central banking, budget, and Census 2011",
  },
  {
    id: "ga_culture_heritage",
    name: "Art, Culture & Dance Forms",
    section: "GA",
    keywords: [
      /\b(classical dance|folk dance|festival|unesco|temple architecture|monument|dravidian|bharatanatyam|kathakali|kathak|garba|bihu|musical instrument|sangeet natak)\b/i,
    ],
    description: "Folk and classical arts, seasonal festivals, and architectural heritage",
  },
  {
    id: "ga_current_schemes",
    name: "Current Affairs & Government Schemes",
    section: "GA",
    keywords: [
      /\b(yojana|pradhan mantri|ministry of|government scheme|summit|g20|cop\d+|olympics|world cup|padma|bharat ratna|nobel prize|isro|chandrayaan)\b/i,
    ],
    description: "National initiatives, welfare programs, global summits, and awards",
  },

  // ==================== 3. QUANTITATIVE APTITUDE ====================
  {
    id: "quant_number_systems",
    name: "Number Systems & Simplification",
    section: "QUANT",
    keywords: [
      /\b(divisible by|remainder when|unit digit|hcf|lcm|simplify|evaluate|bodmas|fraction|decimal|square root|surds|indices)\b/i,
    ],
    description: "Divisibility rules, whole numbers, prime factors, and BODMAS",
  },
  {
    id: "quant_percentage",
    name: "Percentages & Proportions",
    section: "QUANT",
    keywords: [
      /\b(percentage|percent of|percentage increase|percentage decrease|income of [a-z]+ is \d+% more)\b/i,
      /%/,
    ],
    description: "Percentage shifts, population changes, and ratio conversions",
  },
  {
    id: "quant_profit_loss",
    name: "Profit, Loss & Discount",
    section: "QUANT",
    keywords: [
      /\b(cost price|selling price|profit percentage|loss percentage|marked price|discount of|single discount equivalent)\b/i,
      /\b(cp|sp|mp)\b/i,
    ],
    description: "Markup calculation, gross profit, margin, and successive discount",
  },
  {
    id: "quant_ratio_averages",
    name: "Ratio, Proportion & Averages",
    section: "QUANT",
    keywords: [
      /\b(ratio is \d+\s*:\s*\d+|a\s*:\s*b|ratio of (?:the )?(?:salaries|ages|investments)|average of \d+|average weight|average score|average age)\b/i,
      /\b(partnership business|present age of)\b/i,
    ],
    description: "Proportional division, partnership shares, and mean values",
  },
  {
    id: "quant_interest",
    name: "Simple & Compound Interest",
    section: "QUANT",
    keywords: [
      /\b(simple interest|compound interest|sum of money amounts to|compounded annually|compounded half-yearly|rate of interest per annum)\b/i,
      /\b(si|ci)\b/i,
    ],
    description: "Capital growth, annual percentage yield, and SI-CI variance",
  },
  {
    id: "quant_time_work",
    name: "Time & Work, Pipes & Cisterns",
    section: "QUANT",
    keywords: [
      /\b(time and work|can complete a work in \d+ days|alone can do|together they can|pipes? [ab] can fill|emptied by a leak)\b/i,
    ],
    description: "Man-hour efficiency, fractional job completion, and tank flow rates",
  },
  {
    id: "quant_speed_distance",
    name: "Time, Speed & Distance (Trains & Boats)",
    section: "QUANT",
    keywords: [
      /\b(speed of (?:the )?(?:train|car|boat)|km\/h|km\/hr|m\/s|upstream and downstream|cross a pole|cross a platform|relative speed)\b/i,
    ],
    description: "Velocity conversions, relative motion, train passing, and stream currents",
  },
  {
    id: "quant_algebra",
    name: "School Algebra & Basic Identities",
    section: "QUANT",
    keywords: [
      /\b(basic algebraic identities|x\s*\+\s*1\/x|x\^2|value of x|linear equation|quadratic)\b/i,
      /\b(find the value of\s*[a-z]\s*\+)/i,
    ],
    description: "Algebraic expansions, factorisation, and single-variable equations",
  },
  {
    id: "quant_mensuration",
    name: "Mensuration & Geometry",
    section: "QUANT",
    keywords: [
      /\b(surface area|volume of|cuboid|cylinder|cylindrical|cone|sphere|hemisphere|perimeter of|area of a triangle|circle|radius|diameter)\b/i,
      /\b(?:cm²|m²|m³|cm³)\b/i,
    ],
    description: "Geometric dimensions, boundary perimeters, surface area, and volumes",
  },

  // ==================== 4. ENGLISH COMPREHENSION ====================
  {
    id: "eng_comprehension_cloze",
    name: "Reading Comprehension & Cloze Test",
    section: "ENGLISH",
    keywords: [
      /\b(comprehension passage|read the passage carefully|cloze test|fill in each blank|passage given below)\b/i,
    ],
    description: "Contextual paragraph inference, main theme, and cloze vocabulary",
  },
  {
    id: "eng_error_spotting",
    name: "Spotting Errors & Sentence Correction",
    section: "ENGLISH",
    keywords: [
      /\b(grammatical error|contains an error|segment that contains|underlined segment|improve the underlined|no improvement required)\b/i,
    ],
    description: "Subject-verb concord, tense agreements, and preposition accuracy",
  },
  {
    id: "eng_vocabulary",
    name: "Synonyms, Antonyms & One-Word",
    section: "ENGLISH",
    keywords: [
      /\b(synonym of the given word|most appropriate synonym|antonym of the given word|most appropriate antonym|one word substitute|substitute for the given group)\b/i,
    ],
    description: "Lexical definitions, opposite connotations, and specialized terms",
  },
  {
    id: "eng_idioms_phrases",
    name: "Idioms & Phrasal Verbs",
    section: "ENGLISH",
    keywords: [
      /\b(meaning of the (?:given )?idiom|appropriate idiom|idiom\/phrase|phrasal verb)\b/i,
    ],
    description: "Colloquial expressions, figurative idioms, and particle verbs",
  },
  {
    id: "eng_grammar_voice",
    name: "Voice & Speech (Active/Passive & Direct/Indirect)",
    section: "ENGLISH",
    keywords: [
      /\b(passive voice|active voice|direct speech|indirect speech|reported speech|select the option that expresses)\b/i,
    ],
    description: "Transitive voice flips, reporting clause backshifts, and pronouns",
  },
  {
    id: "eng_spelling",
    name: "Spelling Errors & Homophones",
    section: "ENGLISH",
    keywords: [
      /\b(correctly spelt|incorrectly spelt|misspelt|spelling error|appropriate homophone)\b/i,
    ],
    description: "Orthographic precision, double-letter spellings, and homophone choice",
  },
];

/**
 * Classifies a question into an official NBEMS Syllabus Topic.
 */
export function classifyQuestionToSyllabus(
  questionText: string,
  optionsText: string = "",
  section: SectionType
): SyllabusTopicDefinition {
  const combined = `${questionText} ${optionsText}`.toLowerCase();

  // Filter candidate topics by the question's section
  const sectionTopics = OFFICIAL_SYLLABUS_TOPICS.filter(
    (t) => t.section === section
  );

  // Check matching regex keywords
  for (const topic of sectionTopics) {
    for (const kw of topic.keywords) {
      if (kw.test(combined)) {
        return topic;
      }
    }
  }

  // Fallback to primary section anchor topic
  if (section === "REASONING") return sectionTopics[0]; // Semantic Analogy
  if (section === "GA") return sectionTopics[0]; // Polity & Constitution
  if (section === "QUANT") return sectionTopics[0]; // Number Systems
  return sectionTopics[0]; // Comprehension
}
