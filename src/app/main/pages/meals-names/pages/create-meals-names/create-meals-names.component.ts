import { Component, OnInit } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MealTypeEnum } from '../../enums/meal-type.enum';

@Component({
  selector: 'app-create-exercise',
  templateUrl: './create-meals-names.component.html',
  styleUrls: ['./create-meals-names.component.scss']
})
export class CreateMealsNamesComponent implements OnInit {

  formGroup: FormGroup;
  expandedBlocks: boolean[] = [];

  readonly MEAL_OPTIONS = [
    { value: MealTypeEnum.BREAKFAST, label: 'Сніданок' },
    { value: MealTypeEnum.LUNCH,     label: 'Обід'     },
    { value: MealTypeEnum.DINNER,    label: 'Вечеря'   },
    { value: MealTypeEnum.SNACK,     label: 'Перекус'  },
  ];

  constructor(
    private firestore: Firestore,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      name: this.fb.control(null),
      comment: this.fb.control(null),
      meals: this.fb.array([]),
    });
  }

  get mealsArray(): FormArray {
    return this.formGroup.get('meals') as FormArray;
  }

  createMealBlock(data?: any): FormGroup {
    return this.fb.group({
      type: [data?.type || MealTypeEnum.BREAKFAST],
      calories: [data?.calories || ''],
      protein: [data?.protein || ''],
      fat: [data?.fat || ''],
      carbs: [data?.carbs || ''],
      content: [data?.content || ''],
    });
  }

  addMealBlock(): void {
    this.mealsArray.push(this.createMealBlock());
    this.expandedBlocks.push(true);
  }

  removeMealBlock(index: number, event: Event): void {
    event.stopPropagation();
    this.mealsArray.removeAt(index);
    this.expandedBlocks.splice(index, 1);
  }

  toggleBlock(index: number): void {
    this.expandedBlocks[index] = !this.expandedBlocks[index];
  }

  getMealLabel(type: string): string {
    const map: { [key: string]: string } = {
      [MealTypeEnum.BREAKFAST]: 'Сніданок',
      [MealTypeEnum.LUNCH]:     'Обід',
      [MealTypeEnum.DINNER]:    'Вечеря',
      [MealTypeEnum.SNACK]:     'Перекус',
    };
    return map[type] || type;
  }

  getMealEmoji(type: string): string {
    const map: { [key: string]: string } = {
      [MealTypeEnum.BREAKFAST]: '🌅',
      [MealTypeEnum.LUNCH]:     '☀️',
      [MealTypeEnum.DINNER]:    '🌙',
      [MealTypeEnum.SNACK]:     '🍎',
    };
    return map[type] || '🍽️';
  }

  getMealColor(type: string): string {
    const map: { [key: string]: string } = {
      [MealTypeEnum.BREAKFAST]: '#F2AF4A',
      [MealTypeEnum.LUNCH]:     '#27AE60',
      [MealTypeEnum.DINNER]:    '#9B51E0',
      [MealTypeEnum.SNACK]:     '#3FA1FB',
    };
    return map[type] || '#3FA1FB';
  }

  async createUser(): Promise<void> {
    try {
      const payload = { ...this.formGroup.value, id: this.generateUUID() };
      const collectionRef = collection(this.firestore, 'meals-names');
      await addDoc(collectionRef, payload);
      this.snackBar.open('Харчування успішно створено', 'Закрити', { duration: 2000 });
      this.router.navigate(['/meals']);
    } catch (error) {
      console.error('Помилка створення:', error);
      this.snackBar.open('Помилка створення харчування', 'Закрити', { duration: 2000 });
    }
  }

  generateUUID(): string {
    return crypto.randomUUID();
  }
}
