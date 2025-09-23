import { HttpClient } from '@angular/common/http';
import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  addDoc,
  orderBy, limit, startAfter
} from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import {VTExercisesService} from '../../../../../../../core/services/exercises/exercises.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'bk-exesises',
  templateUrl: './exesises.component.html',
  styleUrls: ['./exesises.component.scss']
})
export class ExesisesComponent implements OnInit, OnDestroy {
  user: any;
  id: string;
  formGroup: FormGroup;
  exersiceNames = [];
  lastVisible: any = null; // Запа
  isLoading = false; // Запобігає повторним запитам
  private subscription: Subscription = new Subscription();
  constructor(
    private snackBar: MatSnackBar,
    private firestore: Firestore, // ✅ Новий Firestore API
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private vtExercisesService: VTExercisesService,
    private fb: FormBuilder,
  ) { }



  ngOnInit(): void {
    this.getExercisesState();
    this.id = this.route.snapshot.params['id'];
    this.getUserById(this.id);

    this.formGroup = this.fb.group({
      days: this.fb.array([])
    });
  }

  get days() {
    return this.formGroup.get('days') as FormArray;
  }

  addDay() {
    const dayGroup = this.fb.group({
      exercises: this.fb.array([])
    });
    this.days.push(dayGroup);
  }

  removeDay(index: number) {
    this.days.removeAt(index);
  }

  addExercise(dayIndex: number) {
    const exerciseGroup = this.fb.group({
      exerciseName: ['', Validators.required],
      setsAndReps: ['', Validators.required],
      weight: ['', Validators.required],
      comment: ['', Validators.required],
      restTime: ['', Validators.required],
      videoURL: ['', Validators.required],
    });

    (this.days.at(dayIndex).get('exercises') as FormArray).push(exerciseGroup);
  }

  removeExercise(dayIndex: number, exerciseIndex: number) {
    (this.days.at(dayIndex).get('exercises') as FormArray).removeAt(exerciseIndex);
  }

  async getExercises(): Promise<void> {
    try {
      const collectionRef = collection(this.firestore, 'exercises');
      const q = query(collectionRef, where('id', '==', this.user.id));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('⚠️ Вправи не знайдено.');
      } else {
        const userData:any = snapshot.docs[0].data();
        console.log('✅ Отримані вправи:', userData);

        this.days.clear();
        userData.days.forEach((day: any) => {
          const dayGroup = this.fb.group({
            exercises: this.fb.array([])
          });

          day.exercises.forEach((exercise: any) => {
            const exerciseGroup = this.fb.group({
              exerciseName: [exercise.exerciseName, Validators.required],
              setsAndReps: [exercise.setsAndReps, Validators.required],
              weight: [exercise.weight, Validators.required],
              comment: [exercise.comment, Validators.required],
              restTime: [exercise.restTime, Validators.required],
              videoURL: [exercise.videoURL, Validators.required],
            });

            (dayGroup.get('exercises') as FormArray).push(exerciseGroup);
          });

          this.days.push(dayGroup);
        });

        console.log('📌 Форма оновлена:', this.formGroup.value);
      }
    } catch (error) {
      console.error("❌ Помилка отримання вправ:", error);
    }
  }

  async updateExercise(): Promise<void> {
    try {
      if (this.days.length === 0) {
        this.snackBar.open('⚠️ Додайте хоча б один день!', 'Закрити', { duration: 2000 });
        return;
      }

      const payload = {
        id: this.user.id,
        days: this.formGroup.value.days
      };

      console.log('📌 Оновлення користувача:', payload);

      const collectionRef = collection(this.firestore, 'exercises');
      const q = query(collectionRef, where('id', '==', this.user.id));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Якщо запису немає — додаємо
        const newDocRef = doc(collectionRef);
        await setDoc(newDocRef, payload);
        this.snackBar.open('✅ Дані додано', 'Закрити', { duration: 2000 });
      } else {
        // Якщо запис є — оновлюємо
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, payload);
        this.snackBar.open('✅ Дані оновлено', 'Закрити', { duration: 2000 });
      }
    } catch (error) {
      console.error("❌ Помилка оновлення:", error);
    }
  }

  async getUserById(id: string): Promise<void> {
    try {
      const clientsCollection = collection(this.firestore, 'clients');
      const q = query(clientsCollection, where('id', '==', id));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        this.user = snapshot.docs[0].data();

        await this.getExercises();
      } else {
        console.warn("⚠️ Користувач не знайдений.");
      }
    } catch (error) {
      console.error("❌ Помилка отримання користувача:", error);
    }
  }

  selectExesise(data: any, control) {
    console.log('📌 Вибір вправи:', data, control);
    control.get('comment').setValue(data.comment);
    control.get('videoURL').setValue(data.videoURL);
  }

  async onSubmit(): Promise<void> {
    try {
      await this.updateExercise();
      this.snackBar.open('✅ Дані успішно збережено!', 'Закрити', { duration: 2000 });
      this.router.navigate(['/exercises']);
    } catch (error) {
      console.error("❌ Помилка при збереженні:", error);
      this.snackBar.open('❌ Помилка збереження', 'Закрити', { duration: 2000 });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getExercisesState(): void {
    const stream$ = this.vtExercisesService.userExerciseListState$.subscribe((exercises: any[]) => {
      console.log('1231231', exercises)
      if (exercises.length) {
       this.exersiceNames = [...exercises];
      }
    });

    this.subscription.add(stream$);
  }

  // async getExerciseNames(): Promise<void> {
  //   if (this.isLoading) return; // Якщо вже йде завантаження - не робимо запит
  //   this.isLoading = true;
  //
  //   try {
  //     const collectionRef = collection(this.firestore, 'exercise-names');
  //     let q = query(collectionRef, orderBy('name'));
  //
  //     // Якщо є останній елемент - починаємо запит з нього
  //     if (this.lastVisible) {
  //       q = query(collectionRef, orderBy('name'), startAfter(this.lastVisible));
  //     }
  //
  //     const snapshot = await getDocs(q);
  //
  //     if (!snapshot.empty) {
  //       this.lastVisible = snapshot.docs[snapshot.docs.length - 1]; // Запам'ятовуємо останній елемент
  //       this.exersiceNames = [...this.exersiceNames, ...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))];
  //       console.log('✅ Довантажені вправи:', this.exersiceNames);
  //     }
  //   } catch (error) {
  //     console.error("❌ Помилка отримання вправ:", error);
  //   } finally {
  //     this.isLoading = false;
  //   }
  // }

  // // Викликається при скролі вниз у списку
  // scrollEnd(): void {
  //   console.log('📌 Користувач доскролив до кінця списку, догружаємо ще 10 вправ');
  //   this.getExerciseNames();
  // }

  // async searchExcessive(searchText: string) {
  //   if (!searchText.trim()) {
  //     this.lastVisible = null; // Скидаємо пагінацію
  //     this.exersiceNames = []; // Очищаємо список перед оновленням
  //     this.getExerciseNames(); // Якщо поле пошуку порожнє, завантажуємо 10 вправ
  //     return;
  //   }
  //
  //   try {
  //     const collectionRef = collection(this.firestore, 'exercise-names');
  //     const q = query(
  //       collectionRef,
  //       orderBy('name'),
  //       where('name', '>=', searchText),
  //       where('name', '<=', searchText + '\uf8ff'), // Пошук за частковим збігом
  //       limit(10) // Завантажуємо 10 знайдених вправ
  //     );
  //
  //     const snapshot = await getDocs(q);
  //     this.exersiceNames = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //
  //     console.log('✅ Знайдені вправи:', this.exersiceNames);
  //   } catch (error) {
  //     console.error("❌ Помилка пошуку вправ:", error);
  //   }
  // }

}
