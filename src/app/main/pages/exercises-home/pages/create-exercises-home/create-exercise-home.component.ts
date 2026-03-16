import { Component, OnInit } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, switchMap } from 'rxjs';
import { CdnVideoService } from '../../../../../core/services/cdn/cdn-video.service';

@Component({
  selector: 'app-create-exercise-home',
  templateUrl: './create-exercise-home.component.html',
  styleUrls: ['./create-exercise-home.component.scss']
})
export class CreateExerciseHomeComponent implements OnInit {

  formGroup: FormGroup;
  selectedFile: File | null = null;
  isSaving = false;

  constructor(
    private firestore: Firestore,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router,
    private cdnVideoService: CdnVideoService
  ) { }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      name: this.fb.control(null),
      comment: this.fb.control(null),
      videoURL: this.fb.control(null),
      url: this.fb.control(null),
    });
  }

  createUser(): void {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;

    this.resolveUrlBeforeSave$().pipe(
      switchMap((resolvedUrl: string | null) => {
        this.formGroup.patchValue({ url: resolvedUrl });
        const payload = { ...this.formGroup.value, id: this.generateUUID() };
        const collectionRef = collection(this.firestore, 'exercise-names-home');
        return new Observable<void>(observer => {
          addDoc(collectionRef, payload)
            .then(() => { observer.next(); observer.complete(); })
            .catch(err => observer.error(err));
        });
      }),
      finalize(() => {
        this.isSaving = false;
      })
    ).subscribe({
      next: () => {
        this.snackBar.open('✅ Вправу успішно створено', 'Закрити', { duration: 2000 });
        this.router.navigate(['/exercises-home']);
      },
      error: (error) => {
        console.error('❌ Помилка створення вправи:', error);
        this.snackBar.open('❌ Помилка створення вправи', 'Закрити', { duration: 2000 });
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] || null;
  }

  private resolveUrlBeforeSave$(): Observable<string | null> {
    const currentUrl = (this.formGroup.get('url')?.value || '').trim() || null;

    if (!this.selectedFile) {
      return of(currentUrl);
    }

    return this.cdnVideoService.uploadVideo(this.selectedFile).pipe(
      map((newCdnUrl: string) => newCdnUrl),
      catchError((error) => {
        console.error('❌ Помилка завантаження відео:', error);
        return of(currentUrl);
      })
    );
  }

  get url(): any {
    return this.formGroup.get('url');
  }

  generateUUID(): string {
    return crypto.randomUUID();
  }
}
