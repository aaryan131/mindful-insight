import { motion } from "framer-motion";
import { Brain, BarChart3, Database, Target, Activity } from "lucide-react";
import { ClassificationResult, StressLevel } from "@/lib/stressClassifier";
import { FEATURE_NAMES } from "@/lib/dataset";

interface MLAnalysisDetailsProps {
  result: ClassificationResult;
}

const levelColors: Record<StressLevel, { bar: string }> = {
  Low: { bar: "bg-emerald-500" },
  Mild: { bar: "bg-accent" },
  Moderate: { bar: "bg-primary" },
  High: { bar: "bg-orange-500" },
  "Very High": { bar: "bg-destructive" },
};

export const MLAnalysisDetails = ({ result }: MLAnalysisDetailsProps) => {
  const { features, probabilities, confidence, nearestNeighbors } = result;
  const featureKeys = Object.keys(FEATURE_NAMES) as (keyof typeof FEATURE_NAMES)[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-6 p-6 bg-card/50 rounded-2xl border border-border/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Gaussian Naive Bayes Analysis</h3>
      </div>

      {/* Dataset Info */}
      <div className="mb-4 p-3 bg-muted/50 rounded-lg flex items-center gap-2">
        <Database className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Trained on SaYoPillow dataset (Kaggle) • {nearestNeighbors} matching class samples • 8 physiological features
        </span>
      </div>

      {/* Classification Probabilities */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Class Probabilities</span>
        </div>
        <div className="space-y-2">
          {(Object.keys(probabilities) as StressLevel[]).map((level) => (
            <div key={level} className="flex items-center gap-3">
              <span className="w-20 text-sm text-foreground">{level}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${probabilities[level] * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className={`h-full ${levelColors[level].bar}`}
                />
              </div>
              <span className="w-12 text-sm text-right text-muted-foreground">
                {(probabilities[level] * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Model Confidence */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Model Confidence</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence * 100}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
          <span className="font-semibold text-foreground">{(confidence * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Mapped Physiological Features */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Estimated Physiological Features</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {featureKeys.map((key) => (
            <FeatureCard
              key={key}
              label={FEATURE_NAMES[key]}
              value={features[key as keyof typeof features]?.toFixed(1) ?? '-'}
            />
          ))}
        </div>
      </div>

      {/* Algorithm Info */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Gaussian Naive Bayes classifier trained on SaYoPillow dataset (Kaggle) • 65 training samples • 5 stress classes
        </p>
      </div>
    </motion.div>
  );
};

const FeatureCard = ({ label, value }: { label: string; value: string }) => (
  <div className="p-3 bg-muted/50 rounded-lg text-center">
    <div className="text-lg font-semibold text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground leading-tight">{label}</div>
  </div>
);
