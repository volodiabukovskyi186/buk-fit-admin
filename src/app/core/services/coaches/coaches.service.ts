import {Injectable} from '@angular/core';

import {BehaviorSubject, catchError, from, map, Observable, of, tap} from 'rxjs';
import {collection, Firestore, getDocs, orderBy, query, where} from '@angular/fire/firestore';
import {HttpClient} from '@angular/common/http';
import {USER_ROLES_ENUM} from '../../enums/users-roles.enum';

@Injectable({
  providedIn: 'root'
})
export class VTCoachesService {
  userCoachesListState$: Observable<any>;
  private userCoachesListSubject = new BehaviorSubject<any[]| null>([]);

  constructor(
    private http: HttpClient,
    private firestore: Firestore
  ) {
    this.userCoachesListState$ = this.userCoachesListSubject.asObservable()
  }

  setCoaches(coaches: any[]) {
    this.userCoachesListSubject.next(coaches);
  }

  getCoaches(): Observable<any[]> {

    const collectionRef = collection(this.firestore, 'admins');
    let queryName = query(collectionRef, orderBy('name'), where('role','==', USER_ROLES_ENUM.TRAINER));

    return from(getDocs(queryName)).pipe(
      map(snapshot => {
        if (snapshot.empty) {
          return [];
        }

        const coaches = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        return coaches;
      }),
      catchError(error => {
        console.error("❌ Помилка отримання Тренерів:", error);
        return of([]); // У разі помилки повертаємо порожній масив
      })
    );
  }

}
