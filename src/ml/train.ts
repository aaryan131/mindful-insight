/**
 * ML Training Pipeline
 * 
 * This module orchestrates the full ML workflow:
 * 1. Load the stress dataset from JSON
 * 2. Normalize features to 0-1 range using min-max scaling
 * 3. Split data into 80% training / 20% testing sets
 * 4. Train three models: Logistic Regression, Gaussian Naive Bayes, Random Forest
 * 5. Evaluate each model on the test set
 * 6. Select the best model based on accuracy
 * 7. Export the trained pipeline for inference
 */

import dataset from './dataset.json';
import { DataPoint, FeatureVector, FEATURE_NAMES, StressLevel, TrainedModel, PredictionResult, PredictionResponse } from './types';
import { GaussianNaiveBayes } from './naiveBayes';
import { LogisticRegression } from './logisticRegression';
import { RandomForest } from './decisionTree';
import { evaluateModel } from './evaluation';

// ─── Data Preprocessing ───────────────────────────────────────────────

/** Extract feature vector from a data point in FEATURE_NAMES order */
function extractFeatures(point: DataPoint): FeatureVector {
  return FEATURE_NAMES.map(name => point[name]);
}

/** Min-max normalization parameters */
interface NormParams {
  min: number[];
  max: number[];
}

/** Compute normalization parameters from training data */
function computeNormParams(X: FeatureVector[]): NormParams {
  const numFeatures = X[0].length;
  const min = new Array(numFeatures).fill(Infinity);
  const max = new Array(numFeatures).fill(-Infinity);

  for (const row of X) {
    for (let f = 0; f < numFeatures; f++) {
      if (row[f] < min[f]) min[f] = row[f];
      if (row[f] > max[f]) max[f] = row[f];
    }
  }

  return { min, max };
}

/** Normalize a feature vector using precomputed params */
function normalize(x: FeatureVector, params: NormParams): FeatureVector {
  return x.map((val, f) => {
    const range = params.max[f] - params.min[f];
    return range > 0 ? (val - params.min[f]) / range : 0;
  });
}

/** Shuffle and split data into train/test sets */
function trainTestSplit(X: FeatureVector[], y: StressLevel[], testRatio = 0.2): {
  trainX: FeatureVector[]; trainY: StressLevel[];
  testX: FeatureVector[]; testY: StressLevel[];
} {
  // Deterministic shuffle using a seeded approach
  const indices = Array.from({ length: X.length }, (_, i) => i);
  // Simple seeded shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(((i * 2654435761) % 4294967296) / 4294967296 * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const splitIdx = Math.floor(X.length * (1 - testRatio));
  const trainIdx = indices.slice(0, splitIdx);
  const testIdx = indices.slice(splitIdx);

  return {
    trainX: trainIdx.map(i => X[i]),
    trainY: trainIdx.map(i => y[i]),
    testX: testIdx.map(i => X[i]),
    testY: testIdx.map(i => y[i]),
  };
}

// ─── Training Pipeline ────────────────────────────────────────────────

export interface TrainingResult {
  models: TrainedModel[];
  bestModel: TrainedModel;
  normParams: NormParams;
  datasetSize: number;
  trainSize: number;
  testSize: number;
}

/**
 * Run the full training pipeline:
 * - Loads dataset, normalizes, splits, trains 3 models, evaluates, picks best.
 */
export function trainPipeline(): TrainingResult {
  // 1. Load dataset
  const data = dataset as DataPoint[];

  // 2. Extract features and labels
  const X = data.map(extractFeatures);
  const y = data.map(d => d.stress_level);

  // 3. Compute normalization params and normalize
  const normParams = computeNormParams(X);
  const Xnorm = X.map(x => normalize(x, normParams));

  // 4. Split into train/test
  const { trainX, trainY, testX, testY } = trainTestSplit(Xnorm, y);

  // 5. Train models
  const nb = new GaussianNaiveBayes();
  nb.train(trainX, trainY);

  const lr = new LogisticRegression();
  lr.train(trainX, trainY);

  const rf = new RandomForest(15);
  rf.train(trainX, trainY);

  // 6. Evaluate models on test set
  const models: { name: string; predictor: { predict: (f: FeatureVector) => PredictionResult } }[] = [
    { name: 'Gaussian Naive Bayes', predictor: nb },
    { name: 'Logistic Regression', predictor: lr },
    { name: 'Random Forest', predictor: rf },
  ];

  const trainedModels: TrainedModel[] = models.map(({ name, predictor }) => {
    const predictions = testX.map(x => predictor.predict(x).stress_level);
    const metrics = evaluateModel(testY, predictions);

    return {
      name,
      predict: (features: FeatureVector) => predictor.predict(features),
      metrics,
    };
  });

  // 7. Select best model by accuracy
  const bestModel = trainedModels.reduce((a, b) =>
    a.metrics.accuracy >= b.metrics.accuracy ? a : b
  );

  return {
    models: trainedModels,
    bestModel,
    normParams,
    datasetSize: data.length,
    trainSize: trainX.length,
    testSize: testX.length,
  };
}

/**
 * Convert questionnaire answers (1-5 scale) to a feature vector and predict.
 * 
 * Question mapping to dataset features:
 * Q1 (overwhelmed) → work_pressure
 * Q2 (sleep trouble) → sleep_quality (inverted)
 * Q3 (irritability) → irritability
 * Q4 (physical tension) → fatigue
 * Q5 (concentration) → concentration_difficulty
 * Q6 (no time for self) → work_life_balance (inverted)
 * Q7 (anxiety) → emotional_instability
 * Q8 (unhealthy eating) → fatigue (combined)
 * Q9 (disconnected) → emotional_instability (combined)
 * Q10 (unappreciated) → academic_pressure
 */
export function predictFromAnswers(
  answers: number[],
  trainingResult: TrainingResult
): PredictionResponse {
  const { bestModel, normParams } = trainingResult;

  // Map 10 questionnaire answers to 8 dataset features
  const rawFeatures: FeatureVector = [
    6 - answers[1],                        // sleep_quality (inverted: high answer = poor sleep = low quality)
    answers[0],                             // work_pressure
    answers[9],                             // academic_pressure
    answers[4],                             // concentration_difficulty
    Math.round((answers[6] + answers[8]) / 2), // emotional_instability (avg of anxiety + disconnection)
    answers[2],                             // irritability
    Math.round((answers[3] + answers[7]) / 2), // fatigue (avg of physical tension + unhealthy eating)
    6 - answers[5],                        // work_life_balance (inverted)
  ];

  // Normalize using training params
  const normalizedFeatures = normalize(rawFeatures, normParams);

  // Predict
  const result = bestModel.predict(normalizedFeatures);

  // Identify contributing factors (features with highest deviation from "low stress" profile)
  const featureLabels = [
    'Sleep Quality', 'Work Pressure', 'Academic Pressure',
    'Concentration Difficulty', 'Emotional Instability', 'Irritability',
    'Fatigue', 'Work-Life Balance'
  ];

  const contributing_factors = rawFeatures
    .map((val, i) => ({
      feature: featureLabels[i],
      value: val,
      // For inverted features (sleep, work-life balance), high normalized = stressed
      impact: normalizedFeatures[i] > 0.6 ? 'High' : normalizedFeatures[i] > 0.3 ? 'Moderate' : 'Low',
    }))
    .sort((a, b) => {
      const impactOrder: Record<string, number> = { High: 3, Moderate: 2, Low: 1 };
      return (impactOrder[b.impact] || 0) - (impactOrder[a.impact] || 0);
    });

  return {
    stress_level: result.stress_level,
    confidence: result.confidence,
    model_used: bestModel.name,
    probabilities: result.probabilities,
    contributing_factors,
  };
}
