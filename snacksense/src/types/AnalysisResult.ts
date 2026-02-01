export interface AnalysisResult {
  health_score: number; // 0 to 100
  category: 'Harmful' | 'Neutral' | 'Beneficial';
  sustainability_score: number; // 0 to 100
  allergens: string[]; // List of detected allergens or empty
  summary: string; // 1-2 sentences
  healthier_alternatives: string[]; // List of product names or generic types
}