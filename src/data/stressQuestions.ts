/**
 * Stress Assessment Questionnaire
 * 
 * Each question maps to one or more features in the ML dataset:
 * Q1 → work_pressure
 * Q2 → sleep_quality (inverted)
 * Q3 → irritability
 * Q4 → fatigue (physical tension)
 * Q5 → concentration_difficulty
 * Q6 → work_life_balance (inverted)
 * Q7 → emotional_instability (anxiety)
 * Q8 → fatigue (unhealthy eating)
 * Q9 → emotional_instability (disconnection)
 * Q10 → academic_pressure
 */
export const stressQuestions = [
  {
    id: 1,
    question: "How often do you feel overwhelmed by your daily responsibilities?",
    category: "work-life",
    feature: "work_pressure",
  },
  {
    id: 2,
    question: "How frequently do you have trouble sleeping due to worrying thoughts?",
    category: "sleep",
    feature: "sleep_quality",
  },
  {
    id: 3,
    question: "How often do you feel irritable or short-tempered without a clear reason?",
    category: "emotional",
    feature: "irritability",
  },
  {
    id: 4,
    question: "How frequently do you experience physical tension (headaches, muscle tightness)?",
    category: "physical",
    feature: "fatigue",
  },
  {
    id: 5,
    question: "How often do you find it difficult to concentrate or make decisions?",
    category: "cognitive",
    feature: "concentration_difficulty",
  },
  {
    id: 6,
    question: "How frequently do you feel like you don't have enough time for yourself?",
    category: "work-life",
    feature: "work_life_balance",
  },
  {
    id: 7,
    question: "How often do you feel anxious about the future or upcoming events?",
    category: "emotional",
    feature: "emotional_instability",
  },
  {
    id: 8,
    question: "How frequently do you skip meals or eat unhealthily due to stress?",
    category: "physical",
    feature: "fatigue",
  },
  {
    id: 9,
    question: "How often do you feel disconnected from friends or family?",
    category: "social",
    feature: "emotional_instability",
  },
  {
    id: 10,
    question: "How frequently do you feel like your efforts go unrecognized or unappreciated?",
    category: "emotional",
    feature: "academic_pressure",
  },
];
