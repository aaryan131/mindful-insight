import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export const LoadingAnalysis = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 rounded-full gradient-calm flex items-center justify-center shadow-glow"
        >
          <Brain className="w-12 h-12 text-white" />
        </motion.div>
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary/30 border-r-primary/30"
        />
      </div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-xl font-display font-semibold text-foreground"
      >
        Analyzing Your Responses
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-2 text-muted-foreground text-center max-w-xs"
      >
        Our AI is carefully reviewing your answers to provide personalized insights...
      </motion.p>

      <div className="mt-6 flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            className="w-2.5 h-2.5 rounded-full bg-primary"
          />
        ))}
      </div>
    </motion.div>
  );
};
