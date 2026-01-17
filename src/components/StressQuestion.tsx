import { motion } from "framer-motion";

interface StressQuestionProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  value: number;
  onChange: (value: number) => void;
}

const labels = [
  { value: 1, label: "Never" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Always" },
];

export const StressQuestion = ({
  question,
  questionNumber,
  totalQuestions,
  value,
  onChange,
}: StressQuestionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <div className="mb-6">
        <span className="text-sm font-medium text-muted-foreground">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="mt-2 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full gradient-calm"
            initial={{ width: 0 }}
            animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground mb-8 text-balance">
        {question}
      </h2>

      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {labels.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`group flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl transition-all duration-300 ${
              value === option.value
                ? "gradient-calm shadow-glow text-white scale-105"
                : "bg-card hover:bg-secondary border border-border hover:border-primary/30"
            }`}
          >
            <span
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                value === option.value
                  ? "bg-white/20 text-white"
                  : "bg-secondary text-foreground group-hover:bg-primary/10"
              }`}
            >
              {option.value}
            </span>
            <span
              className={`text-xs md:text-sm font-medium transition-colors ${
                value === option.value
                  ? "text-white"
                  : "text-muted-foreground group-hover:text-foreground"
              }`}
            >
              {option.label}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
