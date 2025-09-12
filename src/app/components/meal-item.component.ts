import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MealItem } from '../models/menu.models';

@Component({
  selector: 'app-meal-item',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="menu-item">
    @if (editing) {
      <div class="edit-mode-container">
        <span class="day-label">{{ item.day }}:</span>
  <input class="meal-input" [value]="draftMeal" (input)="onInput($event)" placeholder="Meal name" />
        <div class="button-group">
          <button class="save-button" (click)="save.emit()">Save</button>
          <button class="cancel-button" (click)="cancel.emit()">Cancel</button>
        </div>
      </div>
    } @else {
      <div class="view-mode-container">
        <span class="day-label">{{ item.day }}:</span>
        <span class="meal-text">{{ item.meal }}</span>
        <div class="button-group">
          <button class="edit-button" (click)="edit.emit()">✏️ Edit</button>
          <button class="suggest-button" (click)="suggest.emit()" [disabled]="suggestDisabled">{{ suggestDisabled ? '…' : '💡 Suggest' }}</button>
          <button class="suggest-button" style="background-color:#f97316" (click)="recipe.emit()" [disabled]="recipeDisabled">{{ recipeDisabled ? '…' : '📋 Recipe' }}</button>
          <button class="cancel-button" style="background-color:#dc2626" (click)="delete.emit()">🗑️</button>
        </div>
      </div>
    }
  </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MealItemComponent {
  @Input() item!: MealItem;
  @Input() editing = false;
  @Input() draftMeal = '';
  @Input() suggestDisabled = false;
  @Input() recipeDisabled = false;
  @Output() draftChange = new EventEmitter<string>();
  @Output() edit = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() suggest = new EventEmitter<void>();
  @Output() recipe = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  onInput(ev: Event) {
    const value = (ev.target as HTMLInputElement | null)?.value ?? '';
    this.draftChange.emit(value);
  }
}
