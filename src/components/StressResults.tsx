import { motion } from "framer-motion";
import { Heart, Lightbulb, RefreshCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MLAnalysisDetails } from "@/components/MLAnalysisDetails";
import { ClassificationResult } from "@/lib/stressClassifier";

interface StressAnalysis {
  level: "Low" | "Mild" | "Moderate" | "High" | "Very High";
  summary: string;
  recommendations: string[];
  affirmation: string;
  score: number;
  mlResult: ClassificationResult;
}

interface StressResultsProps {
  analysis: StressAnalysis;
  onRetake: () => void;
}

const levelColors = {
  Low: {
    bg: "from-emerald-500/20 to-teal-500/20",
    text: "text-emerald-600",
    ring: "ring-emerald-500/30",
    icon: "bg-emerald-500",
  },
  Mild: {
    bg: "from-sky-500/20 to-cyan-500/20",
    text: "text-sky-600",
    ring: "ring-sky-500/30",
    icon: "bg-sky-500",
  },
  Moderate: {
    bg: "from-amber-500/20 to-yellow-500/20",
    text: "text-amber-600",
    ring: "ring-amber-500/30",
    icon: "bg-amber-500",
  },
  High: {
    bg: "from-orange-500/20 to-red-400/20",
    text: "text-orange-600",
    ring: "ring-orange-500/30",
    icon: "bg-orange-500",
  },
  "Very High": {
    bg: "from-red-500/20 to-rose-500/20",
    text: "text-red-600",
    ring: "ring-red-500/30",
    icon: "bg-red-500",
  },
};

export const StressResults = ({ analysis, onRetake }: StressResultsProps) => {
  const colors = levelColors[analysis.level];
  const scorePercentage = Math.round(analysis.score);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Score Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} p-6 md:p-8 ring-1 ${colors.ring}`}
      >
        <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
          <div className="w-full h-full animate-breathe">
            <Sparkles className="w-full h-full" />
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Your Stress Level
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.icon} text-white`}>
              {scorePercentage}% stress score
            </span>
          </div>

          <h2 className={`text-4xl md:text-5xl font-display font-bold ${colors.text} mb-4`}>
            {analysis.level}
          </h2>

          <p className="text-foreground/80 text-base md:text-lg leading-relaxed">
            {analysis.summary}
          </p>
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl p-6 shadow-card border border-border"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg gradient-calm">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-display font-semibold text-foreground">
            Personalized Recommendations
          </h3>
        </div>

        <ul className="space-y-3">
          {analysis.recommendations.map((rec, index) => (
            <motion.li
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full gradient-calm flex items-center justify-center text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span className="text-foreground/90">{rec}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Affirmation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-accent to-secondary rounded-2xl p-6 border border-border"
      >
        <div className="flex items-center gap-3 mb-3">
          <Heart className="w-5 h-5 text-primary animate-pulse-soft" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Daily Affirmation
          </span>
        </div>
        <p className="text-lg md:text-xl font-display font-medium text-foreground italic">
          "{analysis.affirmation}"
        </p>
      </motion.div>

      {/* ML Analysis Details */}
      <MLAnalysisDetails result={analysis.mlResult} />

      {/* Retake Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center pt-4"
      >
        <Button
          onClick={onRetake}
          size="lg"
          className="gradient-calm text-white hover:opacity-90 transition-opacity rounded-xl px-8 gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          Take Assessment Again
        </Button>
      </motion.div>
    </motion.div>
  );
};
