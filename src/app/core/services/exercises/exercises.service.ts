import {Injectable} from '@angular/core';

import {BehaviorSubject, catchError, from, map, Observable, of, shareReplay, tap} from 'rxjs';
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

  private exerciseNamesCache$: Observable<any[]> | null = null;
  private exerciseHomeNamesCache$: Observable<any[]> | null = null;

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
    if (this.exerciseNamesCache$) {
      return this.exerciseNamesCache$;
    }

    const collectionRef = collection(this.firestore, 'exercise-names');
    const queryName = query(collectionRef, orderBy('name'));

    this.exerciseNamesCache$ = from(getDocs(queryName)).pipe(
      map(snapshot => {
        if (snapshot.empty) {
          return [];
        }
        return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      }),
      catchError(error => {
        console.error("❌ Помилка отримання вправ:", error);
        this.exerciseNamesCache$ = null;
        return of([]);
      }),
      shareReplay(1)
    );

    return this.exerciseNamesCache$;
  }

  getExerciseHomeNames(): Observable<any[]> {
    if (this.exerciseHomeNamesCache$) {
      return this.exerciseHomeNamesCache$;
    }

    const collectionRef = collection(this.firestore, 'exercise-names-home');
    const queryName = query(collectionRef, orderBy('name'));

    this.exerciseHomeNamesCache$ = from(getDocs(queryName)).pipe(
      map(snapshot => {
        if (snapshot.empty) {
          return [];
        }
        return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      }),
      catchError(error => {
        console.error("❌ Помилка отримання вправ:", error);
        this.exerciseHomeNamesCache$ = null;
        return of([]);
      }),
      shareReplay(1)
    );

    return this.exerciseHomeNamesCache$;
  }

  clearExerciseCache() {
    this.exerciseNamesCache$ = null;
    this.exerciseHomeNamesCache$ = null;
  }

}
