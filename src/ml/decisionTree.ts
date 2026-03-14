/**
 * Decision Tree Classifier (CART — Classification and Regression Trees)
 * 
 * Algorithm: Recursively splits data by the feature/threshold that maximizes
 * information gain (reduction in Gini impurity). Builds a binary tree of
 * decision rules for classification.
 * 
 * Also includes a simplified Random Forest: an ensemble of decision trees
 * trained on bootstrapped samples, with majority voting for predictions.
 */

import { FeatureVector, StressLevel, STRESS_LEVELS, PredictionResult } from './types';

interface TreeNode {
  featureIndex?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  prediction?: StressLevel;
  classCounts?: Record<StressLevel, number>;
}

export class DecisionTree {
  private root: TreeNode | null = null;
  private maxDepth: number;
  private minSamples: number;

  constructor(maxDepth = 8, minSamples = 2) {
    this.maxDepth = maxDepth;
    this.minSamples = minSamples;
  }

  /** Compute Gini impurity for a set of labels */
  private giniImpurity(labels: StressLevel[]): number {
    if (labels.length === 0) return 0;
    let impurity = 1;
    for (const level of STRESS_LEVELS) {
      const p = labels.filter(l => l === level).length / labels.length;
      impurity -= p * p;
    }
    return impurity;
  }

  /** Find the best split for the data */
  private findBestSplit(X: FeatureVector[], y: StressLevel[]): { featureIndex: number; threshold: number; gain: number } | null {
    const n = X.length;
    const numFeatures = X[0].length;
    const parentGini = this.giniImpurity(y);

    let bestGain = 0;
    let bestFeature = -1;
    let bestThreshold = 0;

    for (let f = 0; f < numFeatures; f++) {
      // Get unique sorted values for this feature
      const values = [...new Set(X.map(row => row[f]))].sort((a, b) => a - b);

      for (let i = 0; i < values.length - 1; i++) {
        const threshold = (values[i] + values[i + 1]) / 2;

        const leftY = y.filter((_, idx) => X[idx][f] <= threshold);
        const rightY = y.filter((_, idx) => X[idx][f] > threshold);

        if (leftY.length < this.minSamples || rightY.length < this.minSamples) continue;

        // Information gain = parent_gini - weighted_child_gini
        const gain = parentGini
          - (leftY.length / n) * this.giniImpurity(leftY)
          - (rightY.length / n) * this.giniImpurity(rightY);

        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = f;
          bestThreshold = threshold;
        }
      }
    }

    if (bestFeature === -1) return null;
    return { featureIndex: bestFeature, threshold: bestThreshold, gain: bestGain };
  }

  /** Recursively build the tree */
  private buildTree(X: FeatureVector[], y: StressLevel[], depth: number): TreeNode {
    // Count classes
    const classCounts: Record<StressLevel, number> = { Low: 0, Medium: 0, High: 0 };
    y.forEach(l => classCounts[l]++);

    // Majority class
    const prediction = STRESS_LEVELS.reduce((a, b) => classCounts[a] >= classCounts[b] ? a : b);

    // Stopping conditions: max depth, pure node, or not enough samples
    if (depth >= this.maxDepth || new Set(y).size === 1 || X.length < this.minSamples * 2) {
      return { prediction, classCounts };
    }

    const split = this.findBestSplit(X, y);
    if (!split || split.gain < 1e-6) {
      return { prediction, classCounts };
    }

    // Split data
    const leftIndices = X.map((row, i) => row[split.featureIndex] <= split.threshold ? i : -1).filter(i => i >= 0);
    const rightIndices = X.map((row, i) => row[split.featureIndex] > split.threshold ? i : -1).filter(i => i >= 0);

    return {
      featureIndex: split.featureIndex,
      threshold: split.threshold,
      left: this.buildTree(leftIndices.map(i => X[i]), leftIndices.map(i => y[i]), depth + 1),
      right: this.buildTree(rightIndices.map(i => X[i]), rightIndices.map(i => y[i]), depth + 1),
      classCounts,
    };
  }

  /** Train the decision tree */
  train(X: FeatureVector[], y: StressLevel[]): void {
    this.root = this.buildTree(X, y, 0);
  }

  /** Traverse the tree to make a prediction */
  private traverse(node: TreeNode, features: FeatureVector): TreeNode {
    if (node.prediction !== undefined && !node.left && !node.right) {
      return node;
    }
    if (node.featureIndex !== undefined && node.threshold !== undefined) {
      if (features[node.featureIndex] <= node.threshold) {
        return node.left ? this.traverse(node.left, features) : node;
      }
      return node.right ? this.traverse(node.right, features) : node;
    }
    return node;
  }

  /** Predict stress level */
  predict(features: FeatureVector): PredictionResult {
    if (!this.root) throw new Error('Model not trained');

    const leaf = this.traverse(this.root, features);
    const counts = leaf.classCounts || { Low: 0, Medium: 0, High: 0 };
    const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;

    const probMap: Record<StressLevel, number> = {
      Low: counts.Low / total,
      Medium: counts.Medium / total,
      High: counts.High / total,
    };

    const prediction = leaf.prediction || 'Medium';

    return {
      stress_level: prediction,
      confidence: probMap[prediction],
      probabilities: probMap,
    };
  }
}

/**
 * Random Forest: An ensemble of decision trees trained on bootstrapped samples.
 * Final prediction is the majority vote across all trees.
 */
export class RandomForest {
  private trees: DecisionTree[] = [];
  private numTrees: number;

  constructor(numTrees = 10) {
    this.numTrees = numTrees;
  }

  /** Bootstrap sample: randomly sample with replacement */
  private bootstrap(X: FeatureVector[], y: StressLevel[]): { X: FeatureVector[]; y: StressLevel[] } {
    const n = X.length;
    const sampledX: FeatureVector[] = [];
    const sampledY: StressLevel[] = [];
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * n);
      sampledX.push(X[idx]);
      sampledY.push(y[idx]);
    }
    return { X: sampledX, y: sampledY };
  }

  /** Train all trees on bootstrapped samples */
  train(X: FeatureVector[], y: StressLevel[]): void {
    this.trees = [];
    for (let t = 0; t < this.numTrees; t++) {
      const sample = this.bootstrap(X, y);
      const tree = new DecisionTree(6, 2); // Shallower trees for ensemble
      tree.train(sample.X, sample.y);
      this.trees.push(tree);
    }
  }

  /** Predict by majority vote across all trees */
  predict(features: FeatureVector): PredictionResult {
    const votes: Record<StressLevel, number> = { Low: 0, Medium: 0, High: 0 };
    const probSums: Record<StressLevel, number> = { Low: 0, Medium: 0, High: 0 };

    for (const tree of this.trees) {
      const result = tree.predict(features);
      votes[result.stress_level]++;
      for (const level of STRESS_LEVELS) {
        probSums[level] += result.probabilities[level];
      }
    }

    // Average probabilities
    const probMap: Record<StressLevel, number> = { Low: 0, Medium: 0, High: 0 };
    for (const level of STRESS_LEVELS) {
      probMap[level] = probSums[level] / this.trees.length;
    }

    const prediction = STRESS_LEVELS.reduce((a, b) => votes[a] >= votes[b] ? a : b);

    return {
      stress_level: prediction,
      confidence: probMap[prediction],
      probabilities: probMap,
    };
  }
}
