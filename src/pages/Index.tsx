import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StressQuestion } from "@/components/StressQuestion";
import { StressResults } from "@/components/StressResults";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { stressQuestions } from "@/data/stressQuestions";
import { trainPipeline, predictFromAnswers, TrainingResult } from "@/ml/train";
import { PredictionResponse } from "@/ml/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface StressAnalysis {
  level: "Low" | "Medium" | "High";
  summary: string;
  recommendations: string[];
  affirmation: string;
  score: number;
  prediction: PredictionResponse;
  trainingResult: TrainingResult;
}

type AppState = "welcome" | "assessment" | "loading" | "results";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("welcome");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [analysis, setAnalysis] = useState<StressAnalysis | null>(null);
  const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null);
  const { toast } = useToast();

  // Train ML models on mount
  useEffect(() => {
    const result = trainPipeline();
    setTrainingResult(result);
    console.log(`ML Pipeline trained. Best model: ${result.bestModel.name} (accuracy: ${(result.bestModel.metrics.accuracy * 100).toFixed(1)}%)`);
  }, []);

  const handleStartAssessment = () => {
    setAppState("assessment");
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleAnswer = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < stressQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      submitAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const submitAssessment = async () => {
    setAppState("loading");
    const scores = stressQuestions.map((_, index) => answers[index] || 3);

    // Try Edge Function first, fall back to local ML
    let prediction: PredictionResponse | null = null;

    try {
      const { data, error } = await supabase.functions.invoke('predict-stress', {
        body: { answers: scores },
      });

      if (!error && data && data.stress_level) {
        prediction = data as PredictionResponse;
      }
    } catch (e) {
      console.warn("Edge function unavailable, using local ML:", e);
    }

    // Fallback to local ML if edge function fails
    if (!prediction && trainingResult) {
      prediction = predictFromAnswers(scores, trainingResult);
    }

    if (!prediction) {
      toast({ title: "Error", description: "Failed to get prediction. Please try again.", variant: "destructive" });
      setAppState("assessment");
      return;
    }

    // Generate recommendations based on stress level
    const recommendations = generateRecommendations(prediction.stress_level, prediction.contributing_factors);
    const summary = generateSummary(prediction);
    const affirmation = generateAffirmation(prediction.stress_level);
    const scorePercent = prediction.confidence * 100;

    setAnalysis({
      level: prediction.stress_level,
      summary,
      recommendations,
      affirmation,
      score: scorePercent,
      prediction,
      trainingResult: trainingResult!,
    });
    setAppState("results");
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setAnalysis(null);
    setAppState("welcome");
  };

  return (
    <div className="min-h-screen gradient-serene">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-calm shadow-soft">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-semibold text-foreground">
              MindCheck ML
            </span>
          </div>
          {appState === "assessment" && (
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {stressQuestions.length}
            </span>
          )}
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 pt-24 pb-12">
        <AnimatePresence mode="wait">
          {appState === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[70vh] text-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative mb-8"
              >
                <div className="w-28 h-28 rounded-3xl gradient-calm flex items-center justify-center shadow-glow animate-float">
                  <Brain className="w-14 h-14 text-white" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 rounded-full border-2 border-dashed border-primary/20"
                />
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4"
              >
                ML Stress
                <span className="block gradient-calm bg-clip-text text-transparent">
                  Predictor
                </span>
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-muted-foreground max-w-md mb-4 text-balance"
              >
                Powered by Gaussian Naive Bayes, Logistic Regression &amp; Random Forest
                classifiers trained on real stress survey data.
              </motion.p>

              {trainingResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="mb-8 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  Best model: {trainingResult.bestModel.name} — {(trainingResult.bestModel.metrics.accuracy * 100).toFixed(0)}% accuracy
                </motion.div>
              )}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={handleStartAssessment}
                  size="lg"
                  className="gradient-calm text-white hover:opacity-90 transition-opacity rounded-xl px-8 gap-2 shadow-soft"
                >
                  Start Assessment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span>10 questions • 3 models • Real ML classification</span>
              </motion.div>
            </motion.div>
          )}

          {appState === "assessment" && (
            <motion.div
              key="assessment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[70vh] flex flex-col justify-center py-8"
            >
              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border">
                <AnimatePresence mode="wait">
                  <StressQuestion
                    key={currentQuestion}
                    question={stressQuestions[currentQuestion].question}
                    questionNumber={currentQuestion + 1}
                    totalQuestions={stressQuestions.length}
                    value={answers[currentQuestion] || 0}
                    onChange={handleAnswer}
                  />
                </AnimatePresence>

                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    disabled={currentQuestion === 0}
                    className="gap-2 rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={!answers[currentQuestion]}
                    className="gradient-calm text-white hover:opacity-90 transition-opacity gap-2 rounded-xl px-6"
                  >
                    {currentQuestion === stressQuestions.length - 1 ? (
                      <>
                        Get Results
                        <Sparkles className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {appState === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[70vh] flex items-center justify-center"
            >
              <LoadingAnalysis />
            </motion.div>
          )}

          {appState === "results" && analysis && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              <StressResults analysis={analysis} onRetake={handleRetake} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// ─── Helper functions ──────────────────────────────────────────────────

function generateRecommendations(level: string, factors: PredictionResponse['contributing_factors']): string[] {
  const recs: string[] = [];
  const base: Record<string, string[]> = {
    Low: [
      "Maintain your current healthy habits — they're working well",
      "Continue regular physical activity and good sleep hygiene",
      "Consider sharing your wellness strategies with others",
    ],
    Medium: [
      "Schedule regular breaks throughout your day to decompress",
      "Practice mindfulness or deep breathing for 10 minutes daily",
      "Aim for 7-8 hours of sleep on a consistent schedule",
    ],
    High: [
      "Please consider speaking with a mental health professional",
      "Practice progressive muscle relaxation before bedtime",
      "Reduce screen time and set boundaries at work/school",
    ],
  };
  recs.push(...(base[level] || base.Medium));

  // Add factor-specific recommendations
  const highFactors = factors.filter(f => f.impact === 'High');
  for (const factor of highFactors.slice(0, 2)) {
    if (factor.feature === 'Sleep Quality') recs.push('Prioritize sleep: avoid screens 1 hour before bed');
    if (factor.feature === 'Work Pressure') recs.push('Break large tasks into smaller, manageable steps');
    if (factor.feature === 'Emotional Instability') recs.push('Try journaling to process your emotions');
    if (factor.feature === 'Fatigue') recs.push('Take short walks during breaks to restore energy');
  }

  return recs.slice(0, 5);
}

function generateSummary(prediction: PredictionResponse): string {
  const pct = (prediction.confidence * 100).toFixed(0);
  const summaries: Record<string, string> = {
    Low: `Our ${prediction.model_used} classifier predicted Low stress with ${pct}% confidence. Your responses indicate healthy coping mechanisms and well-balanced lifestyle factors.`,
    Medium: `The ${prediction.model_used} model detected Medium stress levels with ${pct}% confidence. Some lifestyle factors suggest room for improvement in managing daily pressures.`,
    High: `Classification result: High stress at ${pct}% confidence using ${prediction.model_used}. Multiple contributing factors indicate significant stress — professional support is recommended.`,
  };
  return summaries[prediction.stress_level] || summaries.Medium;
}

function generateAffirmation(level: string): string {
  const affirmations: Record<string, string[]> = {
    Low: ["You have excellent resilience — keep nurturing your well-being.", "Your balanced approach to life is truly admirable."],
    Medium: ["Every step toward managing stress is a victory worth celebrating.", "You deserve rest, peace, and time to recharge."],
    High: ["Seeking help is a sign of courage, not weakness.", "Every moment is a new opportunity to begin your healing journey."],
  };
  const opts = affirmations[level] || affirmations.Medium;
  return opts[Math.floor(Math.random() * opts.length)];
}

export default Index;
