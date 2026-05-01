const fs = require('fs');
const path = require('path');

const lessonsPath = path.join(__dirname, 'data', 'lessons.json');
const signlangPath = path.join(__dirname, 'data', 'signlang.json');

// 1. Remove duplicate lesson
let lessons = {};
try {
  lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
} catch(e) {
  console.log("No lessons file found.");
}

// Remove the duplicate Photosynthesis lesson (ID 1774796028977)
if (lessons["1774796028977"]) {
  delete lessons["1774796028977"];
  console.log("Removed duplicate lesson: 1774796028977");
}

// 2. Add children lessons
const newLessons = [
  {
    "_id": "child_lesson_1",
    "id": "child_lesson_1",
    "title": "Learn Colors for Kids",
    "description": "A fun interactive way for kids to learn basic colors like Red, Blue, and Green.",
    "subject": "Early Learning",
    "type": "video",
    "fileUrl": "https://www.youtube.com/watch?v=ybt2jhCQ3lA",
    "thumbnailUrl": "",
    "transcript": "Look at the colors! Here is Red. The apple is red. Here is Blue. The sky is blue. Here is Green. The grass is green. Red, blue, green! Great job learning your colors.",
    "altText": "",
    "textContent": "",
    "tags": ["colors", "kids", "red", "blue", "green"],
    "teacherId": "1",
    "isPublished": true,
    "viewCount": 0,
    "createdAt": new Date().toISOString()
  },
  {
    "_id": "child_lesson_2",
    "id": "child_lesson_2",
    "title": "Animals and Their Sounds",
    "description": "Learn about different animals and the sounds they make.",
    "subject": "Early Learning",
    "type": "video",
    "fileUrl": "https://www.youtube.com/watch?v=t99ULJjCsaM",
    "thumbnailUrl": "",
    "transcript": "Let's learn animals! The cow says moo. The dog says woof. The cat says meow. Moo, woof, meow! Animals are fun.",
    "altText": "",
    "textContent": "",
    "tags": ["animals", "kids", "cow", "dog", "cat"],
    "teacherId": "1",
    "isPublished": true,
    "viewCount": 0,
    "createdAt": new Date().toISOString()
  },
  {
    "_id": "child_lesson_3",
    "id": "child_lesson_3",
    "title": "Counting 1 to 5",
    "description": "Practice counting numbers one through five.",
    "subject": "Math",
    "type": "video",
    "fileUrl": "https://www.youtube.com/watch?v=DR-cfDsHCGA",
    "thumbnailUrl": "",
    "transcript": "Let's count together! One, two, three, four, five. 1, 2, 3, 4, 5. Awesome counting!",
    "altText": "",
    "textContent": "",
    "tags": ["math", "numbers", "kids", "counting"],
    "teacherId": "1",
    "isPublished": true,
    "viewCount": 0,
    "createdAt": new Date().toISOString()
  }
];

newLessons.forEach(l => {
  lessons[l._id] = l;
});

fs.writeFileSync(lessonsPath, JSON.stringify(lessons, null, 2));

// 3. Add to signlang library
let signlang = {};
try {
  signlang = JSON.parse(fs.readFileSync(signlangPath, 'utf8'));
} catch(e) {
  console.log("No signlang file found.");
}

const newSigns = [
  {
    "_id": "sl_colors",
    "keyword": "colors",
    "videoUrl": "https://www.youtube.com/embed/ybt2jhCQ3lA",
    "description": "Sign for colors",
    "subject": "Early Learning",
    "addedBy": "system"
  },
  {
    "_id": "sl_animals",
    "keyword": "animals",
    "videoUrl": "https://www.youtube.com/embed/t99ULJjCsaM", 
    "description": "Sign for animals",
    "subject": "Early Learning",
    "addedBy": "system"
  },
  {
    "_id": "sl_numbers",
    "keyword": "numbers",
    "videoUrl": "https://www.youtube.com/embed/DR-cfDsHCGA", 
    "description": "Sign for numbers",
    "subject": "Math",
    "addedBy": "system"
  }
];

newSigns.forEach(s => {
  signlang[s.keyword] = s;
});

fs.writeFileSync(signlangPath, JSON.stringify(signlang, null, 2));

console.log("Successfully added new children's lessons and corresponding sign language videos.");
