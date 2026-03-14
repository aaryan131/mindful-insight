import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StressQuestion } from "@/components/StressQuestion";
import { StressResults } from "@/components/StressResults";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { stressQuestions } from "@/data/stressQuestions";
import { 
  classifyStress, 
  generateRecommendations, 
  generateSummary, 
  generateAffirmation,
  ClassificationResult 
} from "@/lib/stressClassifier";

interface StressAnalysis {
  level: "Low" | "Mild" | "Moderate" | "High" | "Very High";
  summary: string;
  recommendations: string[];
  affirmation: string;
  score: number;
  mlResult: ClassificationResult;
}

type AppState = "welcome" | "assessment" | "loading" | "results";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("welcome");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [analysis, setAnalysis] = useState<StressAnalysis | null>(null);

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

  const submitAssessment = () => {
    setAppState("loading");

    // Extract scores from answers
    const scores = stressQuestions.map((_, index) => answers[index] || 3);

    // Simulate ML processing time for realistic UX
    setTimeout(() => {
      // Run ML classification
      const mlResult = classifyStress(scores);
      
      // Generate analysis from ML results
      const analysisResult: StressAnalysis = {
        level: mlResult.level,
        summary: generateSummary(mlResult),
        recommendations: generateRecommendations(mlResult),
        affirmation: generateAffirmation(mlResult.level),
        score: (mlResult.features.totalScore / (stressQuestions.length * 5)) * 100,
        mlResult: mlResult,
      };

      setAnalysis(analysisResult);
      setAppState("results");
    }, 1500); // Brief delay for UX
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setAnalysis(null);
    setAppState("welcome");
  };

  return (
    <div className="min-h-screen gradient-serene">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-calm shadow-soft">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-semibold text-foreground">
              MindCheck
            </span>
          </div>
          {appState === "assessment" && (
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {stressQuestions.length}
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 pt-24 pb-12">
        <AnimatePresence mode="wait">
          {/* Welcome Screen */}
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
                Mental Stress
                <span className="block gradient-calm bg-clip-text text-transparent">
                  Detector
                </span>
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-muted-foreground max-w-md mb-8 text-balance"
              >
                Take a quick assessment powered by Machine Learning to understand 
                your stress levels and receive personalized recommendations for 
                better mental wellness.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
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
                <span>10 questions • 3 minutes • ML-powered insights</span>
              </motion.div>
            </motion.div>
          )}

          {/* Assessment Screen */}
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

          {/* Loading Screen */}
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

          {/* Results Screen */}
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

export default Index;
