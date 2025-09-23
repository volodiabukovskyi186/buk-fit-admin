import { Component, OnInit } from '@angular/core';
import { Firestore, collection, doc, getDocs, query, where, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-edit-exercise',
  templateUrl: './edit-exercise-home.component.html',
  styleUrls: ['./edit-exercise-home.component.scss']
})
export class EditMealsNameComponent implements OnInit {

  formGroup: FormGroup;
  id: string;
  exercise: any;

  constructor(
    private firestore: Firestore, // ✅ Використання нового Firestore API
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.formGroup = this.fb.group({
      id: this.fb.control(null),
      name: this.fb.control(null),
      comment: this.fb.control(null),
      videoURL: this.fb.control(null),
    });

    this.getExerciseById(this.id);
  }

  // ✅ Оновлення або створення вправи
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
      console.error('❌ Помилка оновлення вправи:', error);
    }
  }

  // ✅ Отримання вправи за ID
  getExerciseById(id: string): void {
    console.log('id====1', id)
    const collectionRef = collection(this.firestore, 'meals-names');
    const q = query(collectionRef, where('id', '==', id));

    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        this.exercise = snapshot.docs[0].data();
        this.formGroup.patchValue(this.exercise);
        console.log('✅ Вправа:', this.exercise);
      }
    }).catch(error => console.error('❌ Помилка отримання вправи:', error));
  }

  // ✅ Видалення вправи
  async deleteExercise(): Promise<void> {
    try {
      const collectionRef = collection(this.firestore, 'meals-names');
      const q = query(collectionRef, where('id', '==', this.exercise.id));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = doc(this.firestore, 'meals-names', snapshot.docs[0].id);
        await deleteDoc(docRef);
        this.snackBar.open('Вправу успішно видалено', 'Закрити', { duration: 2000 });
        this.router.navigate(['/meals']);
      }
    } catch (error) {
      console.error('❌ Помилка видалення вправи:', error);
    }
  }


  // ✅ Генерація унікального ID
  generateUUID(): string {
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}
