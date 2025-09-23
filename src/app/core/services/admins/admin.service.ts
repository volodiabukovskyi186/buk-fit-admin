import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminsService {
  // admin: any;
  //
  // admin$!: Observable<any[]>;
  // private adminSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  //
  // constructor(
  //   private firestore: AngularFirestore,
  //   private router: Router
  //   ) {
  //   this.admin$ = this.adminSubject.asObservable();
  // }
  //
  // signIn(login, password): Observable<any> {
  //   return this.firestore.collection('clients', ref =>
  //     ref.where('login', '==', login).where('password', '==', password))
  //     .snapshotChanges().pipe(
  //       map((changes: any) => {
  //
  //         const admin = changes.map((change: any) => {
  //           const data = change.payload.doc.data();
  //           const id = change.payload.doc.id;
  //           return { id, ...data };
  //         });
  //
  //         if (admin) {
  //           this.setAdmin(admin[0]);
  //
  //           return admin[0];
  //         } else {
  //           this.setAdmin(null);
  //
  //           return null;
  //         }
  //       })
  //     )
  //
  // }
  //
  // setAdmin(admin): void {
  //   this.admin = admin;
  //   this.setAdminInLocalStorage();
  //
  //   this.adminSubject.next(admin);
  // }
  //
  // isLoggedIn() {
  //   this.getLocalStorageAdmin();
  //
  //   if(!this.admin) {
  //     return false;
  //   }
  //
  //
  //   return this.firestore.collection('clients', ref =>
  //     ref.where('login', '==', this.admin.login).where('password', '==', this.admin.password))
  //     .snapshotChanges().pipe(
  //       map((changes: any) => {
  //
  //         const admin = changes.map((change: any) => {
  //           const data = change.payload.doc.data();
  //           const id = change.payload.doc.id;
  //           return { id, ...data };
  //         });
  //
  //         if (admin) {
  //           this.admin = admin[0];
  //
  //           this.setAdmin(admin[0]);
  //           return true
  //         } else {
  //           this.setAdmin(null);
  //           this.admin = null;
  //           this.router.navigate(['auth/login']);
  //           return false;
  //         }
  //       })
  //     )
  //
  // }
  //
  // logOut(): void {
  //   this.setAdmin(null);
  //   this.admin = null;
  //   this.router.navigate(['auth/login']);
  // }
  //
  // private getLocalStorageAdmin(): void {
  //   const admin = localStorage.getItem('admin');
  //   this.admin = admin ? JSON.parse(admin) : null;
  //
  // }
  //
  // private setAdminInLocalStorage(): void {
  //   if (this.admin) {
  //     localStorage.setItem('admin', JSON.stringify(this.admin))
  //   } else {
  //     localStorage.removeItem('admin')
  //   }
  // }
  //
  //


}
