import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {BehaviorSubject, catchError, Observable, of} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {collection, getDocs, query, where} from '@angular/fire/firestore';
// import { environment } from 'src/environmentnments/environment';

@Injectable({
  providedIn: 'root'
})
export class CoachesService {
  private botToken = environment.botToken;


  constructor(private http: HttpClient) {

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



    // const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    // const body = {
    //   chat_id: chatId,
    //   text: text,
    //   // disable_notification: true
    // };
    // return this.http.post(url, body);
  }


}
