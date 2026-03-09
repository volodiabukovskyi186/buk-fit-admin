import { Component, OnInit } from '@angular/core';
import { Firestore, collection, doc, getDocs, query, where, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { JsonImportDialogComponent } from './dialogs/json-import-dialog/json-import-dialog.component';
import { MealTypeEnum } from '../../enums/meal-type.enum';


@Component({
  selector: 'app-edit-meals',
  templateUrl: './edit-exercise-home.component.html',
  styleUrls: ['./edit-exercise-home.component.scss']
})
export class EditMealsNameComponent implements OnInit {

  formGroup: FormGroup;
  id: string;
  exercise: any;
  expandedBlocks: boolean[] = [];

  mealTypeEnum = MealTypeEnum;

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
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.formGroup = this.fb.group({
      id: this.fb.control(null),
      name: this.fb.control(null),
      comment: this.fb.control(null),
      videoURL: this.fb.control(null),
      meals: this.fb.array([]),
    });

    this.getExerciseById(this.id);
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

  async updateExercise(): Promise<void> {
    try {
      const payload = { ...this.formGroup.value };
      const collectionRef = collection(this.firestore, 'meals-names');
      const q = query(collectionRef, where('id', '==', this.exercise.id));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        await addDoc(collectionRef, payload);
        this.snackBar.open('Дані успішно додано', 'Закрити', { duration: 2000 });
      } else {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, payload);
        this.snackBar.open('Дані успішно оновлено', 'Закрити', { duration: 2000 });
      }
    } catch (error) {
      console.error('Помилка оновлення:', error);
    }
  }

  getExerciseById(id: string): void {
    const collectionRef = collection(this.firestore, 'meals-names');
    const q = query(collectionRef, where('id', '==', id));

    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        this.exercise = snapshot.docs[0].data();
        const { meals, ...rest } = this.exercise;
        this.formGroup.patchValue(rest);

        if (meals && Array.isArray(meals)) {
          meals.forEach((meal: any) => {
            this.mealsArray.push(this.createMealBlock(meal));
            this.expandedBlocks.push(false);
          });
        }
      }
    }).catch(error => console.error('Помилка отримання:', error));
  }

  async deleteExercise(): Promise<void> {
    try {
      const collectionRef = collection(this.firestore, 'meals-names');
      const q = query(collectionRef, where('id', '==', this.exercise.id));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = doc(this.firestore, 'meals-names', snapshot.docs[0].id);
        await deleteDoc(docRef);
        this.snackBar.open('Харчування успішно видалено', 'Закрити', { duration: 2000 });
        this.router.navigate(['/meals']);
      }
    } catch (error) {
      console.error('Помилка видалення:', error);
    }
  }

  openJsonImportDialog(): void {
    this.dialog.open(JsonImportDialogComponent, {
      width: '620px',
      maxWidth: '96vw',
      maxHeight: '90vh',
    }).afterClosed().subscribe((meals: any[] | null) => {
      if (!meals) return;

      this.mealsArray.clear();
      this.expandedBlocks = [];
      meals.forEach((meal: any) => {
        this.mealsArray.push(this.createMealBlock(meal));
        this.expandedBlocks.push(true);
      });

      this.snackBar.open(`Завантажено ${meals.length} прийом(ів) їжі`, 'Закрити', { duration: 2000 });
    });
  }

  generateUUID(): string {
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}
