import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {BehaviorSubject, catchError, filter, Observable, of} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {
  collection,
  DocumentSnapshot,
  Firestore,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  startAfter,
  where
} from '@angular/fire/firestore';
import {ClientInterface} from '../../../core/interfaces/user.interface';
import {USER_ROLES_ENUM} from '../../../core/enums/users-roles.enum';
import {UsersFiltersInterface} from './interfaces/users-filters.interface';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private botToken = environment.clientBUKBotToken;

  private userUpdatedSubject = new BehaviorSubject<boolean>(null);
  userUpdatedState$: Observable<boolean>;

  private readonly activeStatuses = ['ACTIVE', 'NEW', 'BLOCKED', 'DELAY_START'];

  constructor(
    private firestore: Firestore,
    private http: HttpClient
  ) {
    this.userUpdatedState$ = this.userUpdatedSubject.asObservable().pipe(filter(user => user !== null));
  }

  userUpdated(): void {
    this.userUpdatedSubject.next(true);
  }

  getClientsCount(
    userRole: USER_ROLES_ENUM,
    coachId: string,
    filters?: UsersFiltersInterface | null,
  ): Promise<number> {
    const constraints = this.buildQueryConstraints(userRole, coachId, filters);
    const q = query(collection(this.firestore, 'clients'), ...constraints);

    return getDocs(q)
      .then(snapshot => snapshot.size)
      .catch(error => {
        console.error('Помилка отримання кількості користувачів: ', error);
        return 0;
      });
  }

  getClientsPage(
    userRole: USER_ROLES_ENUM,
    coachId: string,
    pageSize: number,
    pageIndex: number,
    lastVisible: DocumentSnapshot | null,
    filters?: UsersFiltersInterface | null,
  ): Promise<{ clients: ClientInterface[]; lastVisible: DocumentSnapshot | null }> {
    const constraints = this.buildQueryConstraints(userRole, coachId, filters);

    let q = query(
      collection(this.firestore, 'clients'),
      ...constraints,
      orderBy('createdAt', 'desc'),
      limit(pageSize),
    );

    if (lastVisible && pageIndex > 0) {
      q = query(q, startAfter(lastVisible));
    }

    return getDocs(q)
      .then(snapshot => {
        if (snapshot.empty) {
          return { clients: [], lastVisible: null };
        }

        const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClientInterface));
        const newLastVisible = snapshot.docs[snapshot.docs.length - 1];

        return { clients, lastVisible: newLastVisible };
      })
      .catch(error => {
        console.error('Помилка отримання користувачів: ', error);
        return { clients: [], lastVisible: null };
      });
  }

  private buildQueryConstraints(
    userRole: USER_ROLES_ENUM,
    coachId: string,
    filters?: UsersFiltersInterface | null,
  ): QueryConstraint[] {
    const constraints: QueryConstraint[] = [];

    if (userRole === USER_ROLES_ENUM.TRAINER) {
      constraints.push(where('coachId', '==', coachId));
    } else if (filters?.coachId) {
      constraints.push(where('coachId', '==', filters.coachId));
    }

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    } else {
      constraints.push(where('status', 'in', this.activeStatuses));
    }

    if (filters?.trainingType) {
      constraints.push(where('trainingType', '==', filters.trainingType));
    }

    return constraints;
  }

  getUpdates(offset: number): Observable<any> {
    return this.http.get(`https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${offset}`);
  }

  sendMessage(apiUrl: string, formData: FormData): Observable<any> {
    return this.http.post(apiUrl, formData).pipe(
      catchError((err) => {
        console.error('Помилка відправки повідомлення: ', err);
        return of({ error: err });
      })
    );
  }
}
