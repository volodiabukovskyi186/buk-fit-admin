import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { delay, from } from 'rxjs';

@Component({
  selector: 'bk-user-meals',
  templateUrl: './user-meals.component.html',
  styleUrls: ['./user-meals.component.scss']
})
export class UserMealsComponent implements OnInit {
  user: any;
  id: any;
  formGroup: FormGroup;
  products = [];

  constructor(
    private snackBar: MatSnackBar,
    public firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.getUserById(this.id);
    this.loadProducts();

    this.formGroup = this.fb.group({
      days: this.fb.array([])
    });

    this.addMeals();
  }

  calculateNutrients(dayIndex: number, mealIndex: number): void {
    const meal = (this.days.at(dayIndex).get('meals') as FormArray).at(mealIndex);
    const selectedMeals = meal.get('meals') as FormArray;

    let totalCalories = 0;
    let totalProteins = 0;
    let totalFats = 0;
    let totalCarbohydrates = 0;

    selectedMeals.controls.forEach((mealControl: FormGroup) => {
      const selectedProductName = mealControl.get('meal').value;
      const grams = mealControl.get('grams').value || 0;

      const selectedProduct = this.products.find(p => p.product === selectedProductName);

      if (selectedProduct && grams > 0) {
        // Assuming the product's nutrient values are per 100 grams
        totalCalories += (parseFloat(selectedProduct.calories) * grams) / 100;
        totalProteins += (parseFloat(selectedProduct.proteins) * grams) / 100;
        totalFats += (parseFloat(selectedProduct.fats) * grams) / 100;
        totalCarbohydrates += (parseFloat(selectedProduct.carbohydrates) * grams) / 100;
      }
    });

    // Round the values to two decimal places
    totalCalories = Math.round(totalCalories * 100) / 100;
    totalProteins = Math.round(totalProteins * 100) / 100;
    totalFats = Math.round(totalFats * 100) / 100;
    totalCarbohydrates = Math.round(totalCarbohydrates * 100) / 100;

    // Update the meal form group with calculated and rounded nutrient totals
    meal.patchValue({
      totalCalories,
      totalProteins,
      totalFats,
      totalCarbohydrates
    });

    console.log('Updated meal group:', meal.value); // Debugging

    // Manually trigger change detection
    this.cdr.detectChanges();
  }

  calculateTotalCaloriesForDay(day: FormGroup): number {
    const meals = (day.get('meals') as FormArray).controls;
    return meals.reduce((total, meal) => total + (meal.get('totalCalories').value || 0), 0);
  }

  loadProducts() {
    this.firestore.collection('products').valueChanges().subscribe((products: any[]) => {
      this.products = products;
    });
  }

  get days() {
    return this.formGroup.get('days') as FormArray;
  }

  addDay() {
    const dayGroup = this.fb.group({
      meals: this.fb.array([])
    });
    this.days.push(dayGroup);
  }

  removeDay(index: number) {
    this.days.removeAt(index);
  }

  addExercise(dayIndex: number) {
    const exerciseGroup = this.fb.group({
      name: ['', Validators.required],
      meals: this.fb.array([]),
      totalCalories: [0],
      totalProteins: [0],
      totalFats: [0],
      totalCarbohydrates: [0]
    });

    (this.days.at(dayIndex).get('meals') as FormArray).push(exerciseGroup);
  }

  addMeal(meal: FormGroup) {
    const mealGroup = this.fb.group({
      meal: ['', Validators.required],
      grams: [100, Validators.required]  // Add grams field
    });

    (meal.get('meals') as FormArray).push(mealGroup);
  }

  removeMeal(dayIndex: number, mealIndex: number, ingredientIndex: number) {
    const meal = (this.days.at(dayIndex).get('meals') as FormArray).at(mealIndex);
    (meal.get('meals') as FormArray).removeAt(ingredientIndex);
    this.calculateNutrients(dayIndex, mealIndex); // Recalculate after removal
  }

  removeExercise(dayIndex: number, exerciseIndex: number) {
    (this.days.at(dayIndex).get('meals') as FormArray).removeAt(exerciseIndex);
  }

  onSubmit() {
    console.log(this.formGroup.value);
  }

  getmeals(): void {
    this.firestore.collection('meals', ref => ref.where('id', '==', this.user.id)).get().subscribe(snapshot => {
      console.log('snapshot', snapshot);

      if (snapshot.empty) {
        console.log('No matching documents.');
      } else {
        snapshot.forEach(doc => {
          const userData: any = doc.data();
          console.log('Retrieved user data:', userData);

          // Clear existing days
          while (this.days.length) {
            this.days.removeAt(0);
          }

          // Populate form with retrieved days and meals
          userData.days.forEach((day: any) => {
            const dayGroup = this.fb.group({
              meals: this.fb.array([])
            });

            day.meals.forEach((exercise: any) => {
              const exerciseGroup = this.fb.group({
                name: [exercise.name, Validators.required],
                meals: this.fb.array([]),
                totalCalories: [exercise.totalCalories || 0],
                totalProteins: [exercise.totalProteins || 0],
                totalFats: [exercise.totalFats || 0],
                totalCarbohydrates: [exercise.totalCarbohydrates || 0]
              });

              exercise.meals.forEach((meal: any) => {
                const mealGroup = this.fb.group({
                  meal: [meal.meal, Validators.required],
                  grams: [meal.grams || 0, Validators.required]  // Initialize grams
                });
                (exerciseGroup.get('meals') as FormArray).push(mealGroup);
              });

              (dayGroup.get('meals') as FormArray).push(exerciseGroup);
            });

            this.days.push(dayGroup);
          });

          console.log('Form after population:', this.formGroup.value);
        });
      }
    }, error => {
      console.error('Error getting documents: ', error);
    });
  }

  updateUser(): void {
    const payload = {
      id: this.user.id,
      days: this.formGroup.value.days
    };

    this.firestore.collection('meals', ref => ref.where('id', '==', this.user.id)).get().subscribe(snapshot => {
      if (snapshot.empty) {
        this.firestore.collection('meals').add(payload)
          .then(() => {
            this.snackBar.open('Cтрави успішно додано');
          })
          .catch(error => {
            console.error('Помилка додавання документа: ', error);
          });
      } else {
        snapshot.forEach(doc => {
          this.firestore.collection('meals').doc(doc.id).update(payload)
            .then(() => {
              this.snackBar.open('Cтрави успішно оновлено');
            })
            .catch(error => {
              console.error('Помилка оновлення документа: ', error);
            });
        });
      }
    });
  }

  getUserById(id: string): void {
    this.firestore.collection('clients', ref => ref.where('id', '==', id))
      .valueChanges()
      .subscribe((users: any[]) => {
        this.user = users[0];
        this.getmeals();
      });
  }

  private addMeals(): void {
    // from(this.data).pipe(delay(300)).subscribe((data: any) => {
    //   console.log('111111', data);

    // })
    // this.data.forEach((meal) => {
    //   this.firestore.collection('products').add(meal);
    //   console.log('meal', meal);

    // })
  }




  data = [
    {"id": "1", "product": "Абрикос", "proteins": "0.9", "fats": "0.1", "carbohydrates": "9", "calories": "44", "protein_type": "р"},
    {"id": "2", "product": "Авокадо", "proteins": "2", "fats": "14.7", "carbohydrates": "1.8", "calories": "160", "protein_type": "р"},
    {"id": "3", "product": "Арахіс", "proteins": "26", "fats": "52", "carbohydrates": "13.4", "calories": "626", "protein_type": "р"},
    {"id": "4", "product": "Арахісова паста без цукру", "proteins": "30", "fats": "46", "carbohydrates": "12", "calories": "579", "protein_type": "р"},
    {"id": "5", "product": "Банани", "proteins": "1.5", "fats": "0.5", "carbohydrates": "21", "calories": "96", "protein_type": "р"},
    {"id": "6", "product": "Батат", "proteins": "2", "fats": "0.1", "carbohydrates": "13.3", "calories": "60", "protein_type": "р"},
    {"id": "7", "product": "Булгур", "proteins": "12.3", "fats": "1.3", "carbohydrates": "63.4", "calories": "342", "protein_type": "р"},
    {"id": "8", "product": "Вишня", "proteins": "0.8", "fats": "0.2", "carbohydrates": "10.6", "calories": "52", "protein_type": "р"},
    {"id": "9", "product": "Гейнер Myprotein Extreme Gainer", "proteins": "32", "fats": "6.3", "carbohydrates": "46", "calories": "382", "protein_type": "т"},
    {"id": "10", "product": "Гейнер Myprotein Weight Gainer", "proteins": "31.4", "fats": "6.2", "carbohydrates": "50", "calories": "375", "protein_type": "т"},
    {"id": "11", "product": "Телячий стейк", "proteins": "22.6", "fats": "13.5", "carbohydrates": "0.1", "calories": "210", "protein_type": "т"},
    {"id": "12", "product": "Гречана крупа", "proteins": "12.6", "fats": "3.3", "carbohydrates": "57.1", "calories": "308", "protein_type": "р"},
    {"id": "13", "product": "Рисова крупа", "proteins": "7.0", "fats": "0.7", "carbohydrates": "78.9", "calories": "366", "protein_type": "р"},
    {"id": "14", "product": "Ячна крупа", "proteins": "10.8", "fats": "1.3", "carbohydrates": "65.4", "calories": "330", "protein_type": "р"},
    {"id": "15", "product": "Кускус", "proteins": "12.8", "fats": "0.6", "carbohydrates": "69.1", "calories": "357", "protein_type": "р"},
    {"id": "16", "product": "Манна крупа", "proteins": "10.5", "fats": "1", "carbohydrates": "73.3", "calories": "360", "protein_type": "р"},
    {"id": "17", "product": "Пшоняна крупа", "proteins": "12.4", "fats": "2.7", "carbohydrates": "68.5", "calories": "349", "protein_type": "р"},
    {"id": "18", "product": "Вівсяні пластівці", "proteins": "12.3", "fats": "6.2", "carbohydrates": "61.8", "calories": "352", "protein_type": "р"},
    {"id": "19", "product": "Пшениця твердих сортів", "proteins": "10.3", "fats": "1.3", "carbohydrates": "65.4", "calories": "323", "protein_type": "р"},
    {"id": "20", "product": "Пшениця м'яких сортів", "proteins": "13.3", "fats": "1.7", "carbohydrates": "65.4", "calories": "319", "protein_type": "р"},
    {"id": "21", "product": "Гречка", "proteins": "12.6", "fats": "3.3", "carbohydrates": "57.1", "calories": "308", "protein_type": "р"},
    {"id": "22", "product": "Гречана крупа", "proteins": "12.6", "fats": "3.3", "carbohydrates": "57.1", "calories": "308", "protein_type": "р"},
    {"id": "23", "product": "Йогурт без цукру 1%", "proteins": "3.5", "fats": "1.5", "carbohydrates": "4.7", "calories": "41", "protein_type": "т"},
    {"id": "24", "product": "Йогурт без цукру 2%", "proteins": "3.5", "fats": "2.5", "carbohydrates": "4.7", "calories": "57", "protein_type": "т"},
    {"id": "25", "product": "Йогурт без цукру 3.5%", "proteins": "3.5", "fats": "3.5", "carbohydrates": "4.7", "calories": "74", "protein_type": "т"},
    {"id": "26", "product": "Молоко 1%", "proteins": "3.3", "fats": "1.5", "carbohydrates": "4.7", "calories": "45", "protein_type": "т"},
    {"id": "27", "product": "Молоко 2%", "proteins": "3.3", "fats": "2.5", "carbohydrates": "4.7", "calories": "60", "protein_type": "т"},
    {"id": "28", "product": "Молоко 3.5%", "proteins": "3.3", "fats": "3.5", "carbohydrates": "4.7", "calories": "74", "protein_type": "т"},
    {"id": "29", "product": "Молоко 0.5%", "proteins": "3.3", "fats": "0.5", "carbohydrates": "4.7", "calories": "36", "protein_type": "т"},
    {"id": "30", "product": "Молоко 1.5%", "proteins": "3.3", "fats": "1.5", "carbohydrates": "4.7", "calories": "45", "protein_type": "т"},
    {"id": "31", "product": "Молоко 2.5%", "proteins": "3.3", "fats": "2.5", "carbohydrates": "4.7", "calories": "59", "protein_type": "т"},
    {"id": "32", "product": "Молоко 3.2%", "proteins": "3.3", "fats": "3.2", "carbohydrates": "4.7", "calories": "63", "protein_type": "т"},
    {"id": "33", "product": "Молоко знежирене 0.5%", "proteins": "3.3", "fats": "0.5", "carbohydrates": "4.7", "calories": "33", "protein_type": "т"},
    {"id": "34", "product": "Сир кисломолочний 0%", "proteins": "16.1", "fats": "0.5", "carbohydrates": "2.7", "calories": "72", "protein_type": "т"},
    {"id": "35", "product": "Сир кисломолочний 5%", "proteins": "17.5", "fats": "5", "carbohydrates": "1.8", "calories": "120", "protein_type": "т"},
    {"id": "36", "product": "Сир кисломолочний 9%", "proteins": "16.1", "fats": "9", "carbohydrates": "2.7", "calories": "155", "protein_type": "т"},
    {"id": "37", "product": "Сир кисломолочний 1%", "proteins": "18", "fats": "1", "carbohydrates": "2", "calories": "81", "protein_type": "т"},
    {"id": "38", "product": "Сир кисломолочний 2%", "proteins": "16.5", "fats": "2", "carbohydrates": "2.7", "calories": "91", "protein_type": "т"},
    {"id": "39", "product": "Сир кисломолочний 3.5%", "proteins": "18", "fats": "3.5", "carbohydrates": "3", "calories": "99", "protein_type": "т"},
    {"id": "40", "product": "Сир кисломолочний 4%", "proteins": "16.5", "fats": "4", "carbohydrates": "2.7", "calories": "104", "protein_type": "т"},
    {"id": "41", "product": "Сир кисломолочний 5%", "proteins": "18", "fats": "5", "carbohydrates": "3", "calories": "111", "protein_type": "т"},
    {"id": "42", "product": "Сир кисломолочний 9%", "proteins": "16.5", "fats": "9", "carbohydrates": "2.7", "calories": "155", "protein_type": "т"},
    {"id": "43", "product": "Яйце куряче (білок)", "proteins": "12", "fats": "0", "carbohydrates": "0.6", "calories": "51", "protein_type": "т"},
    {"id": "44", "product": "Яйце куряче (жовток)", "proteins": "17", "fats": "31", "carbohydrates": "2", "calories": "355", "protein_type": "т"},
    {"id": "45", "product": "Яйце куряче", "proteins": "12.7", "fats": "11.5", "carbohydrates": "0.7", "calories": "157", "protein_type": "т"},
    {"id": "46", "product": "М'ясо куряче (грудка)", "proteins": "23.2", "fats": "1.2", "carbohydrates": "0.4", "calories": "110", "protein_type": "т"},
    {"id": "47", "product": "М'ясо куряче (стегно)", "proteins": "18", "fats": "6", "carbohydrates": "0", "calories": "156", "protein_type": "т"},
    {"id": "48", "product": "М'ясо куряче (гомілка)", "proteins": "19", "fats": "6", "carbohydrates": "0", "calories": "158", "protein_type": "т"},
    {"id": "49", "product": "М'ясо куряче (гомілка) з шкірою", "proteins": "16.3", "fats": "9", "carbohydrates": "0", "calories": "180", "protein_type": "т"},
    {"id": "50", "product": "М'ясо свинини (пісне)", "proteins": "21.1", "fats": "4.3", "carbohydrates": "0", "calories": "130", "protein_type": "т"},
    {"id": "51", "product": "М'ясо свинини (середньої жирності)", "proteins": "16.7", "fats": "11.9", "carbohydrates": "0", "calories": "217", "protein_type": "т"},
    {"id": "52", "product": "М'ясо свинини (жирне)", "proteins": "12.7", "fats": "33.8", "carbohydrates": "0", "calories": "362", "protein_type": "т"},
    {"id": "53", "product": "М'ясо телятини (пісне)", "proteins": "23.1", "fats": "3.9", "carbohydrates": "0", "calories": "127", "protein_type": "т"},
    {"id": "54", "product": "М'ясо телятини (середньої жирності)", "proteins": "19.6", "fats": "9.7", "carbohydrates": "0", "calories": "173", "protein_type": "т"},
    {"id": "55", "product": "М'ясо яловичини (пісне)", "proteins": "22.1", "fats": "6.6", "carbohydrates": "0", "calories": "144", "protein_type": "т"},
    {"id": "56", "product": "М'ясо яловичини (середньої жирності)", "proteins": "18.9", "fats": "15.2", "carbohydrates": "0", "calories": "217", "protein_type": "т"},
    {"id": "57", "product": "М'ясо яловичини (жирне)", "proteins": "14.4", "fats": "30.5", "carbohydrates": "0", "calories": "359", "protein_type": "т"},
    {"id": "58", "product": "Фарш курячий", "proteins": "20.3", "fats": "8.5", "carbohydrates": "0", "calories": "164", "protein_type": "т"},
    {"id": "59", "product": "Фарш індички", "proteins": "21.2", "fats": "5.8", "carbohydrates": "0", "calories": "145", "protein_type": "т"},
    {"id": "60", "product": "Фарш яловичий", "proteins": "17.5", "fats": "23.1", "carbohydrates": "0", "calories": "293", "protein_type": "т"},
    {"id": "61", "product": "Фарш свинячий", "proteins": "17.6", "fats": "16.7", "carbohydrates": "0", "calories": "250", "protein_type": "т"},
    {"id": "62", "product": "Індики", "proteins": "21", "fats": "10.2", "carbohydrates": "0", "calories": "191", "protein_type": "т"},
    {"id": "63", "product": "Філе куряче", "proteins": "23.5", "fats": "1.9", "carbohydrates": "0", "calories": "107", "protein_type": "т"},
    {"id": "64", "product": "Грудка куряча", "proteins": "23.5", "fats": "1.5", "carbohydrates": "0", "calories": "105", "protein_type": "т"},
    {"id": "65", "product": "Курка", "proteins": "21.2", "fats": "8.5", "carbohydrates": "0", "calories": "163", "protein_type": "т"},
    {"id": "66", "product": "Курка фарш", "proteins": "20.3", "fats": "8.7", "carbohydrates": "0", "calories": "169", "protein_type": "т"},
    {"id": "67", "product": "Філе індички", "proteins": "21", "fats": "10.2", "carbohydrates": "0", "calories": "191", "protein_type": "т"},
    {"id": "68", "product": "Фарш індичий", "proteins": "21.2", "fats": "5.8", "carbohydrates": "0", "calories": "145", "protein_type": "т"},
    {"id": "69", "product": "Фарш яловичий", "proteins": "17.5", "fats": "23.1", "carbohydrates": "0", "calories": "293", "protein_type": "т"},
    {"id": "70", "product": "Фарш свинячий", "proteins": "17.6", "fats": "16.7", "carbohydrates": "0", "calories": "250", "protein_type": "т"},
    {"id": "71", "product": "Гречка", "proteins": "12.6", "fats": "3.3", "carbohydrates": "57.1", "calories": "308", "protein_type": "р"},
    {"id": "72", "product": "Ячна крупа", "proteins": "10.8", "fats": "1.3", "carbohydrates": "65.4", "calories": "330", "protein_type": "р"},
    {"id": "73", "product": "Кускус", "proteins": "12.8", "fats": "0.6", "carbohydrates": "69.1", "calories": "357", "protein_type": "р"},
    {"id": "74", "product": "Манна крупа", "proteins": "10.5", "fats": "1", "carbohydrates": "73.3", "calories": "360", "protein_type": "р"},
    {"id": "75", "product": "Пшоняна крупа", "proteins": "12.4", "fats": "2.7", "carbohydrates": "68.5", "calories": "349", "protein_type": "р"},
    {"id": "76", "product": "Вівсяні пластівці", "proteins": "12.3", "fats": "6.2", "carbohydrates": "61.8", "calories": "352", "protein_type": "р"},
    {"id": "77", "product": "Пшениця твердих сортів", "proteins": "10.3", "fats": "1.3", "carbohydrates": "65.4", "calories": "323", "protein_type": "р"},
    {"id": "78", "product": "Пшениця м'яких сортів", "proteins": "13.3", "fats": "1.7", "carbohydrates": "65.4", "calories": "319", "protein_type": "р"},
    {"id": "79", "product": "Гречка", "proteins": "12.6", "fats": "3.3", "carbohydrates": "57.1", "calories": "308", "protein_type": "р"},
    {"id": "80", "product": "Гречана крупа", "proteins": "12.6", "fats": "3.3", "carbohydrates": "57.1", "calories": "308", "protein_type": "р"},
    {"id": "81", "product": "Йогурт без цукру 1%", "proteins": "3.5", "fats": "1.5", "carbohydrates": "4.7", "calories": "41", "protein_type": "т"},
    {"id": "82", "product": "Йогурт без цукру 2%", "proteins": "3.5", "fats": "2.5", "carbohydrates": "4.7", "calories": "57", "protein_type": "т"},
    {"id": "83", "product": "Йогурт без цукру 3.5%", "proteins": "3.5", "fats": "3.5", "carbohydrates": "4.7", "calories": "74", "protein_type": "т"},
    {"id": "84", "product": "Молоко 1%", "proteins": "3.3", "fats": "1.5", "carbohydrates": "4.7", "calories": "45", "protein_type": "т"},
    {"id": "85", "product": "Молоко 2%", "proteins": "3.3", "fats": "2.5", "carbohydrates": "4.7", "calories": "60", "protein_type": "т"},
    {"id": "86", "product": "Молоко 3.5%", "proteins": "3.3", "fats": "3.5", "carbohydrates": "4.7", "calories": "74", "protein_type": "т"},
    {"id": "87", "product": "Молоко 0.5%", "proteins": "3.3", "fats": "0.5", "carbohydrates": "4.7", "calories": "36", "protein_type": "т"},
    {"id": "88", "product": "Молоко 1.5%", "proteins": "3.3", "fats": "1.5", "carbohydrates": "4.7", "calories": "45", "protein_type": "т"},
    {"id": "89", "product": "Молоко 2.5%", "proteins": "3.3", "fats": "2.5", "carbohydrates": "4.7", "calories": "59", "protein_type": "т"},
    {"id": "90", "product": "Молоко 3.2%", "proteins": "3.3", "fats": "3.2", "carbohydrates": "4.7", "calories": "63", "protein_type": "т"},
    {"id": "91", "product": "Молоко знежирене 0.5%", "proteins": "3.3", "fats": "0.5", "carbohydrates": "4.7", "calories": "33", "protein_type": "т"},
    {"id": "92", "product": "Сир кисломолочний 0%", "proteins": "16.1", "fats": "0.5", "carbohydrates": "2.7", "calories": "72", "protein_type": "т"},
    {"id": "93", "product": "Сир кисломолочний 5%", "proteins": "17.5", "fats": "5", "carbohydrates": "1.8", "calories": "120", "protein_type": "т"},
    {"id": "94", "product": "Сир кисломолочний 9%", "proteins": "16.1", "fats": "9", "carbohydrates": "2.7", "calories": "155", "protein_type": "т"},
    {"id": "95", "product": "Сир кисломолочний 1%", "proteins": "18", "fats": "1", "carbohydrates": "2", "calories": "81", "protein_type": "т"},
    {"id": "96", "product": "Сир кисломолочний 2%", "proteins": "16.5", "fats": "2", "carbohydrates": "2.7", "calories": "91", "protein_type": "т"},
    {"id": "97", "product": "Сир кисломолочний 3.5%", "proteins": "18", "fats": "3.5", "carbohydrates": "3", "calories": "99", "protein_type": "т"},
    {"id": "98", "product": "Сир кисломолочний 4%", "proteins": "16.5", "fats": "4", "carbohydrates": "2.7", "calories": "104", "protein_type": "т"},
    {"id": "99", "product": "Сир кисломолочний 5%", "proteins": "18", "fats": "5", "carbohydrates": "3", "calories": "111", "protein_type": "т"},
    {"id": "100", "product": "Сир кисломолочний 9%", "proteins": "16.5", "fats": "9", "carbohydrates": "2.7", "calories": "155", "protein_type": "т"},
    {"id": "101", "product": "Яйце куряче (білок)", "proteins": "12", "fats": "0", "carbohydrates": "0.6", "calories": "51", "protein_type": "т"},
    {"id": "102", "product": "Яйце куряче (жовток)", "proteins": "17", "fats": "31", "carbohydrates": "2", "calories": "355", "protein_type": "т"},
    {"id": "103", "product": "Яйце куряче", "proteins": "12.7", "fats": "11.5", "carbohydrates": "0.7", "calories": "157", "protein_type": "т"},
    {"id": "104", "product": "М'ясо куряче (грудка)", "proteins": "23.2", "fats": "1.2", "carbohydrates": "0.4", "calories": "110", "protein_type": "т"},
    {"id": "105", "product": "М'ясо куряче (стегно)", "proteins": "18", "fats": "6", "carbohydrates": "0", "calories": "156", "protein_type": "т"},
    {"id": "106", "product": "М'ясо куряче (гомілка)", "proteins": "19", "fats": "6", "carbohydrates": "0", "calories": "158", "protein_type": "т"},
    {"id": "107", "product": "М'ясо куряче (гомілка) з шкірою", "proteins": "16.3", "fats": "9", "carbohydrates": "0", "calories": "180", "protein_type": "т"},
    {"id": "108", "product": "М'ясо свинини (пісне)", "proteins": "21.1", "fats": "4.3", "carbohydrates": "0", "calories": "130", "protein_type": "т"},
    {"id": "109", "product": "М'ясо свинини (середньої жирності)", "proteins": "16.7", "fats": "11.9", "carbohydrates": "0", "calories": "217", "protein_type": "т"},
    {"id": "110", "product": "М'ясо свинини (жирне)", "proteins": "12.7", "fats": "33.8", "carbohydrates": "0", "calories": "362", "protein_type": "т"}
]



}
