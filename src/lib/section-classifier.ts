import { SectionType } from "@/types";

export function classifySectionFallback(
  questionText: string,
  optionsText: string = "",
  currentSection?: SectionType
): SectionType {
  const text = `${questionText} ${optionsText}`.trim();

  // 1. Definite English markers
  if (
    /\b(most appropriate synonym|most appropriate antonym|synonym of the given word|antonym of the given word)\b/i.test(text) ||
    /\b(correctly spelt|incorrectly spelt|misspelt|spelling error)\b/i.test(text) ||
    /\b(meaning of the (?:given )?idiom|appropriate idiom|idiom\/phrase)\b/i.test(text) ||
    /\b(one word substitute|substitute for the given group of words|one word for)\b/i.test(text) ||
    /\b(grammatical error|contains an error|segment that contains a grammatical error|underlined segment|underlined part|improve the underlined)\b/i.test(text) ||
    /\b(passive voice|active voice|direct speech|indirect speech|reported speech)\b/i.test(text) ||
    /\b(cloze test|comprehension passage|fill in each blank|read the passage carefully)\b/i.test(text) ||
    /\b(select the most appropriate option to fill in the blank|appropriate homophone|appropriate pair of words to fill in the blank)\b/i.test(text) ||
    /\b(parts of the following sentence have been given as options)\b/i.test(text)
  ) {
    if (!/::/.test(text) && !/statements:\s*.*\bconclusions:/i.test(text)) {
      return "ENGLISH";
    }
  }

  // 2. Definite Quant markers
  if (
    /\b(surface area|lateral surface area|volume of (?:the )?|cuboid|cylinder|cylindrical|cone|sphere|hemisphere|cubical vessel|cube of edge)\b/i.test(text) ||
    /\b(triangle|hypotenuse|transverse common tangent|tangent to (?:the|these) circle|chord of a circle|diameter of \d+)\b/i.test(text) ||
    /\b(cost price|selling price|loss percentage|profit percentage|marked price|discount of)\b/i.test(text) ||
    /\b(compound interest|simple interest|sum of money amounts to|invested for a period of|rate of interest per annum)\b/i.test(text) ||
    /\b(divisible by (?:both )?\d+|remainder when \d+|unit digit of|hcf and lcm|lcm of)\b/i.test(text) ||
    /\b(ratio of (?:the )?(?:length|area|volume|radius|salary|speeds)|ratio is \d+\s*:\s*\d+|a\s*:\s*b\s*=\s*\d+\s*:\s*\d+)\b/i.test(text) ||
    /\b(speed of (?:the )?(?:train|boat|car|motorcyclist|stream)|upstream and (?:going )?downstream|time taken to cross|average speed of \d+)\b/i.test(text) ||
    /\b(time and work|can complete a work in \d+ days|pipes? a and b can fill|alone can do a piece of work)\b/i.test(text) ||
    /\b(tan [a-z0-9]|sin [a-z0-9]|cos [a-z0-9]|sec [a-z0-9]|cos2a|sin2a|tan2a)\b/i.test(text) ||
    /\b(presently \d+ times his (?:son|daughter)’s age|father is \d+ years older than)\b/i.test(text) ||
    /\b(simplify the following|evaluate:\s*[\d+\-*/()]+|value of\s*[\d+\-*/()]+)\b/i.test(text) ||
    /\b(?:cm²|m²|m³|cm³|km\/h|km\/hr|m\/s)\b/i.test(text)
  ) {
    return "QUANT";
  }

  // 3. Definite Reasoning markers
  if (
    /\b(how is [a-z]+ related to|daughter of my grandfather|is the sister of|is the brother of|is the father of|is the mother of|is the husband of|is the wife of)\b/i.test(text) ||
    /‘[A-Z]\s*[@#%&*+\-×÷$]\s*[A-Z]’/i.test(text) ||
    /\b(in a certain code language|coded as|if [a-z]+ is coded as|letter-cluster|four letter-clusters have been given)\b/i.test(text) ||
    /\b(statements:\s*.*\bconclusions:\s*|some [a-z]+ are [a-z]+|all [a-z]+ are [a-z]+|no [a-z]+ is [a-z]+)\b/i.test(text) ||
    /\b(select the related (?:word|number|letters?)|related to the third (?:word|number|cluster)|(?:\b[A-Za-z0-9]+)\s*:\s*[A-Za-z0-9]+\s*::\s*[A-Za-z0-9]+\s*:\s*\?)\b/i.test(text) ||
    /\b(missing number in the series|find the next term in the series|number series|3,\s*7,\s*15,\s*31)\b/i.test(text) ||
    /\b(walks? \d+\s*km (?:north|south|east|west)|turns? (?:left|right)|in which direction is (?:he|she) now)\b/i.test(text) ||
    /\b(if '\+' means|interchange two signs|interchange of signs|which of the following equations will be correct)\b/i.test(text) ||
    /\b(mirror image|paper (?:folding|cutting)|unfolded|embedded figure|hidden\/embedded|how many triangles are there in the given figure|opposite to the face|folded into a cube|painted cube|standard dice)\b/i.test(text) ||
    /\b(arrange the (?:following )?words in a (?:meaningful|logical) (?:order|sequence)|meaningful logical sequence)\b/i.test(text) ||
    /\b(select the odd one out|find the odd letter group)\b/i.test(text)
  ) {
    return "REASONING";
  }

  // 4. Definite General Awareness markers
  if (
    /\b(constitution|constitutional|amendment|fundamental (?:right|duty)|preamble|article \d+|parliament|lok sabha|rajya sabha)\b/i.test(text) ||
    /\b(president of india|prime minister|chief minister|governor|union minister|supreme court|high court|attorney general)\b/i.test(text) ||
    /\b(dynasty|sultanate|mughal|british rule|viceroy|treaty of|battle of|rebellion|revolt|anand math|bankim chandra|swaraj|vedas|ashoka|harappa|maurya|gupta|chola)\b/i.test(text) ||
    /\b(temple|monument|unesco|dravidian architecture|classical dance|folk dance|festival|tributary|river|mountain pass|national park|wildlife sanctuary)\b/i.test(text) ||
    /\b(photosynthesis|vitamin|hormone|enzyme|cell organelle|mitochondria|chemical formula|periodic table|newton's law|acid|base|ph scale)\b/i.test(text) ||
    /\b(disease|food-borne|pathogen|bacteria|virus|infection|deficiency|malaria|tuberculosis|typhoid)\b/i.test(text) ||
    /\b(olympics|world cup|asian games|commonwealth|badminton|boxing|cricket|trophy|padma|bharat ratna|nobel prize|lovlina borgohain|sangeet natak akademi|akademi award)\b/i.test(text) ||
    /\b(rbi|monetary policy|repo rate|gdp|five-year plan|planning commission|niti aayog|census (?:of )?2011|fiscal deficit|inflation|east india company)\b/i.test(text) ||
    /\b(ministry of|government of india|scheme|yojana|who among the following was the|in which state is|father of the nation)\b/i.test(text)
  ) {
    if (!/bar graph|pie chart|study the given (?:bar|pie|table|chart)/i.test(text)) {
      return "GA";
    }
  }

  const validSections: SectionType[] = ["REASONING", "GA", "QUANT", "ENGLISH"];
  if (currentSection && validSections.includes(currentSection)) {
    return currentSection;
  }

  return "GA";
}
