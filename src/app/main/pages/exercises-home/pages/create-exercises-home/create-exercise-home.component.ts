import { Component, OnInit } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-exercise',
  templateUrl: './create-exercise-home.component.html',
  styleUrls: ['./create-exercise-home.component.scss']
})
export class CreateExerciseHomeComponent implements OnInit {

  formGroup: FormGroup;

  constructor(
    private firestore: Firestore, // ✅ Новий Firestore API
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      name: this.fb.control(null),
      comment: this.fb.control(null),
      videoURL: this.fb.control(null),
    });
  }

  async createUser(): Promise<void> {
    try {
      const payload = { ...this.formGroup.value, id: this.generateUUID() }; // Додаємо `id`
      const collectionRef = collection(this.firestore, 'exercise-names-home');

      await addDoc(collectionRef, payload); // ✅ Асинхронне додавання у Firestore

      this.snackBar.open('✅ Вправу успішно створено', 'Закрити', { duration: 2000 });
      this.router.navigate(['/exercises-home']);
    } catch (error) {
      console.error("❌ Помилка створення вправи:", error);
      this.snackBar.open('❌ Помилка створення вправи', 'Закрити', { duration: 2000 });
    }
  }

  generateUUID(): string {
    return crypto.randomUUID(); // ✅ Використовуємо вбудовану функцію для UUID
  }
}
