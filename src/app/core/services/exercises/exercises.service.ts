import {Injectable} from '@angular/core';

import {BehaviorSubject, catchError, from, map, Observable, of, tap} from 'rxjs';
import {collection, Firestore, getDocs, orderBy, query, startAfter} from '@angular/fire/firestore';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VTExercisesService {
  userExerciseHomeListState$: Observable<any>;
  userExerciseListState$: Observable<any>;

  private userExerciseHomeListSubject = new BehaviorSubject<any[]| null>([]);
  private userExerciseListSubject = new BehaviorSubject<any[]| null>([]);

  constructor(
    private http: HttpClient,
    private firestore: Firestore
  ) {
    this.userExerciseListState$ = this.userExerciseListSubject.asObservable();
    this.userExerciseHomeListState$ = this.userExerciseHomeListSubject.asObservable();
  }

  setExercises(exercises: any[]) {
    this.userExerciseListSubject.next(exercises);
  }

  setExercisesHome(exercises: any[]) {
    this.userExerciseHomeListSubject.next(exercises);
  }

  getExerciseNames(): Observable<any[]> {
    const collectionRef = collection(this.firestore, 'exercise-names');
    let queryName = query(collectionRef, orderBy('name'));

    return from(getDocs(queryName)).pipe(
      // tap(() => console.log('📌 Запит на отримання вправ...')),
      map(snapshot => {
        if (snapshot.empty) {

          return [];
        }

        const exercises = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

        return exercises;
      }),
      catchError(error => {
        console.error("❌ Помилка отримання вправ:", error);

        return of([]); // У разі помилки повертаємо порожній масив
      })
    );
  }

  getExerciseHomeNames(): Observable<any[]> {
    const collectionRef = collection(this.firestore, 'exercise-names-home');
    let queryName = query(collectionRef, orderBy('name'));

    return from(getDocs(queryName)).pipe(
      tap(() => console.log('📌 Запит на отримання вправ...')),
      map(snapshot => {
        if (snapshot.empty) {
          console.log('⚠️ Вправи не знайдено.');
          return [];
        }

        const exercises = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        // console.log('✅ Довантажені вправи:', exercises);
        return exercises;
      }),
      catchError(error => {
        console.error("❌ Помилка отримання вправ:", error);

        return of([]); // У разі помилки повертаємо порожній масив
      })
    );
  }

}
