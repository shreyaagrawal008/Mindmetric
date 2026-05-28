const generateSpacePortQuestions = () => {
  const rects = [
    { id: 'brick', name: 'Brick', emoji: '🧱', isRect: true },
    { id: 'phone', name: 'Smartphone', emoji: '📱', isRect: true },
    { id: 'storybook', name: 'Storybook', emoji: '📘', isRect: true },
    { id: 'notebook', name: 'Notebook', emoji: '📓', isRect: true },
    { id: 'keyboard', name: 'Keyboard', emoji: '⌨️', isRect: true },
    { id: 'ticket', name: 'Ticket', emoji: '🎫', isRect: true },
  ];
  const squares = [
    { id: 'postit', name: 'Square Post-it Note', emoji: '🟨', isRect: false },
    { id: 'window', name: 'Square Window Pane', emoji: '🪟', isRect: false },
    { id: 'dice', name: 'Dice', emoji: '🎲', isRect: false },
    { id: 'tile', name: 'Checkered Tile', emoji: '🏁', isRect: false }
  ];
  const questions = [];
  for(let i=0; i<30; i++) {
    const rect = rects[Math.floor(Math.random() * rects.length)];
    const sq1 = squares[Math.floor(Math.random() * squares.length)];
    let sq2 = squares[Math.floor(Math.random() * squares.length)];
    while(sq1.id === sq2.id) {
       sq2 = squares[Math.floor(Math.random() * squares.length)];
    }
    const options = [rect, sq1, sq2].sort(() => Math.random() - 0.5);
    questions.push({ id: i+1, options });
  }
  return questions;
};

export const numberCometCurriculum = [
  {
    levelId: 1,
    levelName: "Launch",
    topics: [
      { topicId: 1, type: "numberShape", question: "Find the number 1", options: [1, 2, 3], answer: 1, asset: "1️⃣" },
      { topicId: 2, type: "countItems", question: "Count the stars", options: [2, 3, 4], answer: 3, asset: ["star", "star", "star"] },
      { topicId: 3, type: "countingLines", question: "Follow the line to 3", options: [2, 3, 5], answer: 3, asset: "〰️〰️3" },
      { topicId: 4, type: "scatterArray", question: "How many asteroids?", options: [4, 5, 6], answer: 5, asset: ["asteroid", "asteroid", "asteroid", "asteroid", "asteroid"] },
      { topicId: 5, type: "audioCheck", question: "Listen and find 2", options: [1, 2, 3], answer: 2, asset: "🔊" },
      { topicId: 6, type: "missingGap", question: "1, _, 3", options: [2, 4, 5], answer: 2, asset: "1️⃣ ❓ 3️⃣" },
      { topicId: 7, type: "numberShape", question: "Find the number 4", options: [4, 5, 6], answer: 4, asset: "4️⃣" },
      { topicId: 8, type: "countItems", question: "Count the planets", options: [3, 4, 5], answer: 5, asset: ["planet", "planet", "planet", "planet", "planet"] },
    ]
  },
  {
    levelId: 2,
    levelName: "Zero",
    topics: [
      { topicId: 1, type: "fingerCount", question: "How many fingers?", options: [0, 1, 2], answer: 0, asset: "✊" },
      { topicId: 2, type: "emptySet", question: "Find the empty box", options: ["1 star", "Empty", "2 stars"], answer: "Empty", asset: "📦" },
      { topicId: 3, type: "numberShape", question: "Find number 6", options: [6, 7, 8], answer: 6, asset: "6️⃣" },
      { topicId: 4, type: "numberShape", question: "Find number 9", options: [6, 9, 10], answer: 9, asset: "9️⃣" },
      { topicId: 5, type: "digitTrace", question: "Trace number 7", options: [6, 7, 8], answer: 7, asset: "✍️7" },
      { topicId: 6, type: "backwardBlast", question: "10, 9, 8, _, 6", options: [5, 7, 9], answer: 7, asset: "🚀" },
      { topicId: 7, type: "backwardBlast", question: "5, 4, 3, _, 1", options: [2, 6, 0], answer: 2, asset: "🚀" },
      { topicId: 8, type: "itemBag", question: "Pick bag with 10", options: [8, 9, 10], answer: 10, asset: "🛍️" },
    ]
  },
  { levelId: 3, levelName: "Giganto", topics: Array.from({ length: 8 }, (_, i) => ({ topicId: i + 1 })) },
  { 
    levelId: 4, 
    levelName: "Nebula", 
    topics: [
      { topicId: 1 }, { topicId: 2 }, { topicId: 3 }, { topicId: 4 },
      { 
        topicId: 5, 
        type: "deliverySpacePort", 
        question: "Luna needs the LONG boxes where two sides are stretched out extra far! Can you tap the Long Rectangles?",
        questionsData: generateSpacePortQuestions()
      },
      { topicId: 6 }, { topicId: 7 }, { topicId: 8 }
    ]
  },
  { levelId: 5, levelName: "Gator", topics: Array.from({ length: 8 }, (_, i) => ({ topicId: i + 1 })) },
  { levelId: 6, levelName: "Comet", topics: Array.from({ length: 8 }, (_, i) => ({ topicId: i + 1 })) },
  { levelId: 7, levelName: "Century", topics: Array.from({ length: 8 }, (_, i) => ({ topicId: i + 1 })) },
  { levelId: 8, levelName: "Blocks", topics: Array.from({ length: 8 }, (_, i) => ({ topicId: i + 1 })) },
  { levelId: 9, levelName: "Plus", topics: Array.from({ length: 8 }, (_, i) => ({ topicId: i + 1 })) },
  { levelId: 10, levelName: "Blast", topics: Array.from({ length: 8 }, (_, i) => ({ topicId: i + 1 })) },
  {
    levelId: 11,
    levelName: "Master",
    topics: [
      { topicId: 1, type: "bondPuzzle", question: "6 + _ = 10", options: [3, 4, 5], answer: 4, asset: "🧩" },
      { topicId: 2, type: "bondPuzzle", question: "_ + 2 = 10", options: [7, 8, 9], answer: 8, asset: "🧩" },
      { topicId: 3, type: "equationFlip", question: "If 3+4=7, then 7-4=?", options: [2, 3, 4], answer: 3, asset: "🔄" },
      { topicId: 4, type: "twinsDoubles", question: "Double of 4 is?", options: [6, 8, 10], answer: 8, asset: "👯" },
      { topicId: 5, type: "mixedOp", question: "5 + 3 - 2 = ?", options: [5, 6, 7], answer: 6, asset: "➗" },
      { topicId: 6, type: "patternVisual", question: "Red, Blue, Red, ?", options: ["Red", "Blue", "Green"], answer: "Blue", asset: "🔴🔵🔴❓" },
      { topicId: 7, type: "patternVisual", question: "Square, Circle, Square, Circle, ?", options: ["Square", "Circle", "Triangle"], answer: "Square", asset: "⬛⏺️⬛⏺️❓" },
      { topicId: 8, type: "capstone", question: "10 - 5 + 2 + 1 = ?", options: [7, 8, 9], answer: 8, asset: "🏆" },
    ]
  }
];
