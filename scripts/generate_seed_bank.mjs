import fs from "fs";
import path from "path";

// Generate 50 high quality questions per section for NBE Junior Assistant Exam
const reasoningQuestions = [
  {
    q: "Select the related word from the given alternatives: Ocean : Water :: Glacier : ?",
    a: "Refrigerator", b: "Ice", c: "Mountain", d: "Cave",
    ans: "b",
    exp: "An ocean consists of water; similarly, a glacier consists of ice."
  },
  {
    q: "In a certain code language, 'ROSE' is written as '6821' and 'CHAIR' is written as '73456'. How is 'SEARCH' written in that code?",
    a: "214673", b: "214573", c: "214637", d: "214763",
    ans: "a",
    exp: "Direct letter-to-digit substitution: S=2, E=1, A=4, R=6, C=7, H=3 => 214673."
  },
  {
    q: "Select the odd one out from the given alternatives.",
    a: "Copper", b: "Iron", c: "Brass", d: "Zinc",
    ans: "c",
    exp: "Brass is an alloy (copper + zinc), whereas Copper, Iron, and Zinc are pure elemental metals."
  },
  {
    q: "Pointing to a photograph, a man said, 'She is the daughter of my grandfather's only son.' How is the woman related to the man?",
    a: "Mother", b: "Sister", c: "Aunt", d: "Daughter",
    ans: "b",
    exp: "Grandfather's only son is the man's father. The daughter of the man's father is his sister."
  },
  {
    q: "If '+' means '×', '–' means '÷', '×' means '–', and '÷' means '+', then evaluate: 16 ÷ 4 × 8 + 2 – 4 = ?",
    a: "16", b: "20", c: "12", d: "14",
    ans: "a",
    exp: "Substituting symbols: 16 + 4 - (8 × 2 ÷ 4) = 16 + 4 - (16 ÷ 4) = 16 + 4 - 4 = 16."
  },
  {
    q: "Find the missing number in the series: 3, 7, 15, 31, 63, ?",
    a: "127", b: "125", c: "120", d: "129",
    ans: "a",
    exp: "Pattern is (n × 2) + 1. So 63 × 2 + 1 = 127."
  },
  {
    q: "A man walks 5 km South, then turns right and walks 3 km. He turns left and walks 5 km. In which direction is he now from his starting point?",
    a: "South-West", b: "South-East", c: "North-West", d: "South",
    ans: "a",
    exp: "Starting at origin (0,0): South 5km -> (0, -5). Turn right (West) 3km -> (-3, -5). Turn left (South) 5km -> (-3, -10). The position is South-West."
  },
  {
    q: "Select the option that is related to the third number in the same way as the second number is related to the first: 12 : 144 :: 15 : ?",
    a: "220", b: "225", c: "230", d: "215",
    ans: "b",
    exp: "12^2 = 144, similarly 15^2 = 225."
  },
  {
    q: "Statements: All cars are vehicles. All vehicles are machines. Conclusions: I. All cars are machines. II. Some machines are cars.",
    a: "Only I follows", b: "Only II follows", c: "Both I and II follow", d: "Neither follows",
    ans: "c",
    exp: "Since all cars are vehicles and all vehicles are machines, all cars are machines. By conversion, some machines are cars. Both follow."
  },
  {
    q: "Arrange the words in a meaningful logical sequence: 1. Letter 2. Word 3. Sentence 4. Paragraph 5. Book",
    a: "1, 2, 3, 4, 5", b: "2, 1, 3, 4, 5", c: "5, 4, 3, 2, 1", d: "1, 3, 2, 4, 5",
    ans: "a",
    exp: "Letters form Words, Words form Sentences, Sentences form Paragraphs, and Paragraphs form a Book."
  },
  {
    q: "Find the odd letter group: ADG, GJM, PSV, KNQ, CFI",
    a: "ADG", b: "GJM", c: "KNQ", d: "All follow same gap (+3)",
    ans: "d",
    exp: "All groups have a uniform +3 letter difference (A+3=D, D+3=G; G+3=J, J+3=M, etc.)."
  },
  {
    q: "In a row of 40 students, Amit is 14th from the left end. What is his position from the right end?",
    a: "26th", b: "27th", c: "28th", d: "25th",
    ans: "b",
    exp: "Position from right = Total - Position from left + 1 = 40 - 14 + 1 = 27th."
  },
  {
    q: "If CLOCK is coded as KCOLC, then WATCH will be coded as:",
    a: "HCTAW", b: "HTACW", c: "HCAWT", d: "HTCAW",
    ans: "a",
    exp: "The letters of the word are written in reverse order: WATCH -> HCTAW."
  },
  {
    q: "Identify the diagram that best represents the relationship among: Doctors, Surgeons, Teachers",
    a: "All surgeons are doctors, teachers are disjoint", b: "Three overlapping circles", c: "Three concentric circles", d: "All disjoint",
    ans: "a",
    exp: "All surgeons are doctors (concentric/subset), while teachers belong to a distinct profession (disjoint)."
  },
  {
    q: "Which number replaces the question mark in the series: 2, 6, 12, 20, 30, ?",
    a: "40", b: "42", c: "44", d: "48",
    ans: "b",
    exp: "Differences are +4, +6, +8, +10, +12. 30 + 12 = 42 (also n^2 + n: 1*2, 2*3, 3*4, 4*5, 5*6, 6*7 = 42)."
  },
  {
    q: "Select the word which cannot be formed using the letters of the word 'ADMINISTRATION'.",
    a: "MIND", b: "RATION", c: "MINISTER", d: "STATION",
    ans: "c",
    exp: "The word 'MINISTER' requires the letter 'E', which is not present in 'ADMINISTRATION'."
  },
  {
    q: "A is the father of B. C is the sister of A. D is the mother of C. How is D related to B?",
    a: "Mother", b: "Grandmother", c: "Aunt", d: "Sister",
    ans: "b",
    exp: "A is father of B. D is mother of A. Therefore, D is the paternal grandmother of B."
  },
  {
    q: "If SOUTH-EAST becomes NORTH, NORTH-EAST becomes WEST, what will WEST become?",
    a: "SOUTH-EAST", b: "NORTH-WEST", c: "SOUTH-WEST", d: "EAST",
    ans: "a",
    exp: "Directions are rotated 135 degrees anti-clockwise. West rotated 135 degrees anti-clockwise becomes South-East."
  },
  {
    q: "Choose the correct alternative: Earth : Planet :: Moon : ?",
    a: "Sun", b: "Satellite", c: "Asteroid", d: "Star",
    ans: "b",
    exp: "Earth is a planet, and Moon is a natural satellite."
  },
  {
    q: "Complete the alphabet series: B, D, G, K, P, ?",
    a: "V", b: "U", c: "W", d: "X",
    ans: "a",
    exp: "Gaps are +2, +3, +4, +5, +6. P (16) + 6 = V (22)."
  },
  {
    q: "Four pairs of numbers are given. Find the odd one: (4, 16), (6, 36), (8, 64), (9, 82)",
    a: "(4, 16)", b: "(6, 36)", c: "(8, 64)", d: "(9, 82)",
    ans: "d",
    exp: "In all other pairs, the second number is the square of the first: 4^2=16, 6^2=36, 8^2=64, whereas 9^2=81 != 82."
  },
  {
    q: "Statements: Some mangoes are sweet. Some apples are sweet. Conclusions: I. Some mangoes are apples. II. No mango is apple.",
    a: "Only I follows", b: "Only II follows", c: "Either I or II follows", d: "Neither follows",
    ans: "c",
    exp: "Conclusion I (Some) and II (No) form a complementary pair for mangoes and apples with undetermined relationship, hence either I or II follows."
  },
  {
    q: "If '+' means subtraction, '-' means multiplication, '÷' means addition, and '×' means division, find value of: 54 × 9 - 3 ÷ 4 + 2",
    a: "20", b: "18", c: "22", d: "24",
    ans: "a",
    exp: "54 ÷ 9 × 3 + 4 - 2 = 6 × 3 + 4 - 2 = 18 + 4 - 2 = 20."
  },
  {
    q: "Five friends A, B, C, D, E are sitting in a row facing North. C is sitting in the middle. A and B are at the ends. D is sitting to the immediate right of A. Who is sitting between B and C?",
    a: "D", b: "E", c: "A", d: "Cannot be determined",
    ans: "b",
    exp: "The order is A, D, C, E, B. Therefore, E is sitting between B and C."
  },
  {
    q: "Find the next term in series: AZ, BY, CX, DW, ?",
    a: "EV", b: "FU", c: "ET", d: "EU",
    ans: "a",
    exp: "First letters increase (A, B, C, D, E), second letters decrease opposite pairs (Z, Y, X, W, V) => EV."
  },
  {
    q: "In a certain code, 'PEN' is written as '16-5-14'. How will 'BOOK' be written?",
    a: "2-15-15-11", b: "2-14-14-11", c: "2-15-15-12", d: "2-16-16-11",
    ans: "a",
    exp: "Direct alphabetical positions: B=2, O=15, O=15, K=11."
  },
  {
    q: "Select the related pair: Book : Author :: Statue : ?",
    a: "Painter", b: "Sculptor", c: "Mason", d: "Carpenter",
    ans: "b",
    exp: "A book is created by an author; a statue is created by a sculptor."
  },
  {
    q: "Find the odd one out: 27, 64, 125, 144, 216",
    a: "27", b: "64", c: "144", d: "216",
    ans: "c",
    exp: "27=3^3, 64=4^3, 125=5^3, 216=6^3 are all cubes, while 144 is 12^2 (not a cube)."
  },
  {
    q: "Suresh is taller than Ramesh who is shorter than Rakesh. Ankit is taller than Suresh but shorter than Rakesh. Who is the shortest?",
    a: "Ramesh", b: "Suresh", c: "Ankit", d: "Rakesh",
    ans: "a",
    exp: "Rakesh > Ankit > Suresh > Ramesh. Ramesh is clearly the shortest."
  },
  {
    q: "If 1st January 2024 was Monday, what day was 1st January 2025?",
    a: "Tuesday", b: "Wednesday", c: "Thursday", d: "Sunday",
    ans: "b",
    exp: "2024 is a leap year (366 days = 52 weeks + 2 odd days). Monday + 2 days = Wednesday."
  },
  {
    q: "Select the word that represents the same group: Carrot, Radish, Potato, ?",
    a: "Apple", b: "Turnip", c: "Banana", d: "Tomato",
    ans: "b",
    exp: "Carrot, Radish, and Turnip are edible root vegetables grown underground."
  },
  {
    q: "Find the missing number in the grid: [4, 9, 2], [3, 5, 7], [8, 1, ?] where row sums are 15.",
    a: "6", b: "5", c: "4", d: "7",
    ans: "a",
    exp: "8 + 1 + ? = 15 => ? = 6 (standard 3x3 magic square)."
  },
  {
    q: "If 'WATER' is written as 'YCVGT', what is the code for 'FIRE'?",
    a: "HKTG", b: "HKTF", c: "GKTH", d: "HLTG",
    ans: "a",
    exp: "Each letter is shifted by +2: F(+2)->H, I(+2)->K, R(+2)->T, E(+2)->G => HKTG."
  },
  {
    q: "A clock shows 4:30. If the minute hand points to East, in which direction will the hour hand point?",
    a: "North-East", b: "South-East", c: "North-West", d: "South-West",
    ans: "a",
    exp: "At 4:30, minute hand normally points South (6). If South is East (90 deg anti-clockwise), then between 4 and 5 (South-East) rotated 90 deg anti-clockwise becomes North-East."
  },
  {
    q: "Statements: All pens are books. Some books are pencils. Conclusions: I. Some pens are pencils. II. Some books are pens.",
    a: "Only I follows", b: "Only II follows", c: "Both follow", d: "Neither follows",
    ans: "b",
    exp: "Since all pens are books, by sub-alternation some books are pens (II follows). No definite link exists between pens and pencils (I does not follow)."
  },
  {
    q: "Which word comes third when arranged in alphabetical order? 1. Radical 2. Radiant 3. Radiation 4. Radiate",
    a: "Radiant", b: "Radiate", c: "Radiation", d: "Radical",
    ans: "b",
    exp: "Alphabetical order: 1. Radiant, 2. Radiation, 3. Radiate (or Radiant, Radiate, Radiation), 4. Radical. 'Radiate' comes 3rd."
  },
  {
    q: "Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?",
    a: "Mother", b: "Sister", c: "Daughter", d: "Aunt",
    ans: "a",
    exp: "The only daughter of the woman's mother is the woman herself. So she is the mother of the man."
  },
  {
    q: "Find the missing term: 1, 8, 27, 64, 125, ?",
    a: "216", b: "343", c: "256", d: "196",
    ans: "a",
    exp: "The series is cubes of natural numbers: 1^3, 2^3, 3^3, 4^3, 5^3, 6^3 = 216."
  },
  {
    q: "If 'GIVE' is coded as '5137' and 'BAT' is coded as '924', how is 'GATE' coded?",
    a: "5247", b: "5241", c: "5427", d: "5274",
    ans: "a",
    exp: "G=5, A=2, T=4, E=7 => 5247."
  },
  {
    q: "Find the odd number pair: (13, 169), (17, 289), (19, 361), (15, 235)",
    a: "(13, 169)", b: "(17, 289)", c: "(19, 361)", d: "(15, 235)",
    ans: "d",
    exp: "15^2 = 225, not 235."
  },
  {
    q: "Select the correct combination of mathematical signs to balance: 8 * 4 * 2 = 16",
    a: "× and ÷", b: "+ and -", c: "÷ and ×", d: "- and +",
    ans: "a",
    exp: "8 × 4 ÷ 2 = 32 ÷ 2 = 16."
  },
  {
    q: "In a class of 30 students, Mahesh ranks 7th from top. What is his rank from the bottom?",
    a: "24th", b: "23rd", c: "25th", d: "22nd",
    ans: "a",
    exp: "30 - 7 + 1 = 24th rank."
  },
  {
    q: "Choose the alternative which closely resembles the mirror image of 'WHITE':",
    a: "ETIHW (mirrored)", b: "WHITE", c: "EHTIW", d: "IHTEW",
    ans: "a",
    exp: "Mirror image reverses letter order and flips individual asymmetrical glyphs."
  },
  {
    q: "Find the next letter in the series: Z, X, V, T, R, ?",
    a: "P", b: "Q", c: "O", d: "N",
    ans: "a",
    exp: "Decreasing by 2 positions: 26, 24, 22, 20, 18, 16 (P)."
  },
  {
    q: "If A = 1, CAT = 24, then DOG = ?",
    a: "26", b: "28", c: "24", d: "30",
    ans: "a",
    exp: "Sum of alphabetical positions: D(4) + O(15) + G(7) = 26."
  },
  {
    q: "Select the related number: 7 : 56 :: 9 : ?",
    a: "90", b: "81", c: "72", d: "99",
    ans: "a",
    exp: "n × (n+1) -> 7 × 8 = 56, so 9 × 10 = 90."
  },
  {
    q: "Statements: All flowers are trees. No tree is fruit. Conclusions: I. No fruit is flower. II. Some trees are flowers.",
    a: "Only I follows", b: "Only II follows", c: "Both I and II follow", d: "Neither follows",
    ans: "c",
    exp: "Since flowers are inside trees and trees do not overlap fruits, no fruit is flower. All flowers are trees implies some trees are flowers. Both follow."
  },
  {
    q: "A person travels 10 km North, turns right and travels 10 km, then turns right again and travels 10 km. How far is he from starting point?",
    a: "10 km", b: "20 km", c: "30 km", d: "0 km",
    ans: "a",
    exp: "The movement creates three sides of a square of side 10 km. Distance from start is 10 km East."
  },
  {
    q: "Find the odd word: Gold, Silver, Diamond, Platinum",
    a: "Gold", b: "Silver", c: "Diamond", d: "Platinum",
    ans: "c",
    exp: "Diamond is a non-metal (allotrope of carbon), while Gold, Silver, and Platinum are precious metals."
  },
  {
    q: "Complete the series: 5, 11, 23, 47, 95, ?",
    a: "191", b: "190", c: "189", d: "192",
    ans: "a",
    exp: "Pattern: × 2 + 1. 95 × 2 + 1 = 191."
  }
];

const gaQuestions = [
  {
    q: "Who is known as the 'Father of the Indian Constitution'?",
    a: "Mahatma Gandhi", b: "Dr. B.R. Ambedkar", c: "Jawaharlal Nehru", d: "Dr. Rajendra Prasad",
    ans: "b",
    exp: "Dr. B.R. Ambedkar was the Chairman of the Drafting Committee of the Constituent Assembly."
  },
  {
    q: "Which Article of the Indian Constitution guarantees the 'Right to Equality'?",
    a: "Articles 14 to 18", b: "Articles 19 to 22", c: "Articles 25 to 28", d: "Articles 29 to 30",
    ans: "a",
    exp: "Articles 14 to 18 of the Indian Constitution provide for the Right to Equality."
  },
  {
    q: "Which is the longest river in India?",
    a: "Godavari", b: "Ganga", c: "Brahmaputra", d: "Yamuna",
    ans: "b",
    exp: "The Ganga is the longest river flowing entirely within India, spanning 2,525 km."
  },
  {
    q: "What is the chemical symbol for Gold?",
    a: "Ag", b: "Au", c: "Fe", d: "Gd",
    ans: "b",
    exp: "The chemical symbol for Gold is 'Au', derived from the Latin word 'Aurum'."
  },
  {
    q: "Who was the first President of Independent India?",
    a: "Dr. S. Radhakrishnan", b: "Dr. Rajendra Prasad", c: "Zakir Husain", d: "V.V. Giri",
    ans: "b",
    exp: "Dr. Rajendra Prasad was the first President of India, serving from 1950 to 1962."
  },
  {
    q: "Which gas is most abundant in the Earth's atmosphere?",
    a: "Oxygen", b: "Nitrogen", c: "Carbon Dioxide", d: "Argon",
    ans: "b",
    exp: "Nitrogen constitutes approximately 78% of the Earth's atmosphere by volume."
  },
  {
    q: "In which year did the Battle of Plassey take place?",
    a: "1757", b: "1764", c: "1857", d: "1761",
    ans: "a",
    exp: "The Battle of Plassey took place on 23 June 1757 between the British East India Company and the Nawab of Bengal."
  },
  {
    q: "Which planet is known as the 'Red Planet'?",
    a: "Venus", b: "Mars", c: "Jupiter", d: "Saturn",
    ans: "b",
    exp: "Mars is known as the Red Planet due to the prevalence of iron oxide on its surface."
  },
  {
    q: "What is the capital of Australia?",
    a: "Sydney", b: "Melbourne", c: "Canberra", d: "Brisbane",
    ans: "c",
    exp: "Canberra is the capital city of Australia."
  },
  {
    q: "Which vitamin is synthesized in the human body upon exposure to sunlight?",
    a: "Vitamin A", b: "Vitamin C", c: "Vitamin D", d: "Vitamin K",
    ans: "c",
    exp: "Vitamin D is synthesized in the skin when exposed to ultraviolet B (UVB) rays from sunlight."
  },
  {
    q: "The fundamental duties were incorporated into the Indian Constitution on the recommendation of which committee?",
    a: "Sarkaria Commission", b: "Swaran Singh Committee", c: "Balwant Rai Mehta Committee", d: "Verma Committee",
    ans: "b",
    exp: "The Swaran Singh Committee recommended Fundamental Duties, added by the 42nd Amendment Act in 1976."
  },
  {
    q: "Which is the highest peak in India?",
    a: "Mount Everest", b: "Kangchenjunga", c: "Nanda Devi", d: "K2 (Mount Godwin-Austen)",
    ans: "b",
    exp: "Kangchenjunga (8,586 m) in Sikkim is the highest peak situated within the undisputed territory of India."
  },
  {
    q: "Which organ in the human body produces Insulin?",
    a: "Liver", b: "Pancreas", c: "Kidney", d: "Thyroid",
    ans: "b",
    exp: "Insulin is produced by the beta cells of the Islets of Langerhans in the Pancreas."
  },
  {
    q: "The National Board of Examinations in Medical Sciences (NBEMS) is an autonomous body under which Union Ministry?",
    a: "Ministry of Education", b: "Ministry of Health and Family Welfare", c: "Ministry of Science and Technology", d: "Ministry of AYUSH",
    ans: "b",
    exp: "NBEMS is an autonomous organization under the Ministry of Health and Family Welfare, Government of India."
  },
  {
    q: "Who founded the Brahmo Samaj in 1828?",
    a: "Swami Vivekananda", b: "Raja Ram Mohan Roy", c: "Dayananda Saraswati", d: "Ishwar Chandra Vidyasagar",
    ans: "b",
    exp: "Raja Ram Mohan Roy founded the Brahmo Sabha (later Brahmo Samaj) in Calcutta in 1828."
  },
  {
    q: "Which Indian state has the longest coastline?",
    a: "Tamil Nadu", b: "Maharashtra", c: "Gujarat", d: "Andhra Pradesh",
    ans: "c",
    exp: "Gujarat has the longest mainland coastline in India, extending approximately 1,600 km."
  },
  {
    q: "What does 'HTTP' stand for in computer networking?",
    a: "HyperText Transfer Protocol", b: "HyperText Transmission Program", c: "Hyper Transfer Text Protocol", d: "High Transfer Text Program",
    ans: "a",
    exp: "HTTP stands for HyperText Transfer Protocol."
  },
  {
    q: "The Reserve Bank of India (RBI) was established in which year?",
    a: "1935", b: "1947", c: "1950", d: "1949",
    ans: "a",
    exp: "The RBI was established on April 1, 1935 under the Reserve Bank of India Act, 1934."
  },
  {
    q: "Which classical dance form originated in the state of Kerala?",
    a: "Bharatanatyam", b: "Kathakali", c: "Kuchipudi", d: "Kathak",
    ans: "b",
    exp: "Kathakali and Mohiniyattam are classical dance traditions from Kerala."
  },
  {
    q: "What is the SI unit of electric current?",
    a: "Volt", b: "Watt", c: "Ampere", d: "Ohm",
    ans: "c",
    exp: "The SI unit of electric current is the Ampere (A)."
  },
  {
    q: "Who authored the famous Sanskrit play 'Abhijnanasakuntalam'?",
    a: "Kalidasa", b: "Bhasa", c: "Harsha", d: "Banabhatta",
    ans: "a",
    exp: "Kalidasa was the ancient Indian poet and playwright who authored Abhijnanasakuntalam."
  },
  {
    q: "Which schedule of the Indian Constitution lists the official recognized languages?",
    a: "7th Schedule", b: "8th Schedule", c: "9th Schedule", d: "10th Schedule",
    ans: "b",
    exp: "The 8th Schedule lists 22 officially recognized languages of India."
  },
  {
    q: "Which layer of the atmosphere contains the Ozone layer?",
    a: "Troposphere", b: "Stratosphere", c: "Mesosphere", d: "Thermosphere",
    ans: "b",
    exp: "The Ozone layer is located in the lower portion of the Stratosphere (approx. 15-35 km above Earth)."
  },
  {
    q: "What is the minimum age required to become the President of India?",
    a: "25 years", b: "30 years", c: "35 years", d: "40 years",
    ans: "c",
    exp: "Article 58 specifies that a candidate must have completed 35 years of age to be eligible for the President of India."
  },
  {
    q: "Who was the Viceroy of India during the Partition of Bengal in 1905?",
    a: "Lord Curzon", b: "Lord Dalhousie", c: "Lord Ripon", d: "Lord Canning",
    ans: "a",
    exp: "Lord Curzon announced the Partition of Bengal in July 1905."
  },
  {
    q: "Which metal is liquid at standard room temperature?",
    a: "Mercury", b: "Lead", c: "Bromine", d: "Tin",
    ans: "a",
    exp: "Mercury is the only elemental metal that is liquid at standard room temperature."
  },
  {
    q: "Kaziranga National Park, famous for the one-horned rhinoceros, is located in which state?",
    a: "West Bengal", b: "Assam", c: "Odisha", d: "Madhya Pradesh",
    ans: "b",
    exp: "Kaziranga National Park is located in Golaghat and Nagaon districts of Assam."
  },
  {
    q: "In the human circulatory system, which blood vessels carry oxygenated blood away from the heart?",
    a: "Veins", b: "Arteries", c: "Capillaries", d: "Venules",
    ans: "b",
    exp: "Arteries carry oxygen-rich blood away from the heart to tissues throughout the body."
  },
  {
    q: "What is the shortcut key to paste copied text in MS Windows applications?",
    a: "Ctrl + C", b: "Ctrl + V", c: "Ctrl + P", d: "Ctrl + X",
    ans: "b",
    exp: "Ctrl + V is the universal keyboard shortcut for pasting content."
  },
  {
    q: "Who was the founder of the Maurya Empire in ancient India?",
    a: "Ashoka", b: "Bindusara", c: "Chandragupta Maurya", d: "Brihadratha",
    ans: "c",
    exp: "Chandragupta Maurya founded the Maurya Empire around 322 BCE with the guidance of Chanakya."
  },
  {
    q: "Which state in India is the largest producer of Tea?",
    a: "Assam", b: "West Bengal", c: "Kerala", d: "Tamil Nadu",
    ans: "a",
    exp: "Assam is the largest tea-producing state in India, accounting for over 50% of the nation's output."
  },
  {
    q: "What is the normal human body temperature in Celsius?",
    a: "35.5 °C", b: "37.0 °C", c: "38.2 °C", d: "36.0 °C",
    ans: "b",
    exp: "The average normal body temperature is universally accepted as 37.0 °C (98.6 °F)."
  },
  {
    q: "Who was the first woman Prime Minister of India?",
    a: "Sarojini Naidu", b: "Indira Gandhi", c: "Pratibha Patil", d: "Sucheta Kripalani",
    ans: "b",
    exp: "Indira Gandhi served as the first and only woman Prime Minister of India."
  },
  {
    q: "Which Indian festival is known as the 'Festival of Lights'?",
    a: "Holi", b: "Diwali", c: "Dussehra", d: "Pongal",
    ans: "b",
    exp: "Diwali (Deepavali) is widely known and celebrated as the Festival of Lights."
  },
  {
    q: "What is the primary constituent of Natural Gas?",
    a: "Methane", b: "Propane", c: "Butane", d: "Ethane",
    ans: "a",
    exp: "Methane (CH4) makes up about 70-90% of natural gas."
  },
  {
    q: "The Tropic of Cancer passes through how many Indian states?",
    a: "6", b: "7", c: "8", d: "9",
    ans: "c",
    exp: "It passes through 8 states: Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram."
  },
  {
    q: "Who was the first Indian to win a Nobel Prize?",
    a: "C.V. Raman", b: "Rabindranath Tagore", c: "Mother Teresa", d: "Amartya Sen",
    ans: "b",
    exp: "Rabindranath Tagore won the Nobel Prize in Literature in 1913 for his poetry collection 'Gitanjali'."
  },
  {
    q: "Which part of the computer is considered its 'Brain'?",
    a: "RAM", b: "Hard Disk", c: "CPU", d: "Motherboard",
    ans: "c",
    exp: "The Central Processing Unit (CPU) executes instructions and controls processing in a computer."
  },
  {
    q: "What is the tenure of a member of the Rajya Sabha in India?",
    a: "4 years", b: "5 years", c: "6 years", d: "Permanent without tenure",
    ans: "c",
    exp: "Rajya Sabha members serve a term of 6 years, with one-third of the members retiring every second year."
  },
  {
    q: "Rickettsia is a disease caused by the deficiency of which vitamin?",
    a: "Vitamin A", b: "Vitamin B1", c: "Vitamin C", d: "Vitamin D",
    ans: "d",
    exp: "Rickets in children and Osteomalacia in adults are caused by Vitamin D deficiency."
  },
  {
    q: "The international boundary line between India and Pakistan is known as what?",
    a: "Radcliffe Line", b: "McMahon Line", c: "Durand Line", d: "49th Parallel",
    ans: "a",
    exp: "The Radcliffe Line was drawn by Sir Cyril Radcliffe as the boundary demarcation between India and Pakistan in 1947."
  },
  {
    q: "Which Sultan of Delhi shifted his capital from Delhi to Daulatabad?",
    a: "Alauddin Khilji", b: "Muhammad bin Tughlaq", c: "Firoz Shah Tughlaq", d: "Iltutmish",
    ans: "b",
    exp: "Muhammad bin Tughlaq ordered the historic transfer of the capital from Delhi to Daulatabad (Devagiri) in 1327."
  },
  {
    q: "What is the speed of light in vacuum?",
    a: "3 × 10^8 m/s", b: "3 × 10^6 m/s", c: "3 × 10^5 km/s", d: "Both A and C",
    ans: "d",
    exp: "Speed of light is approximately 300,000 km/s or 3 × 10^8 m/s."
  },
  {
    q: "Which state is known as the 'Granary of India'?",
    a: "Haryana", b: "Punjab", c: "Uttar Pradesh", d: "Madhya Pradesh",
    ans: "b",
    exp: "Punjab is often referred to as the Granary of India or the Breadbasket of India due to its high wheat productivity."
  },
  {
    q: "Who was the governor-general who abolished Sati in India in 1829?",
    a: "Lord William Bentinck", b: "Lord Cornwallis", c: "Lord Wellesley", d: "Lord Hastings",
    ans: "a",
    exp: "Lord William Bentinck promulgated Regulation XVII in 1829 banning Sati, strongly supported by Raja Ram Mohan Roy."
  },
  {
    q: "What does 'RAM' stand for in computer systems?",
    a: "Read Access Memory", b: "Random Access Memory", c: "Rapid Action Memory", d: "Read Available Memory",
    ans: "b",
    exp: "RAM stands for Random Access Memory, the primary volatile memory of a computer."
  },
  {
    q: "Which Indian state has the highest literacy rate as per Census 2011?",
    a: "Mizoram", b: "Kerala", c: "Goa", d: "Tripura",
    ans: "b",
    exp: "Kerala recorded the highest literacy rate of 94.00% in the 2011 Census."
  },
  {
    q: "The term 'Deuce' is associated with which sport?",
    a: "Cricket", b: "Tennis / Badminton", c: "Football", d: "Hockey",
    ans: "b",
    exp: "The term 'Deuce' is used in Tennis and Badminton when the score is tied at 40-40 or at game point."
  },
  {
    q: "Which gas is used in fire extinguishers?",
    a: "Carbon Dioxide", b: "Oxygen", c: "Hydrogen", d: "Nitrogen",
    ans: "a",
    exp: "Carbon Dioxide (CO2) displaces oxygen and cools the fuel, smothering flames in fire extinguishers."
  },
  {
    q: "Under which Article of the Constitution can Financial Emergency be declared by the President?",
    a: "Article 352", b: "Article 356", c: "Article 360", d: "Article 368",
    ans: "c",
    exp: "Article 360 empowers the President to proclaim Financial Emergency if financial stability of India is threatened."
  }
];

const quantQuestions = [
  {
    q: "If 15 men can complete a piece of work in 20 days, how many days will 25 men take to complete the same work?",
    a: "12 days", b: "10 days", c: "15 days", d: "14 days",
    ans: "a",
    exp: "Total work = 15 × 20 = 300 man-days. Days for 25 men = 300 / 25 = 12 days."
  },
  {
    q: "A shopkeeper sells an article for ₹840 at a gain of 20%. What was the cost price of the article?",
    a: "₹700", b: "₹680", c: "₹720", d: "₹750",
    ans: "a",
    exp: "SP = CP × 1.20 => CP = 840 / 1.20 = ₹700."
  },
  {
    q: "Find the Simple Interest on a principal sum of ₹5,000 at 8% per annum for 3 years.",
    a: "₹1,000", b: "₹1,200", c: "₹1,500", d: "₹800",
    ans: "b",
    exp: "SI = (P × R × T) / 100 = (5000 × 8 × 3) / 100 = ₹1,200."
  },
  {
    q: "The ratio of two numbers is 3 : 5 and their sum is 160. What is the larger number?",
    a: "60", b: "100", c: "90", d: "110",
    ans: "b",
    exp: "Total parts = 3 + 5 = 8. 1 part = 160 / 8 = 20. Larger number = 5 × 20 = 100."
  },
  {
    q: "A train 180 meters long is running at a speed of 54 km/h. How much time will it take to pass an electric pole?",
    a: "10 seconds", b: "12 seconds", c: "15 seconds", d: "18 seconds",
    ans: "b",
    exp: "Speed = 54 × (5/18) = 15 m/s. Time = Distance / Speed = 180 / 15 = 12 seconds."
  },
  {
    q: "What is the average of the first five prime numbers?",
    a: "5.6", b: "5.4", c: "5.8", d: "6.0",
    ans: "a",
    exp: "First 5 primes are 2, 3, 5, 7, 11. Sum = 28. Average = 28 / 5 = 5.6."
  },
  {
    q: "If 20% of a number is 80, what is 35% of that number?",
    a: "140", b: "120", c: "160", d: "150",
    ans: "a",
    exp: "Number = 80 / 0.20 = 400. 35% of 400 = 0.35 × 400 = 140."
  },
  {
    q: "Find the HCF of 36, 54, and 72.",
    a: "12", b: "18", c: "9", d: "6",
    ans: "b",
    exp: "36 = 18×2, 54 = 18×3, 72 = 18×4. Greatest common divisor is 18."
  },
  {
    q: "A person buys a toy for ₹250 and sells it for ₹300. Find the profit percentage.",
    a: "15%", b: "20%", c: "25%", d: "18%",
    ans: "b",
    exp: "Profit = 300 - 250 = ₹50. Profit % = (50 / 250) × 100 = 20%."
  },
  {
    q: "If a : b = 2 : 3 and b : c = 4 : 5, find the compound ratio a : c.",
    a: "8 : 15", b: "6 : 15", c: "2 : 5", d: "3 : 5",
    ans: "a",
    exp: "a/c = (a/b) × (b/c) = (2/3) × (4/5) = 8/15 => 8 : 15."
  },
  {
    q: "The average age of a class of 24 students is 15 years. If the teacher's age is included, the average increases by 1 year. What is the teacher's age?",
    a: "38 years", b: "40 years", c: "42 years", d: "36 years",
    ans: "b",
    exp: "Total age of 24 students = 24 × 15 = 360. Total age with teacher (25 people) = 25 × 16 = 400. Teacher = 400 - 360 = 40 years."
  },
  {
    q: "Find the Compound Interest on ₹10,000 for 2 years at 10% per annum compounded annually.",
    a: "₹2,000", b: "₹2,100", c: "₹2,200", d: "₹1,900",
    ans: "b",
    exp: "Amount = 10000 × (1.10)^2 = 10000 × 1.21 = ₹12,100. CI = 12100 - 10000 = ₹2,100."
  },
  {
    q: "Pipe A can fill a tank in 6 hours and Pipe B can fill it in 8 hours. If both open together, in how many hours will the tank be full?",
    a: "3 hours 24 mins", b: "3 hours 25 mins", c: "3 hours 30 mins", d: "4 hours",
    ans: "a",
    exp: "Rate = 1/6 + 1/8 = 7/24. Time = 24/7 hours = 3 and 3/7 hours = 3 hours 25.7 mins (approx 3h 26m / 24/7h)."
  },
  {
    q: "What single discount is equivalent to two successive discounts of 20% and 10%?",
    a: "30%", b: "28%", c: "25%", d: "26%",
    ans: "b",
    exp: "Equivalent discount = 20 + 10 - (20 × 10)/100 = 30 - 2 = 28%."
  },
  {
    q: "Evaluate: (3/4 + 1/2) ÷ (5/8 - 1/4)",
    a: "3 and 1/3", b: "3 and 1/2", c: "3", d: "2 and 2/3",
    ans: "a",
    exp: "Numerator = 3/4 + 2/4 = 5/4. Denominator = 5/8 - 2/8 = 3/8. (5/4) ÷ (3/8) = (5/4) × (8/3) = 10/3 = 3 1/3."
  },
  {
    q: "If x + 1/x = 4, find the value of x^2 + 1/x^2.",
    a: "16", b: "14", c: "12", d: "18",
    ans: "b",
    exp: "(x + 1/x)^2 = x^2 + 1/x^2 + 2 = 16 => x^2 + 1/x^2 = 16 - 2 = 14."
  },
  {
    q: "A car covers a distance of 300 km at an average speed of 60 km/h. How much faster should it travel to cover the same distance in 4 hours?",
    a: "10 km/h", b: "15 km/h", c: "20 km/h", d: "25 km/h",
    ans: "b",
    exp: "Required speed = 300 / 4 = 75 km/h. Speed increase = 75 - 60 = 15 km/h."
  },
  {
    q: "Find the value of sqrt(176 + sqrt(2401)).",
    a: "14", b: "15", c: "16", d: "17",
    ans: "b",
    exp: "sqrt(2401) = 49. 176 + 49 = 225. sqrt(225) = 15."
  },
  {
    q: "The perimeter of a rectangular field is 120 meters and its length is 35 meters. Find its breadth.",
    a: "20 meters", b: "25 meters", c: "30 meters", d: "15 meters",
    ans: "b",
    exp: "2 × (Length + Breadth) = 120 => 35 + Breadth = 60 => Breadth = 25 meters."
  },
  {
    q: "A sum of ₹1,600 amounts to ₹2,080 in 3 years at Simple Interest. What is the rate of interest per annum?",
    a: "10%", b: "12%", c: "8%", d: "9%",
    ans: "a",
    exp: "SI = 2080 - 1600 = ₹480. R = (480 × 100) / (1600 × 3) = 48000 / 4800 = 10%."
  },
  {
    q: "If 12 pens cost ₹180, what will be the cost of 28 pens?",
    a: "₹400", b: "₹420", c: "₹380", d: "₹450",
    ans: "b",
    exp: "Cost of 1 pen = 180 / 12 = ₹15. Cost of 28 pens = 28 × 15 = ₹420."
  },
  {
    q: "Two numbers are in the ratio 4 : 7. If 5 is added to each number, the ratio becomes 1 : 2. Find the smaller number.",
    a: "20", b: "16", c: "24", d: "12",
    ans: "a",
    exp: "(4x + 5)/(7x + 5) = 1/2 => 8x + 10 = 7x + 5 => x = 5 (in absolute scale). Smaller number = 4 × 5 = 20."
  },
  {
    q: "A boat travels 24 km downstream in 2 hours and 16 km upstream in 2 hours. What is the speed of the current?",
    a: "2 km/h", b: "3 km/h", c: "4 km/h", d: "1.5 km/h",
    ans: "a",
    exp: "Downstream speed (u+v) = 24/2 = 12 km/h. Upstream speed (u-v) = 16/2 = 8 km/h. Current v = (12 - 8)/2 = 2 km/h."
  },
  {
    q: "Find the LCM of 15, 25, and 30.",
    a: "120", b: "150", c: "180", d: "90",
    ans: "b",
    exp: "Prime factors: 15=3*5, 25=5^2, 30=2*3*5. LCM = 2 * 3 * 5^2 = 150."
  },
  {
    q: "If the cost price of 10 articles is equal to the selling price of 8 articles, find the gain percentage.",
    a: "20%", b: "25%", c: "30%", d: "15%",
    ans: "b",
    exp: "Gain % = ((10 - 8) / 8) × 100 = (2 / 8) × 100 = 25%."
  },
  {
    q: "In an election, the winning candidate got 58% of the total valid votes and won by a margin of 1,600 votes. Find the total number of valid votes polled.",
    a: "10,000", b: "12,000", c: "8,000", d: "15,000",
    ans: "a",
    exp: "Margin = 58% - 42% = 16%. 16% of Total = 1600 => Total = 1600 / 0.16 = 10,000 votes."
  },
  {
    q: "Find the mean of the observations: 12, 16, 20, 24, 28, 32, 36.",
    a: "24", b: "26", c: "22", d: "28",
    ans: "a",
    exp: "Since the numbers are in an arithmetic progression with equal gap 4, the mean is the middle term: 24."
  },
  {
    q: "A tap can fill an empty cistern in 8 hours, but due to a leak at the bottom, it takes 10 hours. In how many hours will the leak empty a full cistern?",
    a: "35 hours", b: "40 hours", c: "45 hours", d: "30 hours",
    ans: "b",
    exp: "Leak rate = 1/8 - 1/10 = (5-4)/40 = 1/40. The leak will empty the tank in 40 hours."
  },
  {
    q: "Simplify: (45% of 280) + (16% of 250)",
    a: "166", b: "170", c: "160", d: "174",
    ans: "a",
    exp: "45% of 280 = 126. 16% of 250 = 40. 126 + 40 = 166."
  },
  {
    q: "If a train running at 72 km/h crosses a platform 200 m long in 25 seconds, what is the length of the train?",
    a: "250 meters", b: "300 meters", c: "350 meters", d: "200 meters",
    ans: "b",
    exp: "Speed = 72 × (5/18) = 20 m/s. Total distance in 25s = 20 × 25 = 500 m. Train length = 500 - 200 = 300 meters."
  },
  {
    q: "Find the value of 'a' if 4a - 7 = 2a + 9.",
    a: "8", b: "7", c: "9", d: "6",
    ans: "a",
    exp: "4a - 2a = 9 + 7 => 2a = 16 => a = 8."
  },
  {
    q: "The marked price of a shirt is ₹600. After allowing a discount of 15%, the selling price is:",
    a: "₹510", b: "₹500", c: "₹520", d: "₹490",
    ans: "a",
    exp: "Discount = 15% of 600 = ₹90. SP = 600 - 90 = ₹510."
  },
  {
    q: "The sum of three consecutive integers is 72. Find the largest integer.",
    a: "23", b: "24", c: "25", d: "26",
    ans: "c",
    exp: "Let integers be x-1, x, x+1. 3x = 72 => x = 24. Largest is 24 + 1 = 25."
  },
  {
    q: "What principal will yield ₹600 Simple Interest in 2 years at 6% per annum?",
    a: "₹5,000", b: "₹4,500", c: "₹6,000", d: "₹5,500",
    ans: "a",
    exp: "P = (SI × 100) / (R × T) = (600 × 100) / (6 × 2) = 60000 / 12 = ₹5,000."
  },
  {
    q: "A mixture of 60 liters contains milk and water in the ratio 2 : 1. How many liters of water must be added to make the ratio 1 : 2?",
    a: "40 liters", b: "50 liters", c: "60 liters", d: "45 liters",
    ans: "c",
    exp: "Milk = 40 L, Water = 20 L. Let added water = W. 40 / (20 + W) = 1/2 => 20 + W = 80 => W = 60 liters."
  },
  {
    q: "If 8 men or 12 women can reap a field in 25 days, in how many days can 6 men and 11 women reap it?",
    a: "12 days", b: "15 days", c: "18 days", d: "20 days",
    ans: "b",
    exp: "8 men = 12 women => 1 man = 1.5 women. 6 men + 11 women = (6*1.5) + 11 = 20 women. Time = (12 × 25) / 20 = 15 days."
  },
  {
    q: "What is the square root of 0.000144?",
    a: "0.012", b: "0.12", c: "0.0012", d: "0.00012",
    ans: "a",
    exp: "sqrt(144 / 1000000) = 12 / 1000 = 0.012."
  },
  {
    q: "The ratio of the speeds of two cars is 4 : 5. If the first car takes 30 minutes to cover a distance, how much time will the second car take?",
    a: "24 minutes", b: "25 minutes", c: "20 minutes", d: "22 minutes",
    ans: "a",
    exp: "Time ratio is inverse of speed ratio = 5 : 4. 5 units = 30 min => 1 unit = 6 min. 4 units = 24 minutes."
  },
  {
    q: "Find the total surface area of a cube whose side is 5 cm.",
    a: "150 cm^2", b: "125 cm^2", c: "100 cm^2", d: "175 cm^2",
    ans: "a",
    exp: "Total surface area of a cube = 6a^2 = 6 × (5^2) = 6 × 25 = 150 cm^2."
  },
  {
    q: "A person sells two articles at ₹990 each. On one he gains 10% and on the other he loses 10%. What is his overall gain or loss percentage?",
    a: "1% gain", b: "1% loss", c: "No gain no loss", d: "2% loss",
    ans: "b",
    exp: "When SP is same with x% gain and x% loss, overall result is always a loss of (x^2 / 100)% = (100 / 100)% = 1% loss."
  },
  {
    q: "If 15% of A is equal to 20% of B, find the ratio A : B.",
    a: "4 : 3", b: "3 : 4", c: "5 : 4", d: "4 : 5",
    ans: "a",
    exp: "0.15 A = 0.20 B => A / B = 20 / 15 = 4 / 3 => 4 : 3."
  },
  {
    q: "A person travels from A to B at 40 km/h and returns from B to A at 60 km/h. What is his average speed for the whole journey?",
    a: "48 km/h", b: "50 km/h", c: "45 km/h", d: "52 km/h",
    ans: "a",
    exp: "Average speed = (2 × s1 × s2) / (s1 + s2) = (2 × 40 × 60) / 100 = 4800 / 100 = 48 km/h."
  },
  {
    q: "Find the remainder when 2^21 is divided by 7.",
    a: "1", b: "2", c: "4", d: "6",
    ans: "a",
    exp: "2^3 = 8 = 7(1) + 1 => 2^3 ≡ 1 (mod 7). 2^21 = (2^3)^7 ≡ 1^7 ≡ 1 (mod 7)."
  },
  {
    q: "A man's age is three times the sum of ages of his two children. In 5 years, his age will be double the sum of their ages. Find the father's present age.",
    a: "45 years", b: "40 years", c: "50 years", d: "35 years",
    ans: "a",
    exp: "Let sum of kids' ages = S. Father F = 3S. In 5 years: F + 5 = 2(S + 10) => 3S + 5 = 2S + 20 => S = 15. Father = 3 × 15 = 45 years."
  },
  {
    q: "Find the compound interest on ₹5,000 for 1.5 years at 10% per annum compounded half-yearly.",
    a: "₹788.13", b: "₹762.50", c: "₹800.00", d: "₹750.00",
    ans: "a",
    exp: "Rate per half-year = 5%, periods = 3. Amount = 5000 × (1.05)^3 = 5000 × 1.157625 = ₹5,788.13. CI = ₹788.13."
  },
  {
    q: "If 1/3 of a number is subtracted from the number itself, the result is 48. Find the number.",
    a: "72", b: "64", c: "75", d: "80",
    ans: "a",
    exp: "x - x/3 = 48 => 2x/3 = 48 => x = 48 × 3 / 2 = 72."
  },
  {
    q: "A rectangular park 60 m long and 40 m wide has a 2 m wide running path along its inside border. Find the area of the path.",
    a: "384 m^2", b: "400 m^2", c: "368 m^2", d: "416 m^2",
    ans: "a",
    exp: "Outer area = 60 × 40 = 2400 m^2. Inner dimensions = (60-4) × (40-4) = 56 × 36 = 2016 m^2. Path area = 2400 - 2016 = 384 m^2."
  },
  {
    q: "If x = 2 and y = 3, find the value of (x^3 + y^3) / (x + y).",
    a: "7", b: "8", c: "9", d: "10",
    ans: "a",
    exp: "(2^3 + 3^3) / (2 + 3) = (8 + 27) / 5 = 35 / 5 = 7."
  },
  {
    q: "A sum of ₹2,500 invested at compound interest doubles itself in 5 years. In how many years will it become 8 times of itself?",
    a: "15 years", b: "20 years", c: "12 years", d: "10 years",
    ans: "a",
    exp: "It becomes 2^1 in 5 yrs. It becomes 8 = 2^3 in 3 × 5 = 15 years."
  },
  {
    q: "A vendor buys lemons at 6 for ₹10 and sells them at 4 for ₹8. What is his profit percentage?",
    a: "20%", b: "25%", c: "15%", d: "30%",
    ans: "a",
    exp: "CP of 12 lemons = ₹20. SP of 12 lemons = 3 × 8 = ₹24. Profit % = (4 / 20) × 100 = 20%."
  }
];

const englishQuestions = [
  {
    q: "Select the most appropriate synonym of the given word: 'METICULOUS'",
    a: "Careless", b: "Painstaking", c: "Lazy", d: "Hasty",
    ans: "b",
    exp: "'Meticulous' means showing great attention to detail; very careful and precise, matching 'painstaking'."
  },
  {
    q: "Select the most appropriate antonym of the given word: 'CANDID'",
    a: "Frank", b: "Dishonest / Deceitful", c: "Outspoken", d: "Sincere",
    ans: "b",
    exp: "'Candid' means truthful, straightforward, and frank. Its direct antonym is deceitful or guarded."
  },
  {
    q: "Identify the segment in the sentence which contains a grammatical error: 'Neither the teacher (A) / nor the students (B) / was present in the auditorium (C) / No error (D)'",
    a: "Neither the teacher", b: "nor the students", c: "was present in the auditorium", d: "No error",
    ans: "c",
    exp: "With 'Neither... nor', the verb agrees with the closer subject ('the students', plural), so it must be 'were present', not 'was'."
  },
  {
    q: "Select the correct meaning of the idiom: 'To spill the beans'",
    a: "To cook food", b: "To reveal a secret unintentionally", c: "To waste money", d: "To perform badly",
    ans: "b",
    exp: "'To spill the beans' is an idiom meaning to disclose confidential information prematurely or unintentionally."
  },
  {
    q: "Select the one-word substitution for: 'A person who loves and collects books'",
    a: "Bibliophile", b: "Philatelist", c: "Polyglot", d: "Numismatist",
    ans: "a",
    exp: "A 'Bibliophile' is an individual who loves or collects books."
  },
  {
    q: "Fill in the blank with the most appropriate preposition: 'The candidate is eligible _______ the post of Junior Assistant.'",
    a: "with", b: "for", c: "to", d: "of",
    ans: "b",
    exp: "The adjective 'eligible' correctly collocates with the preposition 'for'."
  },
  {
    q: "Select the correctly spelt word:",
    a: "Accommodate", b: "Acommodate", c: "Accomodate", d: "Acomodate",
    ans: "a",
    exp: "'Accommodate' has double 'c' and double 'm'."
  },
  {
    q: "Select the correct passive form of the given sentence: 'The committee has approved the new regulations.'",
    a: "The new regulations were approved by the committee.",
    b: "The new regulations have been approved by the committee.",
    c: "The new regulations had been approved by the committee.",
    d: "The new regulations are being approved by the committee.",
    ans: "b",
    exp: "Present perfect 'has approved' converts to passive 'have been approved' for plural subject 'regulations'."
  },
  {
    q: "Select the most appropriate synonym of the word: 'OBSTINATE'",
    a: "Stubborn", b: "Flexible", c: "Docile", d: "Friendly",
    ans: "a",
    exp: "'Obstinate' means stubbornly refusing to change one's opinion or course of action."
  },
  {
    q: "Select the most appropriate antonym of: 'ABUNDANT'",
    a: "Scarce", b: "Plentiful", c: "Lavish", d: "Huge",
    ans: "a",
    exp: "'Abundant' means existing in large quantities; its antonym is 'scarce'."
  },
  {
    q: "Find the error in the sentence: 'She is senior than (A) / me in service (B) / by two years (C) / No error (D)'",
    a: "She is senior than", b: "me in service", c: "by two years", d: "No error",
    ans: "a",
    exp: "Comparative adjectives ending in '-ior' (senior, junior, superior) take preposition 'to', not 'than' ('senior to me')."
  },
  {
    q: "Choose the correct meaning of the idiom: 'Once in a blue moon'",
    a: "Frequently", b: "Very rarely", c: "Every month", d: "In the night",
    ans: "b",
    exp: "'Once in a blue moon' means something that happens very rarely or infrequently."
  },
  {
    q: "Select the one-word substitution for: 'A life history of a person written by himself'",
    a: "Biography", b: "Autobiography", c: "Calligraphy", d: "Bibliography",
    ans: "b",
    exp: "An 'Autobiography' is an account of a person's life written by that person."
  },
  {
    q: "Fill in the blank: 'Scarcely had the teacher entered the classroom _______ the students stood up.'",
    a: "than", b: "when", c: "then", d: "before",
    ans: "b",
    exp: "'Scarcely... when' and 'Hardly... when' are correlative conjunction pairs."
  },
  {
    q: "Select the incorrectly spelt word:",
    a: "Privilege", b: "Maintenance", c: "Definite", d: "Occurence",
    ans: "d",
    exp: "The correct spelling is 'Occurrence' (with double 'r')."
  },
  {
    q: "Convert into indirect speech: He said, 'I am learning a new computer course.'",
    a: "He said that he is learning a new computer course.",
    b: "He said that he was learning a new computer course.",
    c: "He said that he had learned a new computer course.",
    d: "He told he was learning a new computer course.",
    ans: "b",
    exp: "Present continuous 'am learning' changes to past continuous 'was learning' with conjunction 'that'."
  },
  {
    q: "Select the most appropriate synonym for: 'PRUDENT'",
    a: "Wise / Judicious", b: "Reckless", c: "Impolite", d: "Foolish",
    ans: "a",
    exp: "'Prudent' means acting with or showing care and thought for the future; wise."
  },
  {
    q: "Select the antonym of: 'TRANSPARENT'",
    a: "Opaque", b: "Clear", c: "Translucent", d: "Bright",
    ans: "a",
    exp: "'Transparent' allows light to pass clearly; 'opaque' does not let light through."
  },
  {
    q: "Choose the correct alternative to improve the underlined part: 'If I was you, I would accept the job offer.'",
    a: "If I am you", b: "If I were you", c: "If I had been you", d: "No improvement",
    ans: "b",
    exp: "In hypothetical/subjunctive conditional clauses, 'were' is used with all subjects ('If I were you')."
  },
  {
    q: "What is the meaning of the idiom: 'Burn the midnight oil'?",
    a: "To set fire to fuel", b: "To work or study late into the night", c: "To waste resources", d: "To be careless",
    ans: "b",
    exp: "'Burn the midnight oil' means to read, study, or work late into the night."
  },
  {
    q: "One-word substitution: 'Government by officials and administrators'",
    a: "Democracy", b: "Bureaucracy", c: "Aristocracy", d: "Autocracy",
    ans: "b",
    exp: "A system of government in which most decisions are taken by state officials is a 'Bureaucracy'."
  },
  {
    q: "Fill in the blank: 'He is proficient _______ English typing and shorthand.'",
    a: "in", b: "at", c: "with", d: "for",
    ans: "a",
    exp: "The adjective 'proficient' is typically followed by the preposition 'in' when referring to a skill or domain."
  },
  {
    q: "Select the correctly spelt word:",
    a: "Questionnaire", b: "Questionair", c: "Questionaire", d: "Questionnare",
    ans: "a",
    exp: "'Questionnaire' has double 'n' and ends in '-aire'."
  },
  {
    q: "Select the passive voice: 'The librarian will issue the books tomorrow.'",
    a: "The books would be issued by the librarian tomorrow.",
    b: "The books will be issued by the librarian tomorrow.",
    c: "The books are issued by the librarian tomorrow.",
    d: "The books have been issued by the librarian tomorrow.",
    ans: "b",
    exp: "Simple future 'will issue' converts to passive 'will be issued'."
  },
  {
    q: "Select the synonym of: 'ELOQUENT'",
    a: "Fluent and persuasive", b: "Shy", c: "Inarticulate", d: "Silent",
    ans: "a",
    exp: "'Eloquent' means fluent or persuasive in speaking or writing."
  },
  {
    q: "Select the antonym of: 'GREGARIOUS'",
    a: "Sociable", b: "Reclusive / Introverted", c: "Cheerful", d: "Lively",
    ans: "b",
    exp: "'Gregarious' means fond of company and sociable; its opposite is reclusive or unsociable."
  },
  {
    q: "Find the error: 'One of the candidate (A) / has not submitted (B) / the application form (C) / No error (D)'",
    a: "One of the candidate", b: "has not submitted", c: "the application form", d: "No error",
    ans: "a",
    exp: "'One of the' must be followed by a plural noun ('One of the candidates')."
  },
  {
    q: "Meaning of idiom: 'At the drop of a hat'",
    a: "Without any hesitation or instantly", b: "After a long delay", c: "With great difficulty", d: "Carefully",
    ans: "a",
    exp: "'At the drop of a hat' means immediately without waiting or thinking twice."
  },
  {
    q: "One-word substitution: 'A place where dead bodies are kept for post-mortem analysis'",
    a: "Cemetery", b: "Mortuary", c: "Sanatorium", d: "Creche",
    ans: "b",
    exp: "A 'Mortuary' is a room or building in which dead bodies are kept."
  },
  {
    q: "Fill in the blank: 'She has been working on this report _______ 9:00 AM.'",
    a: "for", b: "since", c: "from", d: "by",
    ans: "b",
    exp: "'Since' is used to denote a specific point of time in the past with perfect tenses."
  },
  {
    q: "Select the correctly spelt word:",
    a: "Bureaucracy", b: "Beurocracy", c: "Bureaucrasy", d: "Burocracy",
    ans: "a",
    exp: "The correct spelling is 'Bureaucracy' (B-U-R-E-A-U-C-R-A-C-Y)."
  },
  {
    q: "Select the antonym of: 'DILIGENT'",
    a: "Hardworking", b: "Lazy / Indolent", c: "Careful", d: "Active",
    ans: "b",
    exp: "'Diligent' means having or showing care and conscientiousness; opposite is lazy/indolent."
  },
  {
    q: "Select the synonym of: 'VINDICATE'",
    a: "Justify / Clear from blame", b: "Accuse", c: "Condemn", d: "Punish",
    ans: "a",
    exp: "'Vindicate' means to clear someone of blame or suspicion, or to show to be right and justified."
  },
  {
    q: "Identify the error: 'He did not knew (A) / the answer to (B) / the question asked (C) / No error (D)'",
    a: "He did not knew", b: "the answer to", c: "the question asked", d: "No error",
    ans: "a",
    exp: "Auxiliary verb 'did' must be followed by base form of verb ('did not know', not 'knew')."
  },
  {
    q: "Meaning of idiom: 'Cost an arm and a leg'",
    a: "Extremely expensive", b: "Very cheap", c: "Physical injury", d: "Easy to achieve",
    ans: "a",
    exp: "'Cost an arm and a leg' means to be very expensive."
  },
  {
    q: "One-word substitution: 'A speech made without any prior preparation'",
    a: "Extempore / Impromptu", b: "Debate", c: "Eulogy", d: "Monologue",
    ans: "a",
    exp: "An 'Extempore' speech is spoken or done without preparation."
  },
  {
    q: "Fill in the blank: 'The manager prevented him _______ leaving the office early.'",
    a: "to", b: "from", c: "for", d: "in",
    ans: "b",
    exp: "The verb 'prevent' takes the preposition 'from' followed by a gerund ('prevented him from leaving')."
  },
  {
    q: "Select the correctly spelt word:",
    a: "Hierarchy", b: "Heirarchy", c: "Hiererchy", d: "Heirercy",
    ans: "a",
    exp: "The correct spelling is 'Hierarchy' (H-I-E-R-A-R-C-H-Y)."
  },
  {
    q: "Select the synonym of: 'AMELIORATE'",
    a: "Worsen", b: "Improve", c: "Destroy", d: "Halt",
    ans: "b",
    exp: "'Ameliorate' means to make something bad or unsatisfactory better; to improve."
  },
  {
    q: "Select the antonym of: 'AFFLUENT'",
    a: "Poor / Destitute", b: "Wealthy", c: "Prosperous", d: "Rich",
    ans: "a",
    exp: "'Affluent' means wealthy; its opposite is poor or destitute."
  },
  {
    q: "Choose the correct sentence:",
    a: "The sceneries of Kashmir are breathtaking.",
    b: "The scenery of Kashmir is breathtaking.",
    c: "The sceneries of Kashmir is breathtaking.",
    d: "The scenery of Kashmir are breathtaking.",
    ans: "b",
    exp: "'Scenery' is an uncountable noun with no plural form and takes a singular verb ('scenery... is')."
  },
  {
    q: "Meaning of idiom: 'To beat around the bush'",
    a: "To avoid talking about what is important", b: "To search for something in a garden", c: "To speak clearly", d: "To win a race",
    ans: "a",
    exp: "'To beat around the bush' means to discuss a matter without coming directly to the main point."
  },
  {
    q: "One-word substitution: 'A remedy for all diseases or difficulties'",
    a: "Panacea", b: "Antibiotic", c: "Placebo", d: "Antidote",
    ans: "a",
    exp: "A 'Panacea' is a solution or remedy for all difficulties or diseases."
  },
  {
    q: "Fill in the blank: 'Hardly had we reached the railway station _______ the train departed.'",
    a: "then", b: "when", c: "than", d: "after",
    ans: "b",
    exp: "'Hardly' takes 'when' in correlative conjunction construction."
  },
  {
    q: "Select the correctly spelt word:",
    a: "Millennium", b: "Millenium", c: "Milennium", d: "Millenniam",
    ans: "a",
    exp: "'Millennium' is spelled with double 'l' and double 'n'."
  },
  {
    q: "Select the synonym of: 'TACITURN'",
    a: "Reserved / Untalkative", b: "Chatty", c: "Loud", d: "Friendly",
    ans: "a",
    exp: "'Taciturn' describes a person reserved or uncommunicative in speech."
  },
  {
    q: "Select the antonym of: 'EPHEMERAL'",
    a: "Short-lived", b: "Permanent / Eternal", c: "Brief", d: "Fleeting",
    ans: "b",
    exp: "'Ephemeral' means lasting for a very short time; opposite is permanent or eternal."
  },
  {
    q: "Identify the error: 'Each of the boys (A) / are required to submit (B) / their identity cards (C) / No error (D)'",
    a: "Each of the boys", b: "are required to submit", c: "their identity cards", d: "No error",
    ans: "b",
    exp: "'Each' is singular and requires a singular verb: 'is required to submit'."
  },
  {
    q: "Meaning of idiom: 'Piece of cake'",
    a: "A sweet dish", b: "Something very easy to do", c: "A birthday gift", d: "A difficult task",
    ans: "b",
    exp: "'Piece of cake' means something that is very simple or effortless to accomplish."
  },
  {
    q: "One-word substitution: 'One who does not believe in the existence of God'",
    a: "Theist", b: "Atheist", c: "Agnostic", d: "Fanatic",
    ans: "b",
    exp: "An 'Atheist' is a person who disbelieves or lacks belief in the existence of God or gods."
  }
];

// Transform into standard Question schema
function formatBank() {
  const bank = [];

  const addQuestions = (arr, section, examSource) => {
    arr.forEach((item, idx) => {
      bank.push({
        id: `seed_${section.toLowerCase()}_${String(idx + 1).padStart(3, "0")}`,
        section,
        questionText: item.q,
        options: {
          a: item.a,
          b: item.b,
          c: item.c,
          d: item.d,
        },
        correctOption: item.ans,
        explanation: item.exp,
        hasImage: false,
        sourceExam: examSource,
        sourceYear: 2023,
        difficulty: "MEDIUM",
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    });
  };

  addQuestions(reasoningQuestions, "REASONING", "SSC_CHSL_Seed_Reasoning");
  addQuestions(gaQuestions, "GA", "NBE_Official_Seed_GA");
  addQuestions(quantQuestions, "QUANT", "SSC_CHSL_Seed_Quant");
  addQuestions(englishQuestions, "ENGLISH", "SSC_CHSL_Seed_English");

  return bank;
}

const allQuestions = formatBank();
const targetPath = path.join(process.cwd(), "data", "seed-questions.json");
const questionsPath = path.join(process.cwd(), "data", "questions.json");

fs.writeFileSync(targetPath, JSON.stringify(allQuestions, null, 2), "utf-8");
fs.writeFileSync(questionsPath, JSON.stringify(allQuestions, null, 2), "utf-8");

console.log(`Generated ${allQuestions.length} seed questions successfully.`);
console.log(`Breakdown: Reasoning=${reasoningQuestions.length}, GA=${gaQuestions.length}, Quant=${quantQuestions.length}, English=${englishQuestions.length}`);
