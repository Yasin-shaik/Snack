// src/services/aiService.ts
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { FoodProduct } from "./foodService";
import { AnalysisResult } from "../types/AnalysisResult";
import { UserProfile } from "../redux/authSlice";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API;
const genAI = new GoogleGenerativeAI(API_KEY);

const schema: Schema = {
  description: "Food analysis result",
  type: SchemaType.OBJECT,
  properties: {
    health_score: {
      type: SchemaType.NUMBER,
      description: "Score from 0-100 based on nutritional value",
    },
    category: {
      type: SchemaType.STRING,
      format: "enum",
      description: "Overall verdict: Harmful, Neutral, or Beneficial",
      enum: ["Harmful", "Neutral", "Beneficial"],
    },
    sustainability_score: {
      type: SchemaType.NUMBER,
      description: "Environmental impact score 0-100",
    },
    allergens: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "List of potential allergens found in ingredients",
    },
    summary: {
      type: SchemaType.STRING,
      description: "Short, strict nutritionist summary of the product",
    },
    healthier_alternatives: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "List of 2-3 healthier options",
    },
  },
  required: [
    "health_score",
    "category",
    "sustainability_score",
    "allergens",
    "summary",
    "healthier_alternatives",
  ],
};
const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema,
  },
});
export const analyzeFoodProduct = async (
  product: FoodProduct,
  profile: UserProfile | null,
): Promise<AnalysisResult> => {
  const userContext = profile
    ? `
      USER CONTEXT (CRITICAL):
      - Activity Level: ${profile.activityLevel}
      - Health Goal: ${profile.healthGoal}
      - Daily Water Goal: ${profile.waterGoal} liters
      - Daily Step Goal: ${profile.stepGoal} steps
      
      INSTRUCTION:
      Analyze this food specifically for THIS user. 
      - If they want "Muscle Gain" and the food is high protein, score it higher.
      - If they want "Weight Loss" and it's high calorie/sugar, score it lower.
      - If they are "Active", be more lenient with carbs/energy than if they were "Sedentary".
      `
    : "User profile not available. Analyze for a general healthy adult.";

  try {
    const prompt = `
      ${userContext}

      PRODUCT DATA:
      Name: ${product.name}
      Brand: ${product.brand}
      Ingredients: ${product.ingredients}
      Nutriments (per 100g):
      - Sugar: ${product.nutriments.sugars}g
      - Salt: ${product.nutriments.salt}g
      - Fat: ${product.nutriments.fat}g
      - Protein: ${product.nutriments.proteins}g
      - Calories: ${product.nutriments.energy_kcal}
      
      Provide a strict assessment of its health impact, sustainability, and potential allergens based on the USER CONTEXT provided above.
    `;
    const result = await model.generateContent(prompt);
    console.log("--- SENDING PROMPT TO AI ---");
    console.log(prompt); // This lets you confirm the User Context is attached
    console.log("----------------------------");
    const responseText = result.response.text();
    const analysis: AnalysisResult = JSON.parse(responseText);
    return analysis;
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    throw new Error("Failed to analyze product with AI.");
  }
};
