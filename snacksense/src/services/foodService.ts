// src/services/foodService.ts
import axios from 'axios';

// 1. Define the shape of the data we want to extract
export interface FoodProduct {
  name: string;
  brand?: string;
  ingredients: string;
  nutriscore?: string;
  image_url?: string;
  nutriments: {
    energy_kcal: number;
    sugars: number;
    salt: number;
    fat: number;
    proteins: number;
    carbohydrates: number;
  };
}

const BASE_URL = 'https://world.openfoodfacts.org/api/v0/product';

// 2. The fetching function
export const getFoodProduct = async (barcode: string): Promise<FoodProduct | null> => {
  try {
    const response = await axios.get(`${BASE_URL}/${barcode}.json`);
    const data = response.data;

    // Open Food Facts returns status: 1 if found, 0 if not found
    if (data.status === 0) {
      throw new Error("Product not found in database.");
    }

    const product = data.product;

    // 3. Extract only the fields we need for the AI
    const mappedProduct: FoodProduct = {
      name: product.product_name || "Unknown Product",
      brand: product.brands || "Unknown Brand",
      ingredients: product.ingredients_text || "No ingredients listed",
      nutriscore: product.nutriscore_grade || "unknown", // a, b, c, d, e
      image_url: product.image_url,
      nutriments: {
        energy_kcal: product.nutriments?.['energy-kcal_100g'] || 0,
        sugars: product.nutriments?.sugars_100g || 0,
        salt: product.nutriments?.salt_100g || 0,
        fat: product.nutriments?.fat_100g || 0,
        proteins: product.nutriments?.proteins_100g || 0,
        carbohydrates: product.nutriments?.carbohydrates_100g || 0,
      }
    };

    return mappedProduct;

  } catch (error: any) {
    console.error("Error fetching food data:", error.message);
    throw error; // Re-throw to handle it in the UI
  }
};