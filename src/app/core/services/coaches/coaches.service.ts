import {Injectable} from '@angular/core';

import {BehaviorSubject, catchError, from, map, Observable, of} from 'rxjs';
import {
  collection,
  DocumentSnapshot,
  Firestore,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where
} from '@angular/fire/firestore';
import {HttpClient} from '@angular/common/http';
import {USER_ROLES_ENUM} from '../../enums/users-roles.enum';
import {UserInterface} from '../../interfaces/user.interface';

export interface TrainersPaginatedResult {
  coaches: UserInterface[];
  lastVisible: DocumentSnapshot | null;
}

@Injectable({
  providedIn: 'root'
})
export class VTCoachesService {
  userCoachesListState$: Observable<any>;
  private userCoachesListSubject = new BehaviorSubject<any[] | null>([]);

  constructor(
    private http: HttpClient,
    private firestore: Firestore
  ) {
    this.userCoachesListState$ = this.userCoachesListSubject.asObservable();
  }

  setCoaches(coaches: any[]): void {
    this.userCoachesListSubject.next(coaches);
  }

  getCoaches(): Observable<UserInterface[]> {
    const collectionRef = collection(this.firestore, 'admins');
    const queryName = query(collectionRef, orderBy('name'), where('role', '==', USER_ROLES_ENUM.TRAINER));

    return from(getDocs(queryName)).pipe(
      map(snapshot => {
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as UserInterface));
      }),
      catchError(error => {
        console.error('❌ Помилка отримання Тренерів:', error);
        return of([]);
      })
    );
  }

  getTrainersCount(): Observable<number> {
    const collectionRef = collection(this.firestore, 'admins');
    const q = query(collectionRef, where('role', '==', USER_ROLES_ENUM.TRAINER));

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.size),
      catchError(error => {
        console.error('❌ Помилка отримання кількості тренерів:', error);
        return of(0);
      })
    );
  }

  getTrainersPaginated(pageSize: number, lastVisible: DocumentSnapshot | null = null): Observable<TrainersPaginatedResult> {
    const collectionRef = collection(this.firestore, 'admins');
    let q = query(
      collectionRef,
      orderBy('createdAt', 'desc'),
      where('role', '==', USER_ROLES_ENUM.TRAINER),
      limit(pageSize)
    );

    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }

    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) return {coaches: [], lastVisible: null};
        return {
          coaches: snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as UserInterface)),
          lastVisible: snapshot.docs[snapshot.docs.length - 1]
        };
      }),
      catchError(error => {
        console.error('❌ Помилка отримання тренерів (пагінація):', error);
        return of({coaches: [], lastVisible: null});
      })
    );
  }

}
