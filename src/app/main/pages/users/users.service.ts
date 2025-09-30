import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {BehaviorSubject, catchError, filter, Observable, of} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {collection, Firestore, getDocs, query, where} from '@angular/fire/firestore';
import {UserInterface} from '../../../core/interfaces/user.interface';
// import { environment } from 'src/environmentnments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private botToken = environment.clientBUKBotToken;

  private userUpdatedSubject = new BehaviorSubject<boolean>(null);
  userUpdatedState$: Observable<boolean>;

  constructor(
    private firestore: Firestore,
  private http: HttpClient
  ) { // ✅ Firestore без compat

    this.userUpdatedState$ = this.userUpdatedSubject.asObservable().pipe(filter(user => user !== null));
  }

  userUpdated(): void {
    this.userUpdatedSubject.next(true);
  }



  getUpdates(offset):Observable<any> {
    console.log('offset',offset);

    return this.http.get(`https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${offset}`)
  }

  sendMessage(apiUrl: string, formData: FormData): Observable<any> {

    return this.http.post(apiUrl, formData).pipe(
      catchError((err) => {
        console.log('ERROR=====>', err);

        return of({ error: err })
      })
    )
  }


}
