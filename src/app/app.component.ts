import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealItem, RecipeDetails, DAYS_ORDER } from './models/menu.models';
import { GeminiService } from './services/gemini.service';
import { MealItemComponent } from './components/meal-item.component';
import { AddMealFormComponent } from './components/add-meal-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MealItemComponent, AddMealFormComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  // Core state
  private _menu = signal<MealItem[]>([
    { id: 1, day: 'Sunday', meal: 'Roast Chicken with Vegetables' },
    { id: 2, day: 'Monday', meal: 'Spaghetti Bolognese' },
    { id: 3, day: 'Tuesday', meal: 'Taco Tuesday' },
    { id: 4, day: 'Wednesday', meal: 'Chicken Curry with Rice' },
    { id: 5, day: 'Thursday', meal: 'Beef Stir-Fry' },
    { id: 6, day: 'Friday', meal: 'Pizza Night' },
    { id: 7, day: 'Saturday', meal: 'Grilled Salmon with Asparagus' },
  ]);

  readonly days = DAYS_ORDER;
  editingId = signal<number | null>(null);
  draftMeal = signal('');
  newDay = signal<string>('Sunday');
  newMealName = signal<string>('');

  // Async/loading flags
  loadingMealId = signal<number | null>(null);
  loadingRecipeId = signal<number | null>(null);
  loadingNewMeal = signal(false);
  loadingGroceryList = signal(false);

  // Output data
  groceryList = signal<string | null>(null);
  recipe = signal<RecipeDetails | null>(null);
  recipeError = signal<string | null>(null);

  // Derived
  weeklyMenu = computed(() => this._menu().slice().sort((a, b) => this.days.indexOf(a.day) - this.days.indexOf(b.day)));

  private nextId = 8;

  constructor(private gemini: GeminiService) {}

  startEdit(item: MealItem) {
    this.editingId.set(item.id);
    this.draftMeal.set(item.meal);
  }

  saveEdit() {
    const id = this.editingId();
    if (id == null) return;
    const value = this.draftMeal().trim();
    this._menu.update(list => list.map(i => i.id === id ? { ...i, meal: value } : i));
    this.editingId.set(null);
    this.draftMeal.set('');
  }

  cancelEdit() {
    this.editingId.set(null);
    this.draftMeal.set('');
  }

  deleteMeal(id: number) {
    this._menu.update(list => list.filter(i => i.id !== id));
  }

  addMeal() {
    const mealName = this.newMealName().trim();
    if (!mealName) return;
    this._menu.update(list => [...list, { id: this.nextId++, day: this.newDay(), meal: mealName }]);
    this.newMealName.set('');
  }

  async suggestMealFor(id: number, day: string) {
    this.loadingMealId.set(id);
    const suggestion = await this.gemini.generateContent({
      prompt: `Suggest a healthy, easy dinner idea for ${day}. Only meal name.`,
      systemInstruction: 'Act as a creative European meal planner.'
    });
    if (suggestion) {
      this._menu.update(list => list.map(i => i.id === id ? { ...i, meal: suggestion } : i));
    }
    this.loadingMealId.set(null);
  }

  async suggestNewMeal() {
    this.loadingNewMeal.set(true);
    const suggestion = await this.gemini.generateContent({
      prompt: 'Suggest one healthy dinner idea. Only meal name.',
      systemInstruction: 'Act as a creative European meal planner.'
    });
    if (suggestion) this.newMealName.set(suggestion);
    this.loadingNewMeal.set(false);
  }

  async viewRecipe(id: number, mealName: string) {
    this.loadingRecipeId.set(id);
    const text = await this.gemini.generateContent({
      prompt: `Provide ingredients and preparation steps for ${mealName}. Markdown headings: Ingredients, Preparation.`,
      systemInstruction: 'Be a professional concise chef.'
    });
    if (text) {
      this.recipe.set({ title: mealName, content: text });
      this.recipeError.set(null);
    } else {
      this.recipe.set(null);
      this.recipeError.set(this.gemini.lastError() ?? 'No recipe generated.');
    }
    this.loadingRecipeId.set(null);
  }

  closeRecipe() {
  this.recipe.set(null);
  this.recipeError.set(null);
  }

  trackMenuItem(index: number, item: MealItem) { return item.id; }

  printRecipe() { window.print(); }

  async generateGrocery() {
    this.loadingGroceryList.set(true);
    const menuText = this._menu().map(i => `${i.day}: ${i.meal}`).join('\n');
    const list = await this.gemini.generateContent({
      prompt: `Make a grocery list grouped by category from:\n${menuText}`,
      systemInstruction: 'Produce a categorized grocery list in Markdown.'
    });
    if (list) this.groceryList.set(list);
    this.loadingGroceryList.set(false);
  }

  setGroceryList(value: string | null) { this.groceryList.set(value); }

  formatGroceryList(raw: string | null): string {
    if (!raw) return '';
    
    const escape = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/'/g, '&#39;')
      .replace(/"/g, '&quot;');

    const lines = raw.split(/\r?\n/);
    let html = '';
    let inList = false;
    
    const closeList = () => {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        closeList();
        continue;
      }

      // Category headers (with ###)
      if (trimmed.startsWith('###')) {
        closeList();
        const categoryName = trimmed.replace(/^###\s*/, '').trim();
        html += `<div class="grocery-category"><h3>${escape(categoryName)}</h3>`;
        continue;
      }

      // Items (with * or -)
      const itemMatch = trimmed.match(/^[-*]\s+(.+)$/);
      if (itemMatch) {
        if (!inList) {
          html += '<ul class="grocery-items">';
          inList = true;
        }
        html += `<li>${escape(itemMatch[1])}</li>`;
        continue;
      }

      // Regular text
      closeList();
      if (trimmed.endsWith('**')) {
        const category = trimmed.replace(/\*\*$/, '').trim();
        html += `<div class="grocery-category"><h3>${escape(category)}</h3>`;
      } else {
        html += `<p>${escape(trimmed)}</p>`;
      }
    }

    closeList();
    return html;
  }

  // Very lightweight markdown-ish to HTML formatter for recipe content
  formatRecipe(raw: string): string {
    const escape = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const lines = raw.split(/\r?\n/);
    let html = '';
    let inList = false;
    let currentSection = '';
    const closeList = () => { if (inList) { html += '</ul>'; inList = false; } };

    for (let line of lines) {
      const original = line;
      line = line.trim();
      if (!line) { closeList(); continue; }

      // Headings (# Ingredients) or plain section words
      const headingMatch = line.match(/^#{1,6}\s+(.*)$/);
      if (headingMatch) {
        closeList();
        const text = headingMatch[1].trim();
        currentSection = text.toLowerCase();
        html += `<h3>${escape(text)}</h3>`;
        continue;
      }
      if (/^(ingredients|preparation|instructions)[:]?$/.test(line.toLowerCase())) {
        closeList();
        currentSection = line.toLowerCase();
        const nice = line.replace(/[:]$/, '');
        html += `<h3>${escape(nice)}</h3>`;
        continue;
      }

      // List item markers: -, *, number.
      const liMatch = line.match(/^(-|\*|\d+\.)\s+(.*)$/);
      if (liMatch) {
        if (!inList) {
          const listClass = currentSection.includes('ingredient') ? 'ingredients-list' : (currentSection.includes('preparation') || currentSection.includes('instruction')) ? 'steps-list' : '';
            html += `<ul${listClass ? ` class=\"${listClass}\"` : ''}>`;
          inList = true;
        }
        const content = liMatch[2];
        html += `<li>${escape(content)}</li>`;
        continue;
      }

      // Paragraph (merge lines separated by blank lines only)
      closeList();
      html += `<p>${escape(original)}</p>`;
    }
    closeList();
    return html;
  }
}
