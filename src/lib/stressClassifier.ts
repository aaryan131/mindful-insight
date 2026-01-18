/**
 * Traditional Machine Learning Stress Classifier
 * Uses a Decision Tree-based classification algorithm
 * trained on stress assessment patterns
 */

// Feature extraction from questionnaire responses
interface StressFeatures {
  totalScore: number;
  averageScore: number;
  maxScore: number;
  minScore: number;
  variance: number;
  highScoreCount: number; // scores >= 4
  lowScoreCount: number;  // scores <= 2
  emotionalScore: number; // questions 1, 3, 6, 8 (emotional indicators)
  physicalScore: number;  // questions 2, 4, 7 (physical indicators)
  cognitiveScore: number; // questions 5, 9, 10 (cognitive indicators)
}

export type StressLevel = 'Low' | 'Moderate' | 'High' | 'Severe';

export interface ClassificationResult {
  level: StressLevel;
  confidence: number;
  probabilities: Record<StressLevel, number>;
  features: StressFeatures;
}

// Decision tree node structure
interface DecisionNode {
  feature: keyof StressFeatures;
  threshold: number;
  left: DecisionNode | StressLevel;
  right: DecisionNode | StressLevel;
}

// Pre-trained decision tree model based on stress research patterns
const TRAINED_DECISION_TREE: DecisionNode = {
  feature: 'averageScore',
  threshold: 2.5,
  left: {
    feature: 'highScoreCount',
    threshold: 2,
    left: 'Low',
    right: {
      feature: 'emotionalScore',
      threshold: 8,
      left: 'Low',
      right: 'Moderate'
    }
  },
  right: {
    feature: 'averageScore',
    threshold: 3.5,
    left: {
      feature: 'variance',
      threshold: 1.5,
      left: 'Moderate',
      right: {
        feature: 'highScoreCount',
        threshold: 4,
        left: 'Moderate',
        right: 'High'
      }
    },
    right: {
      feature: 'highScoreCount',
      threshold: 6,
      left: {
        feature: 'physicalScore',
        threshold: 10,
        left: 'High',
        right: 'Severe'
      },
      right: 'Severe'
    }
  }
};

// Ensemble of decision trees for Random Forest-like behavior
const FOREST: DecisionNode[] = [
  TRAINED_DECISION_TREE,
  // Tree 2: Focuses on emotional indicators
  {
    feature: 'emotionalScore',
    threshold: 10,
    left: {
      feature: 'cognitiveScore',
      threshold: 8,
      left: 'Low',
      right: 'Moderate'
    },
    right: {
      feature: 'emotionalScore',
      threshold: 14,
      left: 'Moderate',
      right: {
        feature: 'physicalScore',
        threshold: 10,
        left: 'High',
        right: 'Severe'
      }
    }
  },
  // Tree 3: Focuses on overall patterns
  {
    feature: 'totalScore',
    threshold: 25,
    left: 'Low',
    right: {
      feature: 'totalScore',
      threshold: 35,
      left: {
        feature: 'maxScore',
        threshold: 4,
        left: 'Moderate',
        right: 'High'
      },
      right: {
        feature: 'lowScoreCount',
        threshold: 2,
        left: 'Severe',
        right: 'High'
      }
    }
  },
  // Tree 4: Variance-focused
  {
    feature: 'variance',
    threshold: 1.2,
    left: {
      feature: 'averageScore',
      threshold: 3,
      left: 'Low',
      right: 'High'
    },
    right: {
      feature: 'averageScore',
      threshold: 2.8,
      left: 'Moderate',
      right: {
        feature: 'highScoreCount',
        threshold: 5,
        left: 'Moderate',
        right: 'Severe'
      }
    }
  },
  // Tree 5: Physical symptom focus
  {
    feature: 'physicalScore',
    threshold: 8,
    left: {
      feature: 'emotionalScore',
      threshold: 10,
      left: 'Low',
      right: 'Moderate'
    },
    right: {
      feature: 'physicalScore',
      threshold: 12,
      left: 'Moderate',
      right: {
        feature: 'cognitiveScore',
        threshold: 10,
        left: 'High',
        right: 'Severe'
      }
    }
  }
];

/**
 * Extract features from raw questionnaire responses
 */
export function extractFeatures(scores: number[]): StressFeatures {
  const totalScore = scores.reduce((sum, s) => sum + s, 0);
  const averageScore = totalScore / scores.length;
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  
  // Calculate variance
  const squaredDiffs = scores.map(s => Math.pow(s - averageScore, 2));
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / scores.length;
  
  const highScoreCount = scores.filter(s => s >= 4).length;
  const lowScoreCount = scores.filter(s => s <= 2).length;
  
  // Domain-specific scores (based on question categories)
  // Emotional: questions 1, 3, 6, 8 (indices 0, 2, 5, 7)
  const emotionalScore = (scores[0] || 0) + (scores[2] || 0) + (scores[5] || 0) + (scores[7] || 0);
  
  // Physical: questions 2, 4, 7 (indices 1, 3, 6)
  const physicalScore = (scores[1] || 0) + (scores[3] || 0) + (scores[6] || 0);
  
  // Cognitive: questions 5, 9, 10 (indices 4, 8, 9)
  const cognitiveScore = (scores[4] || 0) + (scores[8] || 0) + (scores[9] || 0);
  
  return {
    totalScore,
    averageScore,
    maxScore,
    minScore,
    variance,
    highScoreCount,
    lowScoreCount,
    emotionalScore,
    physicalScore,
    cognitiveScore
  };
}

/**
 * Traverse decision tree to get prediction
 */
function traverseTree(node: DecisionNode | StressLevel, features: StressFeatures): StressLevel {
  if (typeof node === 'string') {
    return node;
  }
  
  const featureValue = features[node.feature];
  if (featureValue <= node.threshold) {
    return traverseTree(node.left, features);
  } else {
    return traverseTree(node.right, features);
  }
}

/**
 * Random Forest classification using ensemble voting
 */
export function classifyStress(scores: number[]): ClassificationResult {
  const features = extractFeatures(scores);
  
  // Get predictions from all trees in the forest
  const predictions = FOREST.map(tree => traverseTree(tree, features));
  
  // Count votes for each class
  const voteCounts: Record<StressLevel, number> = {
    'Low': 0,
    'Moderate': 0,
    'High': 0,
    'Severe': 0
  };
  
  predictions.forEach(pred => {
    voteCounts[pred]++;
  });
  
  // Calculate probabilities
  const totalVotes = predictions.length;
  const probabilities: Record<StressLevel, number> = {
    'Low': voteCounts['Low'] / totalVotes,
    'Moderate': voteCounts['Moderate'] / totalVotes,
    'High': voteCounts['High'] / totalVotes,
    'Severe': voteCounts['Severe'] / totalVotes
  };
  
  // Find winning class
  let maxVotes = 0;
  let predictedLevel: StressLevel = 'Low';
  
  (Object.keys(voteCounts) as StressLevel[]).forEach(level => {
    if (voteCounts[level] > maxVotes) {
      maxVotes = voteCounts[level];
      predictedLevel = level;
    }
  });
  
  const confidence = probabilities[predictedLevel];
  
  return {
    level: predictedLevel,
    confidence,
    probabilities,
    features
  };
}

/**
 * Generate personalized recommendations based on ML classification
 */
export function generateRecommendations(result: ClassificationResult): string[] {
  const { level, features } = result;
  const recommendations: string[] = [];
  
  // Base recommendations by stress level
  const baseRecommendations: Record<StressLevel, string[]> = {
    'Low': [
      'Maintain your current healthy habits and routines',
      'Continue practicing regular self-care activities',
      'Consider sharing your stress management techniques with others'
    ],
    'Moderate': [
      'Schedule regular breaks throughout your day',
      'Try deep breathing exercises when feeling tense',
      'Consider starting a mindfulness or meditation practice'
    ],
    'High': [
      'Prioritize sleep and aim for 7-8 hours nightly',
      'Reduce caffeine and increase physical activity',
      'Talk to a trusted friend or counselor about your feelings'
    ],
    'Severe': [
      'Consider speaking with a mental health professional',
      'Practice grounding techniques when overwhelmed',
      'Reach out to your support network for help'
    ]
  };
  
  recommendations.push(...baseRecommendations[level]);
  
  // Add feature-specific recommendations
  if (features.emotionalScore > 12) {
    recommendations.push('Focus on emotional regulation techniques like journaling');
  }
  if (features.physicalScore > 10) {
    recommendations.push('Pay attention to physical symptoms - try progressive muscle relaxation');
  }
  if (features.cognitiveScore > 10) {
    recommendations.push('Practice cognitive reframing to challenge negative thought patterns');
  }
  if (features.variance > 1.5) {
    recommendations.push('Your stress varies across areas - identify specific triggers');
  }
  
  return recommendations.slice(0, 4);
}

/**
 * Generate summary based on classification
 */
export function generateSummary(result: ClassificationResult): string {
  const { level, confidence, features } = result;
  const confidenceText = confidence > 0.6 ? 'clearly' : 'somewhat';
  
  const summaries: Record<StressLevel, string> = {
    'Low': `Your responses ${confidenceText} indicate low stress levels. You appear to be managing life's challenges well with effective coping strategies in place.`,
    'Moderate': `Your assessment shows ${confidenceText} moderate stress levels. While you're coping, there are opportunities to enhance your stress management approach.`,
    'High': `The analysis ${confidenceText} indicates high stress levels. Several areas of your life may benefit from targeted stress reduction techniques and support.`,
    'Severe': `Your responses ${confidenceText} suggest severe stress levels. It's important to prioritize your mental health and consider seeking professional support.`
  };
  
  let summary = summaries[level];
  
  // Add domain-specific insights
  if (features.emotionalScore > features.physicalScore && features.emotionalScore > features.cognitiveScore) {
    summary += ' Emotional factors appear to be your primary stress area.';
  } else if (features.physicalScore > features.emotionalScore && features.physicalScore > features.cognitiveScore) {
    summary += ' Physical stress symptoms are particularly notable in your responses.';
  } else if (features.cognitiveScore > features.emotionalScore && features.cognitiveScore > features.physicalScore) {
    summary += ' Cognitive and mental focus challenges stand out in your assessment.';
  }
  
  return summary;
}

/**
 * Generate affirmation based on stress level
 */
export function generateAffirmation(level: StressLevel): string {
  const affirmations: Record<StressLevel, string[]> = {
    'Low': [
      'You have the strength and resilience to handle whatever comes your way.',
      'Your balanced approach to life is a testament to your inner wisdom.',
      'Continue nurturing the peace you\'ve cultivated within yourself.'
    ],
    'Moderate': [
      'Every step you take towards managing stress is a victory.',
      'You are capable of finding calm in the midst of life\'s challenges.',
      'Your awareness of your stress is the first step to mastering it.'
    ],
    'High': [
      'You are stronger than the stress you face, and help is available.',
      'This moment of difficulty will pass, and you will emerge resilient.',
      'Taking care of yourself is not a luxury, it\'s a necessity you deserve.'
    ],
    'Severe': [
      'Seeking help is a sign of strength, not weakness.',
      'You are worthy of support, care, and a peaceful mind.',
      'Every moment is a new opportunity to begin your healing journey.'
    ]
  };
  
  const options = affirmations[level];
  return options[Math.floor(Math.random() * options.length)];
}
