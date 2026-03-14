/**
 * Multinomial Logistic Regression (Softmax Regression)
 * 
 * Algorithm: Learns weight vectors for each class using gradient descent.
 * Uses softmax to convert raw scores into probabilities:
 *   P(class_k|X) = exp(W_k · X + b_k) / Σ exp(W_j · X + b_j)
 * 
 * Training uses mini-batch gradient descent with cross-entropy loss.
 */

import { FeatureVector, StressLevel, STRESS_LEVELS, PredictionResult } from './types';

export class LogisticRegression {
  private weights: number[][] = [];  // [numClasses x numFeatures]
  private biases: number[] = [];     // [numClasses]
  private learningRate = 0.1;
  private epochs = 200;

  /** Softmax function converts raw scores to probabilities */
  private softmax(scores: number[]): number[] {
    const maxScore = Math.max(...scores);
    const exps = scores.map(s => Math.exp(s - maxScore));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  }

  /** Compute raw scores for each class */
  private computeScores(x: FeatureVector): number[] {
    return this.weights.map((w, c) =>
      w.reduce((sum, wi, f) => sum + wi * x[f], 0) + this.biases[c]
    );
  }

  /** Train the model using gradient descent on cross-entropy loss */
  train(X: FeatureVector[], y: StressLevel[]): void {
    const numFeatures = X[0].length;
    const numClasses = STRESS_LEVELS.length;

    // Initialize weights with small random values
    this.weights = Array.from({ length: numClasses }, () =>
      Array.from({ length: numFeatures }, () => (Math.random() - 0.5) * 0.1)
    );
    this.biases = new Array(numClasses).fill(0);

    // One-hot encode labels
    const yEncoded = y.map(label => {
      const idx = STRESS_LEVELS.indexOf(label);
      const vec = new Array(numClasses).fill(0);
      vec[idx] = 1;
      return vec;
    });

    // Gradient descent
    for (let epoch = 0; epoch < this.epochs; epoch++) {
      const lr = this.learningRate / (1 + epoch * 0.01); // Learning rate decay

      for (let i = 0; i < X.length; i++) {
        const scores = this.computeScores(X[i]);
        const probs = this.softmax(scores);

        // Update weights: W_k -= lr * (prob_k - y_k) * x
        for (let c = 0; c < numClasses; c++) {
          const error = probs[c] - yEncoded[i][c];
          for (let f = 0; f < numFeatures; f++) {
            this.weights[c][f] -= lr * error * X[i][f];
          }
          this.biases[c] -= lr * error;
        }
      }
    }
  }

  /** Predict stress level for a feature vector */
  predict(features: FeatureVector): PredictionResult {
    const scores = this.computeScores(features);
    const probabilities = this.softmax(scores);

    let bestIdx = 0;
    for (let i = 1; i < probabilities.length; i++) {
      if (probabilities[i] > probabilities[bestIdx]) bestIdx = i;
    }

    const probMap: Record<StressLevel, number> = { Low: 0, Medium: 0, High: 0 };
    STRESS_LEVELS.forEach((l, i) => { probMap[l] = probabilities[i]; });

    return {
      stress_level: STRESS_LEVELS[bestIdx],
      confidence: probabilities[bestIdx],
      probabilities: probMap,
    };
  }

  /** Export model parameters */
  exportParams() {
    return { weights: this.weights, biases: this.biases };
  }

  /** Import model parameters */
  importParams(params: { weights: number[][]; biases: number[] }) {
    this.weights = params.weights;
    this.biases = params.biases;
  }
}
