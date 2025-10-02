import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { GeminiService } from './services/gemini.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        {
          provide: GeminiService,
          useValue: {
            generateContent: () => Promise.resolve('Test content'),
            lastError: () => null
          }
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have initial menu items', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const menu = app.weeklyMenu();
    expect(menu.length).toBe(7);
    expect(menu[0].day).toBeTruthy();
    expect(menu[0].meal).toBeTruthy();
  });

  it('should add a new meal', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const initialLength = app.weeklyMenu().length;
    
    app.newDay.set('Monday');
    app.newMealName.set('Test Meal');
    app.addMeal();
    
    expect(app.weeklyMenu().length).toBe(initialLength + 1);
    expect(app.weeklyMenu().some(item => item.meal === 'Test Meal')).toBeTrue();
  });
});
