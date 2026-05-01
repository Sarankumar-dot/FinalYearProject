const fs = require('fs');
const path = require('path');

const lessonsPath = path.join(__dirname, 'data', 'lessons.json');
const signlangPath = path.join(__dirname, 'data', 'signlang.json');
const quizzesPath = path.join(__dirname, 'data', 'quizzes.json');

// Read existing data
let lessons = {};
try { lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8')); } catch (e) {}

let signlang = {};
try { signlang = JSON.parse(fs.readFileSync(signlangPath, 'utf8')); } catch (e) {}

let quizzes = {};
try { quizzes = JSON.parse(fs.readFileSync(quizzesPath, 'utf8')); } catch (e) {}

const newSubjects = [
  {
    "_id": "child_lesson_4",
    "id": "child_lesson_4",
    "title": "The Solar System for Kids",
    "description": "Learn about the sun and the 8 planets in our solar system!",
    "subject": "Science",
    "type": "video",
    "fileUrl": "https://www.youtube.com/watch?v=zWWcNjRohe4",
    "thumbnailUrl": "",
    "transcript": "Welcome to space! At the center of our solar system is the Sun. Orbiting the Sun are eight planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.",
    "altText": "",
    "textContent": "",
    "tags": ["space", "planets", "science", "kids"],
    "teacherId": "1",
    "isPublished": true,
    "viewCount": 0,
    "createdAt": new Date().toISOString()
  },
  {
    "_id": "child_lesson_5",
    "id": "child_lesson_5",
    "title": "The Seven Continents",
    "description": "A fun geographical song to remember the 7 continents of the Earth.",
    "subject": "Geography",
    "type": "video",
    "fileUrl": "https://www.youtube.com/watch?v=K6DSMZ8b3LE",
    "thumbnailUrl": "",
    "transcript": "Let's travel the world! The seven continents are North America, South America, Europe, Africa, Asia, Australia, and Antarctica.",
    "altText": "",
    "textContent": "",
    "tags": ["geography", "continents", "world", "kids"],
    "teacherId": "1",
    "isPublished": true,
    "viewCount": 0,
    "createdAt": new Date().toISOString()
  },
  {
    "_id": "child_lesson_6",
    "id": "child_lesson_6",
    "title": "Phonics Song (A to Z)",
    "description": "Learn the sounds of the English alphabet.",
    "subject": "English",
    "type": "video",
    "fileUrl": "https://www.youtube.com/watch?v=saF3-f0XWAY",
    "thumbnailUrl": "",
    "transcript": "A is for Apple, a-a-apple. B is for Ball, b-b-ball. C is for Cat, c-c-cat. D is for Dog, d-d-dog.",
    "altText": "",
    "textContent": "",
    "tags": ["english", "alphabet", "phonics", "reading"],
    "teacherId": "1",
    "isPublished": true,
    "viewCount": 0,
    "createdAt": new Date().toISOString()
  },
  {
    "_id": "child_lesson_7",
    "id": "child_lesson_7",
    "title": "Learning Shapes",
    "description": "Identify basic geometry shapes in our everyday world.",
    "subject": "Math",
    "type": "video",
    "fileUrl": "https://www.youtube.com/watch?v=WTeqUejf3D0",
    "thumbnailUrl": "",
    "transcript": "A circle is round like a ball. A square has four equal sides. A triangle has three sides. Look around and see what shapes you can find!",
    "altText": "",
    "textContent": "",
    "tags": ["math", "shapes", "geometry", "kids"],
    "teacherId": "1",
    "isPublished": true,
    "viewCount": 0,
    "createdAt": new Date().toISOString()
  },
  {
    "_id": "child_lesson_8",
    "id": "child_lesson_8",
    "title": "Ancient Egypt for Kids",
    "description": "Discover the pyramids, pharaohs, and the Nile river.",
    "subject": "History",
    "type": "video",
    "fileUrl": "https://www.youtube.com/watch?v=lJui_2XwYhQ",
    "thumbnailUrl": "",
    "transcript": "Ancient Egypt was a civilization in North Africa along the Nile River. They built giant pyramids as tombs for their rulers, known as Pharaohs.",
    "altText": "",
    "textContent": "",
    "tags": ["history", "egypt", "pyramids", "kids"],
    "teacherId": "1",
    "isPublished": true,
    "viewCount": 0,
    "createdAt": new Date().toISOString()
  }
];

// Add to lessons
newSubjects.forEach(l => {
  lessons[l._id] = l;
});

// Create Quizzes for them
function generate5Questions(lessonId, subjectTitle) {
  return [
    {
      "_id": "q1_" + lessonId,
      "text": "What is the primary topic of this " + subjectTitle + " video?",
      "type": "multiple-choice",
      "options": [ subjectTitle, "Math", "Science", "Cooking" ],
      "correctAnswer": subjectTitle,
      "points": 20
    },
    {
      "_id": "q2_" + lessonId,
      "text": "True or False: The concepts taught in this video are suitable for kids.",
      "type": "true-false",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "points": 20
    },
    {
      "_id": "q3_" + lessonId,
      "text": "Which of these might you learn from a video about " + subjectTitle + "?",
      "type": "multiple-choice",
      "options": [
        "Core foundational concepts",
        "How to drive a manual car",
        "Calculus formulas",
        "Nothing at all"
      ],
      "correctAnswer": "Core foundational concepts",
      "points": 20
    },
    {
      "_id": "q4_" + lessonId,
      "text": "Using what you learned in the video, are these subjects important?",
      "type": "multiple-choice",
      "options": ["Yes, very important", "No", "Only for adults", "Only on Mondays"],
      "correctAnswer": "Yes, very important",
      "points": 20
    },
    {
      "_id": "q5_" + lessonId,
      "text": "True or False: You should review this " + subjectTitle + " material again if you forget it.",
      "type": "true-false",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "points": 20
    }
  ];
}

newSubjects.forEach(l => {
  const quizId = "quiz_" + l.id;
  quizzes[quizId] = {
    _id: quizId,
    id: quizId,
    title: "Quiz: " + l.title,
    lessonId: l.id,
    teacherId: l.teacherId,
    questions: generate5Questions(l.id, l.subject),
    createdAt: new Date().toISOString()
  };
});

// Update Sign Language Library to have some of these tags
const newSigns = [
  {
    "_id": "sl_space",
    "keyword": "space",
    "videoUrl": "https://www.youtube.com/embed/zWWcNjRohe4",
    "description": "Sign for space/planets",
    "subject": "Science",
    "addedBy": "system"
  },
  {
    "_id": "sl_geography",
    "keyword": "geography",
    "videoUrl": "https://www.youtube.com/embed/K6DSMZ8b3LE",
    "description": "Sign for geography/world",
    "subject": "Geography",
    "addedBy": "system"
  },
  {
    "_id": "sl_shapes",
    "keyword": "shapes",
    "videoUrl": "https://www.youtube.com/embed/WTeqUejf3D0",
    "description": "Sign for shapes",
    "subject": "Math",
    "addedBy": "system"
  },
  {
    "_id": "sl_history",
    "keyword": "history",
    "videoUrl": "https://www.youtube.com/embed/lJui_2XwYhQ",
    "description": "Sign for history/egypt",
    "subject": "History",
    "addedBy": "system"
  }
];

newSigns.forEach(s => {
  signlang[s.keyword] = s;
});

// Save databases
fs.writeFileSync(lessonsPath, JSON.stringify(lessons, null, 2));
fs.writeFileSync(quizzesPath, JSON.stringify(quizzes, null, 2));
fs.writeFileSync(signlangPath, JSON.stringify(signlang, null, 2));

console.log("Successfully added 5 new multi-subject YouTube lessons, their quizzes, and their sign language tags!");
