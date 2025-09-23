import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'bk-user-calories',
  templateUrl: './user-calories.component.html',
  styleUrls: ['./user-calories.component.scss']
})
export class UserCaloriesComponent implements OnInit {
  formGroup: FormGroup;
  products: any[] = [];
  mealNutrients: any[][] = [];
  user: any = { id: 'user-id' }; // Replace with actual user identification logic
  id: any;

  constructor(
    private fb: FormBuilder,
    public firestore: AngularFirestore,
    private snackBar: MatSnackBar, // Assuming you use Angular Material Snackbar for notifications
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      days: this.fb.array([this.createDay()])
    });

    this.id = this.route.snapshot.params['id'];
    this.getUserById(this.id);

    this.loadProducts();
    this.initializeMealNutrients();
    this.getCaloriesData(); // Load the data when component initializes
  }

  get days() {
    return this.formGroup.get('days') as FormArray;
  }

  createDay(): FormGroup {
    return this.fb.group({
      meals: this.fb.array([this.createMeal()])
    });
  }

  createMeal(): FormGroup {
    return this.fb.group({
      products: this.fb.array([this.createProduct()])
    });
  }

  createProduct(): FormGroup {
    return this.fb.group({
      product: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(1)]]
    });
  }

  addDay() {
    this.days.push(this.createDay());
    this.mealNutrients.push([]);
  }

  removeDay(dayIndex: number) {
    this.days.removeAt(dayIndex);
    this.mealNutrients.splice(dayIndex, 1);
  }

  addMeal(dayIndex: number) {
    const meals = this.days.at(dayIndex).get('meals') as FormArray;
    meals.push(this.createMeal());
    this.mealNutrients[dayIndex].push([]);
  }

  removeMeal(dayIndex: number, mealIndex: number) {
    const meals = this.days.at(dayIndex).get('meals') as FormArray;
    meals.removeAt(mealIndex);
    this.mealNutrients[dayIndex].splice(mealIndex, 1);
  }

  addProduct(dayIndex: number, mealIndex: number) {
    const products = (this.days.at(dayIndex).get('meals') as any).at(mealIndex).get('products') as FormArray;
    products.push(this.createProduct());
  }

  removeProduct(dayIndex: number, mealIndex: number, productIndex: number) {
    const products = (this.days.at(dayIndex).get('meals') as any).at(mealIndex).get('products') as FormArray;
    products.removeAt(productIndex);
    this.calculateNutrients(dayIndex, mealIndex);
  }

  loadProducts() {
    this.firestore.collection('products').valueChanges().subscribe((products: any[]) => {
      this.products = products;
    });
  }

  calculateNutrients(dayIndex: number, mealIndex: number) {
    const day = this.days.at(dayIndex);
    const meal = (day.get('meals') as FormArray).at(mealIndex);
    const products = meal.get('products') as FormArray;

    const mealNutrients = {
      proteins: 0,
      fats: 0,
      carbohydrates: 0,
      calories: 0
    };

    products.controls.forEach(productGroup => {
      const product = this.products.find(p => p.product === productGroup.get('product')?.value);
      if (product) {
        const weight = productGroup.get('weight')?.value;
        mealNutrients.proteins += (product.proteins * weight / 100);
        mealNutrients.fats += (product.fats * weight / 100);
        mealNutrients.carbohydrates += (product.carbohydrates * weight / 100);
        mealNutrients.calories += (product.calories * weight / 100);
      }
    });

    this.mealNutrients[dayIndex][mealIndex] = {
      proteins: mealNutrients.proteins.toFixed(2),
      fats: mealNutrients.fats.toFixed(2),
      carbohydrates: mealNutrients.carbohydrates.toFixed(2),
      calories: mealNutrients.calories.toFixed(2)
    };
  }




  getTotal(column: string) {
    return this.mealNutrients.reduce((dayTotal, day) => {
      return dayTotal + day.reduce((mealTotal, meal) => {
        return mealTotal + parseFloat(meal[column] || '0');
      }, 0);
    }, 0).toFixed(2);
  }

  private initializeMealNutrients() {
    this.mealNutrients = this.days.controls.map(() => []);
  }

  getCaloriesData(): void {
    this.firestore.collection('calories', ref => ref.where('id', '==', this.user.id)).get().subscribe(snapshot => {
      if (snapshot.empty) {
        console.log('No matching documents.');
      } else {
        snapshot.forEach(doc => {
          const userData: any = doc.data();

          // Clear existing days
          while (this.days.length) {
            this.days.removeAt(0);
          }

          // Populate form with retrieved days and meals
          userData.days.forEach((day: any) => {
            const dayGroup = this.fb.group({
              meals: this.fb.array([])
            });

            day.meals.forEach((meal: any) => {
              const mealGroup = this.fb.group({
                products: this.fb.array([])
              });

              meal.products.forEach((product: any) => {
                const productGroup = this.fb.group({
                  product: [product.product, Validators.required],
                  weight: [product.weight, [Validators.required, Validators.min(1)]]
                });

                (mealGroup.get('products') as FormArray).push(productGroup);
              });

              (dayGroup.get('meals') as FormArray).push(mealGroup);
            });

            this.days.push(dayGroup);
          });

          this.initializeMealNutrients();

          userData.days.forEach((day: any, dayIndex: number) => {
            day.meals.forEach((meal: any, mealIndex: number) => {
              this.calculateNutrients(dayIndex, mealIndex);
            });
          });
          console.log('Form after population:', this.formGroup.value);
        });
      }
    }, error => {
      console.error('Error getting documents: ', error);
    });
  }

  updateCaloriesData(): void {
    const payload = {
      id: this.user.id,
      days: this.formGroup.value.days
    };

    this.firestore.collection('calories', ref => ref.where('id', '==', this.user.id)).get().subscribe(snapshot => {
      if (snapshot.empty) {
        this.firestore.collection('calories').add(payload)
          .then(() => {
            this.snackBar.open('Дані успішно додано', 'Закрити', { duration: 2000 });
          })
          .catch(error => {
            console.error('Помилка додавання документа: ', error);
          });
      } else {
        snapshot.forEach(doc => {
          this.firestore.collection('calories').doc(doc.id).update(payload)
            .then(() => {
              this.snackBar.open('Дані успішно оновлено', 'Закрити', { duration: 2000 });
            })
            .catch(error => {
              console.error('Помилка оновлення документа: ', error);
            });
        });
      }
    });
  }

  clearForm(): void {

    this.formGroup = this.fb.group({
      days: this.fb.array([this.createDay()])
    });

    this.initializeMealNutrients();

    this.updateCaloriesData();
  }

  getUserById(id: string): void {
    this.firestore.collection('clients', ref => ref.where('id', '==', id))
      .valueChanges()
      .subscribe((users: any[]) => {
        this.user = users[0];
        console.log(' this.user', this.user);
        this.getCaloriesData();
      });
  }
}
