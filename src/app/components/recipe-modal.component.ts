import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeDetails } from '../models/menu.models';

@Component({
  selector: 'app-recipe-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
  @if (open && recipe) {
    <div class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="grocery-list-heading" style="margin:0">{{ recipe.title }} Recipe</h2>
          <div class="button-group" style="margin-top:0">
            <button class="cancel-button" (click)="print.emit()">🖨️ Print</button>
            <button class="cancel-button" (click)="close.emit()">✖</button>
          </div>
        </div>
        <div class="prose" [innerHTML]="recipe.content.replace('\n','<br />')"></div>
      </div>
    </div>
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecipeModalComponent {
  @Input() open = false;
  @Input() recipe: RecipeDetails | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() print = new EventEmitter<void>();
}
