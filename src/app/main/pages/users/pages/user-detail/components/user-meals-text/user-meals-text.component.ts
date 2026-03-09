import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Firestore, collection, doc, getDocs, query, setDoc, updateDoc, where, addDoc } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, Observable } from 'rxjs';
import { MealsNamesDialogComponent } from './dialogs/meals-names-dialog/meals-names-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MealTypeEnum } from '../../../../../meals-names/enums/meal-type.enum';

@Component({
  selector: 'bk-user-meals-text',
  templateUrl: './user-meals-text.component.html',
  styleUrls: ['./user-meals-text.component.scss']
})
export class UserMealsTextComponent implements OnInit {
  user: any;
  id: string;
  formGroup: FormGroup;
  expandedBlocks: boolean[] = [];

  readonly MEAL_OPTIONS = [
    { value: MealTypeEnum.BREAKFAST, label: 'Сніданок' },
    { value: MealTypeEnum.LUNCH,     label: 'Обід'     },
    { value: MealTypeEnum.DINNER,    label: 'Вечеря'   },
    { value: MealTypeEnum.SNACK,     label: 'Перекус'  },
  ];

  constructor(
    private snackBar: MatSnackBar,
    private firestore: Firestore,
    private storage: Storage,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    this.formGroup = this.fb.group({
      text: this.fb.control(null),
      id: this.fb.control(null),
      meals: this.fb.array([]),
    });

    this.getUserById(this.id);
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

  openMealsDialog(): void {
    this.dialog.open(MealsNamesDialogComponent, {
      width: '100%',
      maxWidth: '100vw',
      height: '100%',
    }).afterClosed().subscribe(data => {
      if (data !== null && data !== undefined) {
        // Legacy: copy comment to text field
        this.formGroup.get('text').setValue(data.comment || null);

        // New: populate structured meals from template
        this.mealsArray.clear();
        this.expandedBlocks = [];
        if (data.meals && Array.isArray(data.meals)) {
          data.meals.forEach((meal: any) => {
            this.mealsArray.push(this.createMealBlock(meal));
            this.expandedBlocks.push(true);
          });
        }
      }
    });
  }

  updateUser(): void {
    const payload = { ...this.formGroup.value };
    const mealsCollection = collection(this.firestore, 'meals');
    const q = query(mealsCollection, where('id', '==', this.user.id));

    getDocs(q).then(snapshot => {
      if (snapshot.empty) {
        addDoc(mealsCollection, payload)
          .then(() => this.snackBar.open('Дані успішно додано', 'Закрити', { duration: 2000 }))
          .catch(error => console.error('Помилка додавання:', error));
      } else {
        snapshot.forEach(docSnap => {
          const docRef = doc(this.firestore, 'meals', docSnap.id);
          updateDoc(docRef, payload)
            .then(() => this.snackBar.open('Дані успішно оновлено', 'Закрити', { duration: 2000 }))
            .catch(error => console.error('Помилка оновлення:', error));
        });
      }
    });
  }

  getUserById(id: string): void {
    const userCollection = collection(this.firestore, 'clients');
    const q = query(userCollection, where('id', '==', id));

    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        this.user = snapshot.docs[0].data();
        this.formGroup.patchValue({ id: this.user.id });
        this.getCaloriesData();
      } else {
        console.warn('Користувач не знайдений.');
      }
    }).catch(error => console.error('Помилка отримання користувача:', error));
  }

  getCaloriesData(): void {
    const mealsCollection = collection(this.firestore, 'meals');
    const q = query(mealsCollection, where('id', '==', this.user.id));

    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        snapshot.forEach(docSnap => {
          const userData: any = docSnap.data();
          const { meals, ...rest } = userData;

          this.formGroup.patchValue(rest);

          this.mealsArray.clear();
          this.expandedBlocks = [];
          if (meals && Array.isArray(meals)) {
            meals.forEach((meal: any) => {
              this.mealsArray.push(this.createMealBlock(meal));
              this.expandedBlocks.push(false);
            });
          }
        });
      }
    }).catch(error => console.error('Помилка отримання даних про харчування:', error));
  }
}
