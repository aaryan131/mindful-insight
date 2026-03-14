/**
 * Gaussian Naive Bayes Classifier
 * 
 * Algorithm: For each class, computes the mean and standard deviation of each feature.
 * Prediction uses Bayes' theorem with Gaussian class-conditional densities:
 *   P(class|X) ∝ P(class) × ∏ P(Xi|class)
 * where P(Xi|class) = Gaussian(Xi; μ, σ) for feature i.
 */

import { FeatureVector, StressLevel, STRESS_LEVELS, PredictionResult } from './types';

interface GaussianParams {
  mean: number;
  std: number;
}

interface ClassParams {
  prior: number;
  features: GaussianParams[];
}

export class GaussianNaiveBayes {
  private classParams: Map<StressLevel, ClassParams> = new Map();

  /** Train the model on labeled feature vectors */
  train(X: FeatureVector[], y: StressLevel[]): void {
    const n = X.length;
    const numFeatures = X[0].length;

    for (const level of STRESS_LEVELS) {
      // Filter data for this class
      const classIndices = y.map((label, i) => label === level ? i : -1).filter(i => i >= 0);
      const classX = classIndices.map(i => X[i]);
      const prior = classX.length / n;

      // Compute mean and std for each feature
      const features: GaussianParams[] = [];
      for (let f = 0; f < numFeatures; f++) {
        const values = classX.map(row => row[f]);
        const mean = values.reduce((s, v) => s + v, 0) / values.length;
        const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
        features.push({ mean, std: Math.sqrt(variance) + 1e-6 });
      }

      this.classParams.set(level, { prior, features });
    }
  }

  /** Predict stress level for a feature vector */
  predict(features: FeatureVector): PredictionResult {
    const logProbs: number[] = [];

    for (const level of STRESS_LEVELS) {
      const params = this.classParams.get(level)!;
      let logProb = Math.log(params.prior);

      for (let f = 0; f < features.length; f++) {
        const { mean, std } = params.features[f];
        const exponent = -((features[f] - mean) ** 2) / (2 * std ** 2);
        const pdf = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
        logProb += Math.log(pdf + 1e-300);
      }

      logProbs.push(logProb);
    }

    // Log-sum-exp normalization
    const maxLog = Math.max(...logProbs);
    const expProbs = logProbs.map(lp => Math.exp(lp - maxLog));
    const sumExp = expProbs.reduce((s, v) => s + v, 0);
    const probabilities = expProbs.map(ep => ep / sumExp);

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

  /** Export model parameters for serialization */
  exportParams(): Record<string, ClassParams> {
    const result: Record<string, ClassParams> = {};
    this.classParams.forEach((v, k) => { result[k] = v; });
    return result;
  }

  /** Import model parameters from serialized data */
  importParams(params: Record<string, ClassParams>): void {
    this.classParams = new Map();
    for (const [k, v] of Object.entries(params)) {
      this.classParams.set(k as StressLevel, v);
    }
  }
}
