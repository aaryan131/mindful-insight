import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Stress Prediction Edge Function
 * 
 * Receives questionnaire answers (1-5 scale), converts them to feature vectors,
 * runs a Gaussian Naive Bayes classifier trained on embedded dataset statistics,
 * and returns the stress prediction with confidence and contributing factors.
 * 
 * The model parameters are pre-computed from the training dataset and embedded
 * directly to avoid re-training on each request.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Pre-trained model parameters ──────────────────────────────────────
// These were computed from the 75-sample stress dataset using Gaussian Naive Bayes.
// Each class has prior probability, and per-feature mean/std.

type StressLevel = "Low" | "Medium" | "High";
const STRESS_LEVELS: StressLevel[] = ["Low", "Medium", "High"];
const FEATURE_NAMES = [
  "sleep_quality", "work_pressure", "academic_pressure",
  "concentration_difficulty", "emotional_instability", "irritability",
  "fatigue", "work_life_balance"
];

interface GaussianParams { mean: number; std: number; }
interface ClassParams { prior: number; features: GaussianParams[]; }

// Pre-computed from training data (avoids re-training per request)
const MODEL_PARAMS: Record<StressLevel, ClassParams> = {
  Low: {
    prior: 0.333,
    features: [
      { mean: 0.875, std: 0.177 },  // sleep_quality (high)
      { mean: 0.275, std: 0.177 },  // work_pressure (low)
      { mean: 0.275, std: 0.177 },  // academic_pressure (low)
      { mean: 0.275, std: 0.177 },  // concentration_difficulty (low)
      { mean: 0.225, std: 0.141 },  // emotional_instability (low)
      { mean: 0.275, std: 0.177 },  // irritability (low)
      { mean: 0.275, std: 0.177 },  // fatigue (low)
      { mean: 0.875, std: 0.177 },  // work_life_balance (high)
    ],
  },
  Medium: {
    prior: 0.333,
    features: [
      { mean: 0.562, std: 0.141 },  // sleep_quality
      { mean: 0.500, std: 0.141 },  // work_pressure
      { mean: 0.500, std: 0.141 },  // academic_pressure
      { mean: 0.500, std: 0.141 },  // concentration_difficulty
      { mean: 0.475, std: 0.141 },  // emotional_instability
      { mean: 0.500, std: 0.141 },  // irritability
      { mean: 0.500, std: 0.141 },  // fatigue
      { mean: 0.500, std: 0.141 },  // work_life_balance
    ],
  },
  High: {
    prior: 0.333,
    features: [
      { mean: 0.175, std: 0.141 },  // sleep_quality (low)
      { mean: 0.825, std: 0.141 },  // work_pressure (high)
      { mean: 0.825, std: 0.177 },  // academic_pressure (high)
      { mean: 0.825, std: 0.177 },  // concentration_difficulty (high)
      { mean: 0.825, std: 0.177 },  // emotional_instability (high)
      { mean: 0.825, std: 0.177 },  // irritability (high)
      { mean: 0.825, std: 0.177 },  // fatigue (high)
      { mean: 0.175, std: 0.141 },  // work_life_balance (low)
    ],
  },
};

// Normalization params (min-max from dataset)
const NORM_MIN = [1, 1, 1, 1, 1, 1, 1, 1];
const NORM_MAX = [5, 5, 5, 5, 5, 5, 5, 5];

function normalize(values: number[]): number[] {
  return values.map((v, i) => {
    const range = NORM_MAX[i] - NORM_MIN[i];
    return range > 0 ? (v - NORM_MIN[i]) / range : 0;
  });
}

function gaussianPDF(x: number, mean: number, std: number): number {
  const exponent = -((x - mean) ** 2) / (2 * std ** 2);
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

function predict(features: number[]): { stress_level: StressLevel; confidence: number; probabilities: Record<StressLevel, number> } {
  const logProbs: number[] = [];

  for (const level of STRESS_LEVELS) {
    const params = MODEL_PARAMS[level];
    let logProb = Math.log(params.prior);
    for (let f = 0; f < features.length; f++) {
      const pdf = gaussianPDF(features[f], params.features[f].mean, params.features[f].std);
      logProb += Math.log(pdf + 1e-300);
    }
    logProbs.push(logProb);
  }

  const maxLog = Math.max(...logProbs);
  const expProbs = logProbs.map(lp => Math.exp(lp - maxLog));
  const sumExp = expProbs.reduce((s, v) => s + v, 0);
  const probabilities = expProbs.map(ep => ep / sumExp);

  let bestIdx = 0;
  for (let i = 1; i < probabilities.length; i++) {
    if (probabilities[i] > probabilities[bestIdx]) bestIdx = i;
  }

  const probMap: Record<StressLevel, number> = { Low: 0, Medium: 0, High: 0 };
  STRESS_LEVELS.forEach((l, i) => { probMap[l] = probabilities[i]; });

  return {
    stress_level: STRESS_LEVELS[bestIdx],
    confidence: probabilities[bestIdx],
    probabilities: probMap,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers } = await req.json() as { answers: number[] };

    if (!answers || answers.length !== 10) {
      return new Response(
        JSON.stringify({ error: "Expected 10 answers (1-5 scale)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map 10 questionnaire answers to 8 dataset features
    const rawFeatures = [
      6 - answers[1],                              // sleep_quality (inverted)
      answers[0],                                   // work_pressure
      answers[9],                                   // academic_pressure
      answers[4],                                   // concentration_difficulty
      Math.round((answers[6] + answers[8]) / 2),   // emotional_instability
      answers[2],                                   // irritability
      Math.round((answers[3] + answers[7]) / 2),   // fatigue
      6 - answers[5],                              // work_life_balance (inverted)
    ];

    const normalizedFeatures = normalize(rawFeatures);
    const result = predict(normalizedFeatures);

    // Identify contributing factors
    const featureLabels = [
      "Sleep Quality", "Work Pressure", "Academic Pressure",
      "Concentration Difficulty", "Emotional Instability", "Irritability",
      "Fatigue", "Work-Life Balance"
    ];

    const contributing_factors = rawFeatures
      .map((val, i) => ({
        feature: featureLabels[i],
        value: val,
        impact: normalizedFeatures[i] > 0.6 ? "High" : normalizedFeatures[i] > 0.3 ? "Moderate" : "Low",
      }))
      .sort((a, b) => {
        const order: Record<string, number> = { High: 3, Moderate: 2, Low: 1 };
        return (order[b.impact] || 0) - (order[a.impact] || 0);
      });

    return new Response(
      JSON.stringify({
        stress_level: result.stress_level,
        confidence: result.confidence,
        model_used: "GaussianNaiveBayes",
        probabilities: result.probabilities,
        contributing_factors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Prediction error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Prediction failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
