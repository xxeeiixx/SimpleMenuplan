export interface MealItem {
  id: number;
  day: string;
  meal: string;
}

export interface RecipeDetails {
  title: string;
  content: string;
}

export const DAYS_ORDER = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
