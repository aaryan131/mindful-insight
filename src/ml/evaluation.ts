/**
 * ML Model Evaluation Module
 * 
 * Computes standard classification metrics:
 * - Accuracy: percentage of correct predictions
 * - Precision: TP / (TP + FP) per class
 * - Recall: TP / (TP + FN) per class
 * - F1 Score: harmonic mean of precision and recall
 * - Confusion Matrix: actual vs predicted class counts
 */

import { StressLevel, STRESS_LEVELS, EvaluationMetrics } from './types';

/**
 * Evaluate predictions against true labels.
 * @param yTrue - Array of true stress levels
 * @param yPred - Array of predicted stress levels
 * @returns Complete evaluation metrics
 */
export function evaluateModel(yTrue: StressLevel[], yPred: StressLevel[]): EvaluationMetrics {
  const n = yTrue.length;
  const numClasses = STRESS_LEVELS.length;

  // Build confusion matrix [actual][predicted]
  const confusionMatrix: number[][] = Array.from({ length: numClasses }, () =>
    new Array(numClasses).fill(0)
  );

  for (let i = 0; i < n; i++) {
    const actual = STRESS_LEVELS.indexOf(yTrue[i]);
    const predicted = STRESS_LEVELS.indexOf(yPred[i]);
    confusionMatrix[actual][predicted]++;
  }

  // Accuracy
  let correct = 0;
  for (let i = 0; i < numClasses; i++) correct += confusionMatrix[i][i];
  const accuracy = correct / n;

  // Per-class precision, recall, F1
  const precision: Record<StressLevel, number> = { Low: 0, Medium: 0, High: 0 };
  const recall: Record<StressLevel, number> = { Low: 0, Medium: 0, High: 0 };
  const f1: Record<StressLevel, number> = { Low: 0, Medium: 0, High: 0 };

  for (let c = 0; c < numClasses; c++) {
    const level = STRESS_LEVELS[c];

    // True positives: diagonal
    const tp = confusionMatrix[c][c];

    // False positives: column sum minus TP
    let fp = 0;
    for (let r = 0; r < numClasses; r++) fp += confusionMatrix[r][c];
    fp -= tp;

    // False negatives: row sum minus TP
    let fn = 0;
    for (let p = 0; p < numClasses; p++) fn += confusionMatrix[c][p];
    fn -= tp;

    precision[level] = tp + fp > 0 ? tp / (tp + fp) : 0;
    recall[level] = tp + fn > 0 ? tp / (tp + fn) : 0;
    f1[level] = precision[level] + recall[level] > 0
      ? 2 * (precision[level] * recall[level]) / (precision[level] + recall[level])
      : 0;
  }

  // Macro averages
  const macroPrecision = STRESS_LEVELS.reduce((s, l) => s + precision[l], 0) / numClasses;
  const macroRecall = STRESS_LEVELS.reduce((s, l) => s + recall[l], 0) / numClasses;
  const macroF1 = STRESS_LEVELS.reduce((s, l) => s + f1[l], 0) / numClasses;

  return {
    accuracy,
    precision,
    recall,
    f1,
    confusionMatrix,
    macroPrecision,
    macroRecall,
    macroF1,
  };
}
