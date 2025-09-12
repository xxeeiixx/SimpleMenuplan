import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-meal-form',
  standalone: true,
  imports: [CommonModule],
  template: `
  <section class="grocery-list-container">
    <h2 class="grocery-list-heading">Add a New Meal</h2>
    <form class="edit-mode-container" (submit)="onSubmit($event)">
  <select class="meal-input" [value]="day" (change)="onDayChange($event)">
        @for (d of days; track d) { <option [value]="d">{{ d }}</option> }
      </select>
  <input class="meal-input" [value]="mealName" (input)="onMealInput($event)" placeholder="Meal name" required />
      <div class="button-group">
        <button class="suggest-button" type="button" (click)="suggest.emit()" [disabled]="loadingSuggest">{{ loadingSuggest ? '…' : '✨ Suggest' }}</button>
        <button class="save-button" type="submit">Add</button>
      </div>
    </form>
  </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddMealFormComponent {
  @Input() days: string[] = [];
  @Input() day = '';
  @Input() mealName = '';
  @Input() loadingSuggest = false;
  @Output() dayChange = new EventEmitter<string>();
  @Output() mealNameChange = new EventEmitter<string>();
  @Output() add = new EventEmitter<void>();
  @Output() suggest = new EventEmitter<void>();

  onSubmit(ev: Event) {
    ev.preventDefault();
    this.add.emit();
  }

  onDayChange(ev: Event) {
    const value = (ev.target as HTMLSelectElement | null)?.value ?? '';
    this.dayChange.emit(value);
  }

  onMealInput(ev: Event) {
    const value = (ev.target as HTMLInputElement | null)?.value ?? '';
    this.mealNameChange.emit(value);
  }
}
