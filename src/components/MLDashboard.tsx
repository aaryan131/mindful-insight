/**
 * ML Dashboard Component
 * 
 * Displays model comparison, confusion matrix, accuracy metrics,
 * and evaluation scores for all trained ML models.
 */

import { motion } from "framer-motion";
import { BarChart3, Grid3X3, Award, TrendingUp } from "lucide-react";
import { TrainingResult } from "@/ml/train";
import { STRESS_LEVELS, StressLevel } from "@/ml/types";

interface MLDashboardProps {
  trainingResult: TrainingResult;
}

export const MLDashboard = ({ trainingResult }: MLDashboardProps) => {
  const { models, bestModel, datasetSize, trainSize, testSize } = trainingResult;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="p-6 bg-card rounded-2xl border border-border shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground text-lg">ML Model Dashboard</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-muted/50 rounded-xl">
            <div className="text-2xl font-bold text-foreground">{datasetSize}</div>
            <div className="text-xs text-muted-foreground">Total Samples</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-xl">
            <div className="text-2xl font-bold text-foreground">{trainSize}</div>
            <div className="text-xs text-muted-foreground">Training Set</div>
          </div>
          <div className="p-3 bg-muted/50 rounded-xl">
            <div className="text-2xl font-bold text-foreground">{testSize}</div>
            <div className="text-xs text-muted-foreground">Test Set</div>
          </div>
        </div>
      </div>

      {/* Model Accuracy Comparison */}
      <div className="p-6 bg-card rounded-2xl border border-border shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Model Accuracy Comparison</h3>
        </div>
        <div className="space-y-4">
          {models.map((model) => (
            <div key={model.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium flex items-center gap-2">
                  {model.name}
                  {model.name === bestModel.name && (
                    <Award className="w-4 h-4 text-primary" />
                  )}
                </span>
                <span className="text-muted-foreground font-semibold">
                  {(model.metrics.accuracy * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${model.metrics.accuracy * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`h-full rounded-full ${
                    model.name === bestModel.name
                      ? 'bg-gradient-to-r from-primary to-accent'
                      : 'bg-muted-foreground/30'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Metrics Table */}
      <div className="p-6 bg-card rounded-2xl border border-border shadow-card">
        <h3 className="font-semibold text-foreground mb-4">Evaluation Metrics (Best Model: {bestModel.name})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">Class</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Precision</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Recall</th>
                <th className="text-right py-2 text-muted-foreground font-medium">F1 Score</th>
              </tr>
            </thead>
            <tbody>
              {STRESS_LEVELS.map((level) => (
                <tr key={level} className="border-b border-border/50">
                  <td className="py-2 text-foreground font-medium">{level}</td>
                  <td className="py-2 text-right text-foreground">
                    {(bestModel.metrics.precision[level] * 100).toFixed(1)}%
                  </td>
                  <td className="py-2 text-right text-foreground">
                    {(bestModel.metrics.recall[level] * 100).toFixed(1)}%
                  </td>
                  <td className="py-2 text-right text-foreground">
                    {(bestModel.metrics.f1[level] * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-2 text-foreground">Macro Avg</td>
                <td className="py-2 text-right text-foreground">
                  {(bestModel.metrics.macroPrecision * 100).toFixed(1)}%
                </td>
                <td className="py-2 text-right text-foreground">
                  {(bestModel.metrics.macroRecall * 100).toFixed(1)}%
                </td>
                <td className="py-2 text-right text-foreground">
                  {(bestModel.metrics.macroF1 * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix */}
      <div className="p-6 bg-card rounded-2xl border border-border shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Grid3X3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Confusion Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead>
              <tr>
                <th className="py-2 text-muted-foreground text-xs">Actual ↓ / Predicted →</th>
                {STRESS_LEVELS.map(l => (
                  <th key={l} className="py-2 text-muted-foreground font-medium">{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STRESS_LEVELS.map((level, rowIdx) => (
                <tr key={level}>
                  <td className="py-2 text-foreground font-medium">{level}</td>
                  {bestModel.metrics.confusionMatrix[rowIdx]?.map((count, colIdx) => (
                    <td
                      key={colIdx}
                      className={`py-2 font-semibold ${
                        rowIdx === colIdx
                          ? 'text-primary bg-primary/10 rounded'
                          : count > 0
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {count}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Diagonal values (highlighted) are correct predictions
        </p>
      </div>
    </motion.div>
  );
};
