/**
 * Shared types for the ML stress prediction system.
 * 
 * Features correspond to the 8 questionnaire dimensions mapped on a 1-5 scale.
 * The target label (stress_level) is one of "Low", "Medium", or "High".
 */

/** Feature names matching the dataset columns */
export const FEATURE_NAMES = [
  'sleep_quality',
  'work_pressure',
  'academic_pressure',
  'concentration_difficulty',
  'emotional_instability',
  'irritability',
  'fatigue',
  'work_life_balance',
] as const;

export type FeatureName = typeof FEATURE_NAMES[number];

/** The three stress levels predicted by the model */
export type StressLevel = 'Low' | 'Medium' | 'High';
export const STRESS_LEVELS: StressLevel[] = ['Low', 'Medium', 'High'];

/** A single data point from the dataset */
export interface DataPoint {
  sleep_quality: number;
  work_pressure: number;
  academic_pressure: number;
  concentration_difficulty: number;
  emotional_instability: number;
  irritability: number;
  fatigue: number;
  work_life_balance: number;
  stress_level: StressLevel;
}

/** Numeric feature vector (order matches FEATURE_NAMES) */
export type FeatureVector = number[];

/** Result of a single model prediction */
export interface PredictionResult {
  stress_level: StressLevel;
  confidence: number;
  probabilities: Record<StressLevel, number>;
}

/** Evaluation metrics for a model */
export interface EvaluationMetrics {
  accuracy: number;
  precision: Record<StressLevel, number>;
  recall: Record<StressLevel, number>;
  f1: Record<StressLevel, number>;
  confusionMatrix: number[][];
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
}

/** A trained model with its metadata */
export interface TrainedModel {
  name: string;
  predict: (features: FeatureVector) => PredictionResult;
  metrics: EvaluationMetrics;
}

/** Response from the prediction API */
export interface PredictionResponse {
  stress_level: StressLevel;
  confidence: number;
  model_used: string;
  probabilities: Record<StressLevel, number>;
  contributing_factors: { feature: string; value: number; impact: string }[];
}
