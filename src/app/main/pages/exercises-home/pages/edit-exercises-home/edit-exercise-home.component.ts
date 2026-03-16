import { Component, OnInit } from '@angular/core';
import { Firestore, collection, doc, getDocs, query, where, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, firstValueFrom, from, map, Observable, of, switchMap } from 'rxjs';
import { CdnVideoService } from '../../../../../core/services/cdn/cdn-video.service';


@Component({
  selector: 'app-edit-exercise-home',
  templateUrl: './edit-exercise-home.component.html',
  styleUrls: ['./edit-exercise-home.component.scss']
})
export class EditExerciseHomeComponent implements OnInit {

  formGroup: FormGroup;
  id: string;
  exercise: any;
  selectedFile: File | null = null;
  isSaving = false;
  initialCdnUrl: string | null = null;

  constructor(
    private firestore: Firestore, // ✅ Використання нового Firestore API
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdnVideoService: CdnVideoService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.formGroup = this.fb.group({
      id: this.fb.control(null),
      name: this.fb.control(null),
      comment: this.fb.control(null),
      videoURL: this.fb.control(null),
      url: this.fb.control(null),
    });

    this.getExerciseById(this.id);
  }

  // ✅ Оновлення або створення вправи
  updateExercise(): void {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;
    const oldCdnUrl = this.initialCdnUrl;

    this.resolveUrlBeforeSave$(oldCdnUrl).pipe(
      switchMap((resolvedUrl: string | null) => {
        this.formGroup.patchValue({ url: resolvedUrl });
        const payload = { ...this.formGroup.value };
        return this.upsertExercise$(payload);
      }),
      finalize(() => {
        this.isSaving = false;
      })
    ).subscribe({
      next: () => {
        this.initialCdnUrl = this.formGroup.get('url')?.value || null;
        this.selectedFile = null;
        this.snackBar.open('Дані успішно оновлено', 'Закрити', { duration: 2000 });
      },
      error: (error) => {
        console.error('❌ Помилка оновлення вправи:', error);
        this.snackBar.open('❌ Не вдалося оновити вправу', 'Закрити', { duration: 2500 });
      }
    });
  }

  // ✅ Отримання вправи за ID
  getExerciseById(id: string): void {
    console.log('id====1', id)
    const collectionRef = collection(this.firestore, 'exercise-names-home');
    const q = query(collectionRef, where('id', '==', id));

    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        this.exercise = snapshot.docs[0].data();
        this.formGroup.patchValue(this.exercise);
        this.initialCdnUrl = this.exercise?.url || null;
        console.log('✅ Вправа:', this.exercise);
      }
    }).catch(error => console.error('❌ Помилка отримання вправи:', error));
  }

  // ✅ Видалення вправи
  async deleteExercise(): Promise<void> {
    try {
      const collectionRef = collection(this.firestore, 'exercise-names-home');
      const q = query(collectionRef, where('id', '==', this.exercise.id));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const cdnUrl = (this.formGroup.get('url')?.value || this.exercise?.url || '').trim();
        if (cdnUrl && this.cdnVideoService.isCdnUrl(cdnUrl)) {
          await firstValueFrom(this.cdnVideoService.deleteVideoByUrl(cdnUrl));
        }

        const docRef = doc(this.firestore, 'exercise-names-home', snapshot.docs[0].id);
        await deleteDoc(docRef);
        this.snackBar.open('Вправу успішно видалено', 'Закрити', { duration: 2000 });
        this.router.navigate(['/exercises-home']);
      }
    } catch (error) {
      console.error('❌ Помилка видалення вправи:', error);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.selectedFile = file;
  }

  private resolveUrlBeforeSave$(oldCdnUrl: string | null): Observable<string | null> {
    const currentUrl = (this.formGroup.get('url')?.value || '').trim() || null;

    if (!this.selectedFile) {
      return of(currentUrl);
    }

    return this.cdnVideoService.uploadVideo(this.selectedFile).pipe(
      switchMap((newCdnUrl: string) => {
        if (!oldCdnUrl || !this.cdnVideoService.isCdnUrl(oldCdnUrl) || oldCdnUrl === newCdnUrl) {
          return of(newCdnUrl);
        }

        return this.cdnVideoService.deleteVideoByUrl(oldCdnUrl).pipe(
          map(() => newCdnUrl),
          catchError((error) => {
            console.error('❌ Помилка видалення старого файлу з CDN:', error);
            return of(newCdnUrl);
          })
        );
      })
    );
  }

  private upsertExercise$(payload: any): Observable<void> {
    const collectionRef = collection(this.firestore, 'exercise-names-home');
    const exerciseId = this.exercise?.id || this.id;
    const q = query(collectionRef, where('id', '==', exerciseId));

    return from(getDocs(q)).pipe(
      switchMap(snapshot => {
        if (snapshot.empty) {
          return from(addDoc(collectionRef, payload)).pipe(map(() => void 0));
        }

        const docRef = snapshot.docs[0].ref;
        return from(updateDoc(docRef, payload)).pipe(map(() => void 0));
      })
    );
  }


  generateUUID(): string {
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  get url(): any {
    return this.formGroup.get('url')
  }
}
