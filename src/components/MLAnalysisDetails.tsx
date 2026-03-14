import { motion } from "framer-motion";
import { Brain, BarChart3, Target, Cpu } from "lucide-react";
import { PredictionResponse, STRESS_LEVELS, StressLevel } from "@/ml/types";

interface MLAnalysisDetailsProps {
  prediction: PredictionResponse;
}

const levelColors: Record<StressLevel, string> = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-destructive",
};

export const MLAnalysisDetails = ({ prediction }: MLAnalysisDetailsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="p-6 bg-card/50 rounded-2xl border border-border/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">ML Classification Details</h3>
      </div>

      {/* Model Info */}
      <div className="mb-4 p-3 bg-muted/50 rounded-lg flex items-center gap-2">
        <Cpu className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Model: {prediction.model_used} • 75-sample dataset • 8 features • 3 stress classes
        </span>
      </div>

      {/* Class Probabilities */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Class Probabilities</span>
        </div>
        <div className="space-y-2">
          {STRESS_LEVELS.map((level) => (
            <div key={level} className="flex items-center gap-3">
              <span className="w-16 text-sm text-foreground">{level}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(prediction.probabilities[level] || 0) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className={`h-full ${levelColors[level]}`}
                />
              </div>
              <span className="w-14 text-sm text-right text-muted-foreground">
                {((prediction.probabilities[level] || 0) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Prediction Confidence</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${prediction.confidence * 100}%` }}
              transition={{ duration: 0.6 }}
              className="h-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
          <span className="font-semibold text-foreground">{(prediction.confidence * 100).toFixed(1)}%</span>
        </div>
      </div>
    </motion.div>
  );
};
