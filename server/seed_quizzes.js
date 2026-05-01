const fs = require('fs');
const path = require('path');

const lessonsPath = path.join(__dirname, 'data', 'lessons.json');
const quizzesPath = path.join(__dirname, 'data', 'quizzes.json');

// Ensure directories and files
if (!fs.existsSync(lessonsPath)) {
  console.log("No lessons found.");
  process.exit(1);
}

let lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));

let quizzes = {};
try {
  quizzes = JSON.parse(fs.readFileSync(quizzesPath, 'utf8'));
} catch (e) {
  // If file does not exist or empty
}

// Function to generate 5 generic but relevant questions based on subject/title
function generateQuestions(lessonId, index, title) {
  return [
    {
      "_id": `q1_${lessonId}`,
      "text": `What is the main topic of the lesson: ${title}?`,
      "type": "multiple-choice",
      "options": [ title, "A random topic", "Something unrelated", "None of the above" ],
      "correctAnswer": title,
      "points": 20
    },
    {
      "_id": `q2_${lessonId}`,
      "text": "Which of the following describes the key takeaway from this video?",
      "type": "multiple-choice",
      "options": [
        "It provides foundational knowledge on the subject.",
        "It teaches advanced astrophysics.",
        "It focuses solely on mathematics.",
        "It is a fictional story."
      ],
      "correctAnswer": "It provides foundational knowledge on the subject.",
      "points": 20
    },
    {
      "_id": `q3_${lessonId}`,
      "text": "True or False: Paying attention to this video helps you answer these questions.",
      "type": "true-false",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "points": 20
    },
    {
      "_id": `q4_${lessonId}`,
      "text": "How many key concepts were covered in this lesson's introduction?",
      "type": "multiple-choice",
      "options": ["One", "Two", "Three", "Multiple"],
      "correctAnswer": "Multiple",
      "points": 20
    },
    {
      "_id": `q5_${lessonId}`,
      "text": "True or False: This lesson is designed to be accessible for all learners.",
      "type": "true-false",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "points": 20
    }
  ];
}

// Custom questions for specific lessons to make them cool
const customQuestions = {
  "1774796027469": [ // Photosynthesis
    { "_id": "sq1", "text": "What gas do plants absorb during photosynthesis?", "type": "multiple-choice", "options": ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], "correctAnswer": "Carbon Dioxide", "points": 20 },
    { "_id": "sq2", "text": "What do plants produce as a byproduct?", "type": "multiple-choice", "options": ["Carbon Dioxide", "Water", "Oxygen", "Methane"], "correctAnswer": "Oxygen", "points": 20 },
    { "_id": "sq3", "text": "What green pigment absorbs light energy?", "type": "multiple-choice", "options": ["Hemoglobin", "Melanin", "Chlorophyll", "Carotene"], "correctAnswer": "Chlorophyll", "points": 20 },
    { "_id": "sq4", "text": "True or False: Without sunlight, photosynthesis cannot occur.", "type": "true-false", "options": ["True", "False"], "correctAnswer": "True", "points": 20 },
    { "_id": "sq5", "text": "Where does photosynthesis primarily occur in a plant?", "type": "multiple-choice", "options": ["Roots", "Stem", "Leaves", "Flowers"], "correctAnswer": "Leaves", "points": 20 }
  ],
  "child_lesson_1": [ // Colors
    { "_id": "cq1", "text": "Which fruit is red according to the video?", "type": "multiple-choice", "options": ["Banana", "Apple", "Grape", "Orange"], "correctAnswer": "Apple", "points": 20 },
    { "_id": "cq2", "text": "What color is the sky?", "type": "multiple-choice", "options": ["Red", "Green", "Blue", "Yellow"], "correctAnswer": "Blue", "points": 20 },
    { "_id": "cq3", "text": "What color is the grass?", "type": "multiple-choice", "options": ["Blue", "Red", "Black", "Green"], "correctAnswer": "Green", "points": 20 },
    { "_id": "cq4", "text": "True or False: Learning colors is fun!", "type": "true-false", "options": ["True", "False"], "correctAnswer": "True", "points": 20 },
    { "_id": "cq5", "text": "Which of these is a color learned in the video?", "type": "multiple-choice", "options": ["Car", "Red", "Dog", "House"], "correctAnswer": "Red", "points": 20 }
  ]
};

Object.values(lessons).forEach((lesson, i) => {
  // If no quiz exists for this lesson, create one.
  // Note: we'll just overwrite or create named `quiz_${lesson.id}`
  const quizId = "quiz_" + lesson.id;
  
  if (!quizzes[quizId]) {
    quizzes[quizId] = {
      _id: quizId,
      id: quizId,
      title: "Quiz: " + lesson.title,
      lessonId: lesson.id,
      teacherId: lesson.teacherId || "1",
      questions: customQuestions[lesson.id] || generateQuestions(lesson.id, i, lesson.title),
      createdAt: new Date().toISOString()
    };
    console.log("Created quiz for " + lesson.title);
  }
});

fs.writeFileSync(quizzesPath, JSON.stringify(quizzes, null, 2));
console.log("All quizzes seeded with 5 questions each!");
