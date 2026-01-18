import { motion } from "framer-motion";
import { Brain, BarChart3, GitBranch, Target } from "lucide-react";
import { ClassificationResult, StressLevel } from "@/lib/stressClassifier";

interface MLAnalysisDetailsProps {
  result: ClassificationResult;
}

const levelColors: Record<StressLevel, { bg: string; text: string; bar: string }> = {
  Low: { bg: "bg-accent/20", text: "text-accent-foreground", bar: "bg-accent" },
  Moderate: { bg: "bg-primary/20", text: "text-primary", bar: "bg-primary" },
  High: { bg: "bg-orange-100", text: "text-orange-700", bar: "bg-orange-500" },
  Severe: { bg: "bg-destructive/20", text: "text-destructive", bar: "bg-destructive" },
};

export const MLAnalysisDetails = ({ result }: MLAnalysisDetailsProps) => {
  const { features, probabilities, confidence } = result;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-6 p-6 bg-card/50 rounded-2xl border border-border/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Machine Learning Analysis</h3>
      </div>
      
      {/* Classification Probabilities */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Classification Probabilities</span>
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
                  className={levelColors[level].bar}
                />
              </div>
              <span className="w-12 text-sm text-right text-muted-foreground">
                {(probabilities[level] * 100).toFixed(0)}%
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
          <span className="font-semibold text-foreground">{(confidence * 100).toFixed(0)}%</span>
        </div>
      </div>
      
      {/* Feature Extraction */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Extracted Features</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <FeatureCard label="Total Score" value={features.totalScore.toString()} />
          <FeatureCard label="Average" value={features.averageScore.toFixed(2)} />
          <FeatureCard label="Variance" value={features.variance.toFixed(2)} />
          <FeatureCard label="Emotional" value={features.emotionalScore.toString()} />
          <FeatureCard label="Physical" value={features.physicalScore.toString()} />
          <FeatureCard label="Cognitive" value={features.cognitiveScore.toString()} />
        </div>
      </div>
      
      {/* Algorithm Info */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Classification performed using Random Forest algorithm with 5 decision trees
        </p>
      </div>
    </motion.div>
  );
};

const FeatureCard = ({ label, value }: { label: string; value: string }) => (
  <div className="p-3 bg-muted/50 rounded-lg text-center">
    <div className="text-lg font-semibold text-foreground">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);
