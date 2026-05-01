/**
 * signDictionaryData.js
 * Procedurally generated keypoint animations for common ASL signs.
 * Each word has an array of frames with pose, rightHand, and leftHand landmarks.
 * Coordinates are normalized 0-1.
 */

// Neutral standing pose (25 landmarks)
const NP = [
  {x:0.5,y:0.18},{x:0.5,y:0.2},{x:0.5,y:0.2},{x:0.5,y:0.2},{x:0.5,y:0.2},
  {x:0.48,y:0.2},{x:0.52,y:0.2},{x:0.48,y:0.22},{x:0.52,y:0.22},
  {x:0.48,y:0.22},{x:0.52,y:0.22},{x:0.42,y:0.3},{x:0.58,y:0.3},
  {x:0.38,y:0.42},{x:0.62,y:0.42},{x:0.35,y:0.54},{x:0.65,y:0.54},
  {x:0.35,y:0.55},{x:0.65,y:0.55},{x:0.35,y:0.56},{x:0.65,y:0.56},
  {x:0.35,y:0.55},{x:0.65,y:0.55},{x:0.45,y:0.62},{x:0.55,y:0.62},
];

// Helper: create a flat open hand at position
function openHand(cx, cy, s) {
  return [
    {x:cx,y:cy},
    {x:cx-2*s,y:cy-2*s},{x:cx-3*s,y:cy-4*s},{x:cx-3.5*s,y:cy-5*s},{x:cx-4*s,y:cy-6*s},
    {x:cx-1*s,y:cy-3*s},{x:cx-1*s,y:cy-5*s},{x:cx-1*s,y:cy-7*s},{x:cx-1*s,y:cy-8*s},
    {x:cx,y:cy-3*s},{x:cx,y:cy-5*s},{x:cx,y:cy-7*s},{x:cx,y:cy-8*s},
    {x:cx+1*s,y:cy-3*s},{x:cx+1*s,y:cy-5*s},{x:cx+1*s,y:cy-7*s},{x:cx+1*s,y:cy-8*s},
    {x:cx+2*s,y:cy-2.5*s},{x:cx+2*s,y:cy-4*s},{x:cx+2*s,y:cy-5.5*s},{x:cx+2*s,y:cy-6.5*s},
  ];
}

function fist(cx, cy, s) {
  return [
    {x:cx,y:cy},
    {x:cx-2*s,y:cy-3*s},{x:cx-3*s,y:cy-5*s},{x:cx-2*s,y:cy-6*s},{x:cx-1*s,y:cy-5*s},
    {x:cx-1*s,y:cy-4*s},{x:cx-1*s,y:cy-5*s},{x:cx-1*s,y:cy-4.5*s},{x:cx-0.5*s,y:cy-4*s},
    {x:cx,y:cy-4*s},{x:cx,y:cy-5*s},{x:cx,y:cy-4.5*s},{x:cx+0.2*s,y:cy-4*s},
    {x:cx+1*s,y:cy-4*s},{x:cx+1*s,y:cy-5*s},{x:cx+1*s,y:cy-4.5*s},{x:cx+1.2*s,y:cy-4*s},
    {x:cx+2*s,y:cy-3.5*s},{x:cx+2*s,y:cy-4.5*s},{x:cx+2*s,y:cy-4*s},{x:cx+2.2*s,y:cy-3.5*s},
  ];
}

const restLeft = fist(0.35, 0.54, 0.015);

// Helper to create a modified pose with moved arms
function pose(rShoulderDx, rShoulderDy, rElbowDx, rElbowDy, rWristDx, rWristDy) {
  const p = NP.map(pt => ({...pt}));
  p[12] = {x: 0.58 + (rShoulderDx||0), y: 0.3 + (rShoulderDy||0)};
  p[14] = {x: 0.62 + (rElbowDx||0), y: 0.42 + (rElbowDy||0)};
  p[16] = {x: 0.65 + (rWristDx||0), y: 0.54 + (rWristDy||0)};
  return p;
}

// === WORD ANIMATIONS ===
const dictionary = {
  "hello": {
    gloss: "HELLO",
    frames: [
      { landmarks: { pose: pose(0,0,0.02,-0.1,0.05,-0.25), rightHand: openHand(0.70,0.29,0.018), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0.04,-0.12,0.08,-0.28), rightHand: openHand(0.73,0.26,0.018), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0.02,-0.1,0.05,-0.25), rightHand: openHand(0.70,0.29,0.018), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0.04,-0.12,0.08,-0.28), rightHand: openHand(0.73,0.26,0.018), leftHand: restLeft }},
    ]
  },
  "thank": {
    gloss: "THANK-YOU",
    frames: [
      { landmarks: { pose: pose(0,0,0,-0.08,0.02,-0.2), rightHand: openHand(0.67,0.34,0.018), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0.02,-0.05,0.05,-0.1), rightHand: openHand(0.70,0.44,0.018), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0.04,0,0.08,0.05), rightHand: openHand(0.73,0.59,0.018), leftHand: restLeft }},
    ]
  },
  "you": {
    gloss: "YOU",
    frames: [
      { landmarks: { pose: pose(0,0,0.02,-0.08,0.06,-0.16), rightHand: fist(0.71,0.38,0.016), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0.06,-0.06,0.12,-0.12), rightHand: fist(0.77,0.42,0.016), leftHand: restLeft }},
    ]
  },
  "learn": {
    gloss: "LEARN",
    frames: [
      { landmarks: { pose: pose(0,0,0.02,-0.06,0.04,-0.12), rightHand: openHand(0.69,0.42,0.016), leftHand: openHand(0.35,0.54,0.016) }},
      { landmarks: { pose: pose(0,0,0,-0.12,0,-0.28), rightHand: fist(0.65,0.26,0.014), leftHand: openHand(0.35,0.54,0.016) }},
      { landmarks: { pose: pose(0,0,0,-0.14,0,-0.32), rightHand: openHand(0.65,0.22,0.014), leftHand: openHand(0.35,0.54,0.016) }},
    ]
  },
  "help": {
    gloss: "HELP",
    frames: [
      { landmarks: { pose: pose(0,0,-0.04,-0.04,-0.08,-0.06), rightHand: fist(0.57,0.48,0.016), leftHand: openHand(0.38,0.48,0.016) }},
      { landmarks: { pose: pose(0,0,-0.02,-0.1,-0.04,-0.2), rightHand: fist(0.61,0.34,0.016), leftHand: openHand(0.40,0.38,0.016) }},
    ]
  },
  "good": {
    gloss: "GOOD",
    frames: [
      { landmarks: { pose: pose(0,0,0,-0.08,0.02,-0.18), rightHand: openHand(0.67,0.36,0.016), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0.03,0,0.06,0.05), rightHand: openHand(0.71,0.59,0.016), leftHand: openHand(0.38,0.54,0.016) }},
    ]
  },
  "bad": {
    gloss: "BAD",
    frames: [
      { landmarks: { pose: pose(0,0,0,-0.1,0,-0.22), rightHand: openHand(0.65,0.32,0.016), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0.03,0,0.06,0.08), rightHand: openHand(0.71,0.62,0.018), leftHand: restLeft }},
    ]
  },
  "yes": {
    gloss: "YES",
    frames: [
      { landmarks: { pose: pose(0,0,0.04,-0.06,0.08,-0.14), rightHand: fist(0.73,0.40,0.016), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0.04,-0.08,0.08,-0.18), rightHand: fist(0.73,0.36,0.016), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0.04,-0.06,0.08,-0.14), rightHand: fist(0.73,0.40,0.016), leftHand: restLeft }},
    ]
  },
  "no": {
    gloss: "NO",
    frames: [
      { landmarks: { pose: pose(0,0,0.04,-0.08,0.08,-0.18), rightHand: fist(0.73,0.36,0.014), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0.04,-0.08,0.08,-0.18), rightHand: openHand(0.73,0.36,0.014), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0.04,-0.08,0.08,-0.18), rightHand: fist(0.73,0.36,0.014), leftHand: restLeft }},
    ]
  },
  "please": {
    gloss: "PLEASE",
    frames: [
      { landmarks: { pose: pose(0,0,-0.1,-0.04,-0.16,-0.04), rightHand: openHand(0.49,0.50,0.018), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,-0.1,-0.08,-0.16,-0.12), rightHand: openHand(0.49,0.42,0.018), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,-0.1,-0.04,-0.16,-0.04), rightHand: openHand(0.49,0.50,0.018), leftHand: restLeft }},
    ]
  },
  "sorry": {
    gloss: "SORRY",
    frames: [
      { landmarks: { pose: pose(0,0,-0.08,-0.04,-0.14,-0.04), rightHand: fist(0.51,0.50,0.016), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,-0.08,-0.08,-0.14,-0.10), rightHand: fist(0.51,0.44,0.016), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,-0.08,-0.04,-0.14,-0.04), rightHand: fist(0.51,0.50,0.016), leftHand: restLeft }},
    ]
  },
  "water": {
    gloss: "WATER",
    frames: [
      { landmarks: { pose: pose(0,0,0,-0.12,0,-0.26), rightHand: openHand(0.65,0.28,0.014), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0,-0.14,-0.02,-0.30), rightHand: openHand(0.63,0.24,0.014), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0,-0.12,0,-0.26), rightHand: openHand(0.65,0.28,0.014), leftHand: restLeft }},
    ]
  },
  "food": {
    gloss: "FOOD/EAT",
    frames: [
      { landmarks: { pose: pose(0,0,0,-0.12,0,-0.26), rightHand: fist(0.65,0.28,0.014), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,-0.02,-0.14,-0.06,-0.30), rightHand: fist(0.59,0.24,0.014), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0,-0.12,0,-0.26), rightHand: fist(0.65,0.28,0.014), leftHand: restLeft }},
    ]
  },
  "school": {
    gloss: "SCHOOL",
    frames: [
      { landmarks: { pose: pose(0,0,-0.04,-0.04,-0.1,0), rightHand: openHand(0.55,0.54,0.016), leftHand: openHand(0.38,0.54,0.016) }},
      { landmarks: { pose: pose(0,0,-0.04,-0.06,-0.1,-0.04), rightHand: openHand(0.55,0.50,0.016), leftHand: openHand(0.38,0.50,0.016) }},
      { landmarks: { pose: pose(0,0,-0.04,-0.04,-0.1,0), rightHand: openHand(0.55,0.54,0.016), leftHand: openHand(0.38,0.54,0.016) }},
    ]
  },
  "teacher": {
    gloss: "TEACHER",
    frames: [
      { landmarks: { pose: pose(0,0,0,-0.14,0,-0.30), rightHand: openHand(0.65,0.24,0.014), leftHand: openHand(0.38,0.24,0.014) }},
      { landmarks: { pose: pose(0,0,0.02,-0.10,0.04,-0.20), rightHand: openHand(0.69,0.34,0.014), leftHand: openHand(0.38,0.34,0.014) }},
    ]
  },
  "student": {
    gloss: "STUDENT",
    frames: [
      { landmarks: { pose: pose(0,0,-0.02,-0.06,-0.06,-0.10), rightHand: openHand(0.59,0.44,0.016), leftHand: openHand(0.38,0.50,0.016) }},
      { landmarks: { pose: pose(0,0,0,-0.12,0,-0.28), rightHand: fist(0.65,0.26,0.014), leftHand: openHand(0.38,0.50,0.016) }},
    ]
  },
  "book": {
    gloss: "BOOK",
    frames: [
      { landmarks: { pose: NP, rightHand: openHand(0.55,0.50,0.016), leftHand: openHand(0.45,0.50,0.016) }},
      { landmarks: { pose: NP, rightHand: openHand(0.60,0.48,0.016), leftHand: openHand(0.40,0.48,0.016) }},
      { landmarks: { pose: NP, rightHand: openHand(0.55,0.50,0.016), leftHand: openHand(0.45,0.50,0.016) }},
    ]
  },
  "understand": {
    gloss: "UNDERSTAND",
    frames: [
      { landmarks: { pose: pose(0,0,0,-0.14,0,-0.30), rightHand: fist(0.65,0.24,0.014), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0,-0.14,0,-0.30), rightHand: openHand(0.65,0.24,0.016), leftHand: restLeft }},
    ]
  },
  "name": {
    gloss: "NAME",
    frames: [
      { landmarks: { pose: pose(0,0,0.02,-0.08,0.04,-0.16), rightHand: fist(0.69,0.38,0.014), leftHand: fist(0.38,0.44,0.014) }},
      { landmarks: { pose: pose(0,0,0,-0.08,0.02,-0.16), rightHand: fist(0.67,0.38,0.014), leftHand: fist(0.40,0.44,0.014) }},
    ]
  },
  "what": {
    gloss: "WHAT",
    frames: [
      { landmarks: { pose: NP, rightHand: openHand(0.60,0.46,0.016), leftHand: openHand(0.40,0.46,0.016) }},
      { landmarks: { pose: NP, rightHand: openHand(0.58,0.48,0.016), leftHand: openHand(0.42,0.48,0.016) }},
    ]
  },
  "where": {
    gloss: "WHERE",
    frames: [
      { landmarks: { pose: pose(0,0,0.04,-0.08,0.08,-0.18), rightHand: openHand(0.73,0.36,0.014), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0.06,-0.08,0.12,-0.18), rightHand: openHand(0.77,0.36,0.014), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0.04,-0.08,0.08,-0.18), rightHand: openHand(0.73,0.36,0.014), leftHand: restLeft }},
    ]
  },
  "how": {
    gloss: "HOW",
    frames: [
      { landmarks: { pose: NP, rightHand: fist(0.58,0.48,0.016), leftHand: fist(0.42,0.48,0.016) }},
      { landmarks: { pose: NP, rightHand: openHand(0.60,0.44,0.016), leftHand: openHand(0.40,0.44,0.016) }},
    ]
  },
  "the": {
    gloss: "THE",
    frames: [
      { landmarks: { pose: pose(0,0,0.04,-0.06,0.08,-0.14), rightHand: fist(0.73,0.40,0.014), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0.06,-0.06,0.12,-0.14), rightHand: fist(0.77,0.40,0.014), leftHand: restLeft }},
    ]
  },
  "is": {
    gloss: "IS",
    frames: [
      { landmarks: { pose: pose(0,0,0,-0.08,0,-0.18), rightHand: fist(0.65,0.36,0.012), leftHand: restLeft }},
      { landmarks: { pose: pose(0,0,0.02,-0.06,0.04,-0.14), rightHand: fist(0.69,0.40,0.012), leftHand: restLeft }},
    ]
  },
  "and": {
    gloss: "AND",
    frames: [
      { landmarks: { pose: NP, rightHand: openHand(0.62,0.46,0.016), leftHand: restLeft }},
      { landmarks: { pose: NP, rightHand: fist(0.64,0.46,0.014), leftHand: restLeft }},
    ]
  },
  "i": {
    gloss: "I/ME",
    frames: [
      { landmarks: { pose: pose(0,0,-0.06,-0.04,-0.14,-0.04), rightHand: fist(0.51,0.50,0.014), leftHand: restLeft }},
    ]
  },
};

module.exports = dictionary;
