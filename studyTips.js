
// Array of study tips
const studyTips = [
  "Set specific goals for each study session.",
  "Take regular breaks using the Pomodoro Technique.",
  "Use active recall when reviewing material.",
  "Create and stick to a study schedule.",
  "Eliminate distractions by studying in a quiet space.",
  "Teach what you’ve learned to someone else.",
  "Use flashcards for memorization-based subjects.",
  "Review your notes regularly, not just before exams.",
  "Stay hydrated and eat healthy snacks while studying.",
  "Try studying in short, focused sessions rather than long marathons.",
  "Highlight key points and summarize them in your own words.",
  "Organize your study material in a way that makes sense to you.",
  "Practice past exam questions or quizzes.",
  "Incorporate visuals like diagrams, charts, and mind maps.",
  "Study at the same time every day to build a routine.",
  "Use apps or tools to manage your time effectively.",
  "Get a good night’s sleep before studying and exams.",
  "Break large topics into smaller, manageable chunks.",
  "Reward yourself after completing study goals.",
  "Join a study group to collaborate and share insights."
];

// Function to generate a random study tip
function getRandomStudyTip() {
  const randomIndex = Math.floor(Math.random() * studyTips.length);
  return studyTips[randomIndex];
}

// Display the random study tip
console.log("Your Study Tip: " + getRandomStudyTip());
