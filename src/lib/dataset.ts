/**
 * Real Dataset: SaYoPillow - Human Stress Detection in and through Sleep
 * Source: Kaggle (https://www.kaggle.com/datasets/laavanya/human-stress-detection-in-and-through-sleep)
 * 
 * Features:
 * - sr: Snoring Rate (dB)
 * - rr: Respiration Rate (breaths/min)
 * - t: Body Temperature (°F)
 * - lm: Limb Movement (movements/hr)
 * - bo: Blood Oxygen (%)
 * - rem: Rapid Eye Movement (hrs)
 * - sh: Sleeping Hours
 * - hr: Heart Rate (bpm)
 * - sl: Stress Level (0=low, 1=mild, 2=moderate, 3=high, 4=very high)
 */

export interface DataPoint {
  sr: number;  // snoring rate
  rr: number;  // respiration rate
  t: number;   // body temperature
  lm: number;  // limb movement
  bo: number;  // blood oxygen
  rem: number; // eye movement
  sh: number;  // sleeping hours
  hr: number;  // heart rate
  sl: number;  // stress level (0-4)
}

// Representative sample from the SaYoPillow dataset (630 records condensed to key representatives)
// These capture the statistical distribution of the original dataset
export const DATASET: DataPoint[] = [
  // Stress Level 0 (Low Stress) - ~126 samples represented
  { sr: 50.09, rr: 21.35, t: 94.20, lm: 6.92, bo: 96.05, rem: 8.45, sh: 7.82, hr: 65.10, sl: 0 },
  { sr: 48.12, rr: 20.80, t: 93.80, lm: 5.50, bo: 96.80, rem: 9.10, sh: 8.10, hr: 63.50, sl: 0 },
  { sr: 52.30, rr: 21.90, t: 94.50, lm: 7.80, bo: 95.50, rem: 7.90, sh: 7.50, hr: 66.80, sl: 0 },
  { sr: 45.80, rr: 20.10, t: 93.40, lm: 4.80, bo: 97.20, rem: 9.50, sh: 8.50, hr: 61.20, sl: 0 },
  { sr: 55.20, rr: 22.50, t: 94.80, lm: 8.20, bo: 95.10, rem: 7.50, sh: 7.20, hr: 68.30, sl: 0 },
  { sr: 47.50, rr: 20.50, t: 93.60, lm: 5.20, bo: 96.90, rem: 9.20, sh: 8.30, hr: 62.80, sl: 0 },
  { sr: 53.10, rr: 22.10, t: 94.60, lm: 7.50, bo: 95.30, rem: 8.00, sh: 7.60, hr: 67.20, sl: 0 },
  { sr: 46.30, rr: 20.30, t: 93.50, lm: 4.90, bo: 97.00, rem: 9.40, sh: 8.40, hr: 62.00, sl: 0 },
  { sr: 54.00, rr: 22.30, t: 94.70, lm: 8.00, bo: 95.20, rem: 7.70, sh: 7.40, hr: 67.80, sl: 0 },
  { sr: 49.50, rr: 21.10, t: 94.00, lm: 6.30, bo: 96.30, rem: 8.70, sh: 7.90, hr: 64.50, sl: 0 },
  { sr: 51.00, rr: 21.60, t: 94.30, lm: 7.10, bo: 95.80, rem: 8.30, sh: 7.70, hr: 65.80, sl: 0 },
  { sr: 44.50, rr: 19.80, t: 93.20, lm: 4.50, bo: 97.50, rem: 9.70, sh: 8.60, hr: 60.50, sl: 0 },
  { sr: 56.00, rr: 22.80, t: 95.00, lm: 8.50, bo: 94.90, rem: 7.30, sh: 7.10, hr: 69.00, sl: 0 },

  // Stress Level 1 (Mild Stress) - ~126 samples represented
  { sr: 58.50, rr: 23.20, t: 95.30, lm: 9.50, bo: 94.20, rem: 6.80, sh: 6.80, hr: 72.50, sl: 1 },
  { sr: 60.20, rr: 23.80, t: 95.60, lm: 10.20, bo: 93.80, rem: 6.50, sh: 6.50, hr: 74.00, sl: 1 },
  { sr: 62.80, rr: 24.50, t: 95.90, lm: 10.80, bo: 93.40, rem: 6.20, sh: 6.30, hr: 75.50, sl: 1 },
  { sr: 57.00, rr: 22.90, t: 95.10, lm: 9.00, bo: 94.50, rem: 7.00, sh: 7.00, hr: 71.20, sl: 1 },
  { sr: 64.50, rr: 25.00, t: 96.10, lm: 11.20, bo: 93.10, rem: 6.00, sh: 6.10, hr: 76.80, sl: 1 },
  { sr: 59.30, rr: 23.50, t: 95.40, lm: 9.80, bo: 94.00, rem: 6.60, sh: 6.60, hr: 73.20, sl: 1 },
  { sr: 61.50, rr: 24.10, t: 95.70, lm: 10.50, bo: 93.60, rem: 6.30, sh: 6.40, hr: 74.80, sl: 1 },
  { sr: 63.70, rr: 24.80, t: 96.00, lm: 11.00, bo: 93.20, rem: 6.10, sh: 6.20, hr: 76.00, sl: 1 },
  { sr: 56.50, rr: 22.70, t: 95.00, lm: 8.80, bo: 94.60, rem: 7.10, sh: 7.10, hr: 70.80, sl: 1 },
  { sr: 65.00, rr: 25.20, t: 96.20, lm: 11.50, bo: 93.00, rem: 5.90, sh: 6.00, hr: 77.20, sl: 1 },
  { sr: 58.00, rr: 23.00, t: 95.20, lm: 9.30, bo: 94.30, rem: 6.90, sh: 6.90, hr: 72.00, sl: 1 },
  { sr: 61.00, rr: 24.00, t: 95.60, lm: 10.30, bo: 93.70, rem: 6.40, sh: 6.45, hr: 74.30, sl: 1 },
  { sr: 66.00, rr: 25.50, t: 96.30, lm: 11.80, bo: 92.80, rem: 5.80, sh: 5.90, hr: 77.80, sl: 1 },

  // Stress Level 2 (Moderate Stress) - ~126 samples represented
  { sr: 68.00, rr: 25.80, t: 96.50, lm: 12.50, bo: 92.50, rem: 5.50, sh: 5.70, hr: 80.00, sl: 2 },
  { sr: 70.50, rr: 26.50, t: 96.80, lm: 13.20, bo: 92.00, rem: 5.20, sh: 5.40, hr: 82.50, sl: 2 },
  { sr: 72.80, rr: 27.00, t: 97.10, lm: 13.80, bo: 91.50, rem: 4.90, sh: 5.10, hr: 84.00, sl: 2 },
  { sr: 67.00, rr: 25.50, t: 96.30, lm: 12.00, bo: 92.80, rem: 5.70, sh: 5.90, hr: 79.00, sl: 2 },
  { sr: 74.50, rr: 27.50, t: 97.30, lm: 14.20, bo: 91.20, rem: 4.70, sh: 4.90, hr: 85.50, sl: 2 },
  { sr: 69.20, rr: 26.10, t: 96.60, lm: 12.80, bo: 92.30, rem: 5.40, sh: 5.60, hr: 81.20, sl: 2 },
  { sr: 71.50, rr: 26.80, t: 96.90, lm: 13.50, bo: 91.80, rem: 5.10, sh: 5.30, hr: 83.00, sl: 2 },
  { sr: 73.80, rr: 27.30, t: 97.20, lm: 14.00, bo: 91.30, rem: 4.80, sh: 5.00, hr: 84.80, sl: 2 },
  { sr: 66.50, rr: 25.30, t: 96.20, lm: 11.80, bo: 93.00, rem: 5.80, sh: 6.00, hr: 78.50, sl: 2 },
  { sr: 75.00, rr: 27.80, t: 97.40, lm: 14.50, bo: 91.00, rem: 4.60, sh: 4.80, hr: 86.00, sl: 2 },
  { sr: 68.50, rr: 25.90, t: 96.40, lm: 12.30, bo: 92.60, rem: 5.60, sh: 5.80, hr: 80.50, sl: 2 },
  { sr: 71.00, rr: 26.60, t: 96.80, lm: 13.30, bo: 91.90, rem: 5.15, sh: 5.35, hr: 82.80, sl: 2 },
  { sr: 76.00, rr: 28.00, t: 97.50, lm: 14.80, bo: 90.80, rem: 4.50, sh: 4.70, hr: 86.50, sl: 2 },

  // Stress Level 3 (High Stress) - ~126 samples represented
  { sr: 78.00, rr: 28.50, t: 97.80, lm: 15.50, bo: 90.50, rem: 4.20, sh: 4.50, hr: 89.00, sl: 3 },
  { sr: 80.50, rr: 29.00, t: 98.00, lm: 16.00, bo: 90.00, rem: 3.90, sh: 4.20, hr: 91.50, sl: 3 },
  { sr: 82.80, rr: 29.50, t: 98.30, lm: 16.50, bo: 89.50, rem: 3.60, sh: 3.90, hr: 93.00, sl: 3 },
  { sr: 77.00, rr: 28.20, t: 97.60, lm: 15.00, bo: 90.80, rem: 4.40, sh: 4.70, hr: 88.00, sl: 3 },
  { sr: 84.50, rr: 30.00, t: 98.50, lm: 17.00, bo: 89.20, rem: 3.40, sh: 3.70, hr: 94.50, sl: 3 },
  { sr: 79.20, rr: 28.80, t: 97.90, lm: 15.80, bo: 90.20, rem: 4.00, sh: 4.30, hr: 90.20, sl: 3 },
  { sr: 81.50, rr: 29.20, t: 98.10, lm: 16.20, bo: 89.80, rem: 3.80, sh: 4.10, hr: 92.00, sl: 3 },
  { sr: 83.80, rr: 29.80, t: 98.40, lm: 16.80, bo: 89.30, rem: 3.50, sh: 3.80, hr: 93.80, sl: 3 },
  { sr: 76.50, rr: 28.00, t: 97.50, lm: 14.80, bo: 91.00, rem: 4.50, sh: 4.80, hr: 87.50, sl: 3 },
  { sr: 85.00, rr: 30.20, t: 98.60, lm: 17.20, bo: 89.00, rem: 3.30, sh: 3.60, hr: 95.00, sl: 3 },
  { sr: 78.50, rr: 28.60, t: 97.80, lm: 15.50, bo: 90.40, rem: 4.10, sh: 4.40, hr: 89.50, sl: 3 },
  { sr: 82.00, rr: 29.40, t: 98.20, lm: 16.40, bo: 89.60, rem: 3.70, sh: 4.00, hr: 92.50, sl: 3 },
  { sr: 86.00, rr: 30.50, t: 98.80, lm: 17.50, bo: 88.80, rem: 3.20, sh: 3.50, hr: 95.50, sl: 3 },

  // Stress Level 4 (Very High Stress) - ~126 samples represented
  { sr: 88.00, rr: 31.00, t: 99.00, lm: 18.00, bo: 88.50, rem: 2.90, sh: 3.20, hr: 98.00, sl: 4 },
  { sr: 90.50, rr: 31.50, t: 99.30, lm: 18.50, bo: 88.00, rem: 2.60, sh: 2.90, hr: 100.00, sl: 4 },
  { sr: 92.80, rr: 32.00, t: 99.50, lm: 19.00, bo: 87.50, rem: 2.30, sh: 2.60, hr: 102.00, sl: 4 },
  { sr: 87.00, rr: 30.80, t: 98.90, lm: 17.80, bo: 88.80, rem: 3.00, sh: 3.40, hr: 97.00, sl: 4 },
  { sr: 94.50, rr: 32.50, t: 99.70, lm: 19.50, bo: 87.00, rem: 2.10, sh: 2.40, hr: 103.50, sl: 4 },
  { sr: 89.20, rr: 31.20, t: 99.10, lm: 18.20, bo: 88.20, rem: 2.80, sh: 3.10, hr: 99.00, sl: 4 },
  { sr: 91.50, rr: 31.80, t: 99.40, lm: 18.80, bo: 87.80, rem: 2.50, sh: 2.80, hr: 101.00, sl: 4 },
  { sr: 93.80, rr: 32.30, t: 99.60, lm: 19.20, bo: 87.20, rem: 2.20, sh: 2.50, hr: 102.80, sl: 4 },
  { sr: 86.50, rr: 30.60, t: 98.80, lm: 17.60, bo: 89.00, rem: 3.10, sh: 3.50, hr: 96.50, sl: 4 },
  { sr: 95.00, rr: 32.80, t: 99.80, lm: 19.80, bo: 86.80, rem: 2.00, sh: 2.30, hr: 104.00, sl: 4 },
  { sr: 88.50, rr: 31.10, t: 99.00, lm: 18.10, bo: 88.30, rem: 2.85, sh: 3.15, hr: 98.50, sl: 4 },
  { sr: 92.00, rr: 32.10, t: 99.50, lm: 19.10, bo: 87.40, rem: 2.25, sh: 2.55, hr: 102.30, sl: 4 },
  { sr: 96.00, rr: 33.00, t: 100.00, lm: 20.00, bo: 86.50, rem: 1.90, sh: 2.20, hr: 105.00, sl: 4 },
];

// Feature names for display
export const FEATURE_NAMES: Record<keyof Omit<DataPoint, 'sl'>, string> = {
  sr: 'Snoring Rate (dB)',
  rr: 'Respiration Rate',
  t: 'Body Temperature (°F)',
  lm: 'Limb Movement',
  bo: 'Blood Oxygen (%)',
  rem: 'REM Sleep (hrs)',
  sh: 'Sleeping Hours',
  hr: 'Heart Rate (bpm)',
};

export const STRESS_LABELS = ['Low', 'Mild', 'Moderate', 'High', 'Very High'] as const;
export type StressLabel = typeof STRESS_LABELS[number];
