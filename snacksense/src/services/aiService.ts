// src/services/aiService.ts
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import { FoodProduct } from "./foodService";
import { AnalysisResult } from "../types/AnalysisResult";

// WARNING: In production, use "expo-constants" or ".env" files to hide this key!
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API;

const genAI = new GoogleGenerativeAI(API_KEY);

// FIX: Explicitly type this object as 'Schema'
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
      format: "enum", // <--- THIS WAS MISSING
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
): Promise<AnalysisResult> => {
  try {
    // Construct the prompt with the data from Open Food Facts
    const prompt = `
      Analyze this food product as a strict, health-conscious nutritionist.
      
      Product Name: ${product.name}
      Brand: ${product.brand}
      Ingredients: ${product.ingredients}
      Nutriments (per 100g):
      - Sugar: ${product.nutriments.sugars}g
      - Salt: ${product.nutriments.salt}g
      - Fat: ${product.nutriments.fat}g
      - Protein: ${product.nutriments.proteins}g
      - Calories: ${product.nutriments.energy_kcal}
      
      Provide a strict assessment of its health impact, sustainability, and potential allergens.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the JSON response
    const analysis: AnalysisResult = JSON.parse(responseText);

    return analysis;
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    throw new Error("Failed to analyze product with AI.");
  }
};
