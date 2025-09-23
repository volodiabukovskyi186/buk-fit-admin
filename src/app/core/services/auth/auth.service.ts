import {Injectable} from '@angular/core';
import {FirebaseApp, getApp, initializeApp} from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import {doc, Firestore, getDoc} from '@angular/fire/firestore';
import {BehaviorSubject, catchError, defer, filter, from, Observable, throwError} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {map, switchMap, take, tap} from 'rxjs/operators';
import {UserInterface} from '../../interfaces/user.interface';
import {USER_ROLES_ENUM} from '../../enums/users-roles.enum';
import {USER_STATUS_ENUM} from '../../enums/users-status.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseApp!: FirebaseApp;
  private auth!: ReturnType<typeof getAuth>;

  private userFirebaseSubject = new BehaviorSubject<User | null>(null);
  public userFirebase$: Observable<User | null> = this.userFirebaseSubject.asObservable();

  private userSubject = new BehaviorSubject<UserInterface | null>(null);
  userState$: Observable<UserInterface>;

  constructor(private firestore: Firestore) { // ✅ Firestore без compat
    this.initFirebase();
    this.userState$ = this.userSubject.asObservable().pipe(filter(user => !!user));
  }

  private async initFirebase() {
    try {
      this.firebaseApp = getApp();
    } catch (error) {
      this.firebaseApp = initializeApp(environment.firebase);
    }

    this.auth = getAuth(this.firebaseApp);
    this.monitorAuthState();
  }

  resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  getUserById(uid: string): void {
    const userDocRef = doc(this.firestore, `admins/${uid}`);
    from(getDoc(userDocRef)).pipe(
      map(snapshot => {
        const data: any = snapshot.data();
        return data ? {id: uid, ...data} as UserInterface : null;
      })
    ).subscribe((user) => {
      this.userSubject.next(user);
    });
  }

  login1(email: string, password: string): Observable<string> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(userCredential => from(userCredential.user.getIdToken()))
    );
  }


  login(email: string, password: string): Observable<string> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(userCredential => {
        const uid = userCredential.user.uid;
        const userDocRef = doc(this.firestore, 'admins', uid);

        return defer(() => getDoc(userDocRef)).pipe(
          switchMap(docSnap => {
            if (!docSnap.exists()) {

              return throwError(() => ({
                message: null,
                code: 'NOT_FOUND',
              }));
            }

            const userData: any = docSnap.data();

            if (userData.status === USER_STATUS_ENUM.DELETED || userData.status === USER_STATUS_ENUM.BLOCKED) {
              return throwError(() => ({
                message: null,
                code: USER_STATUS_ENUM.BLOCKED
              }));
            }

            return from(userCredential.user.getIdToken());
          })
        );
      }),
      catchError(error => {
        let errorMessage = 'Помилка входу. Спробуйте ще раз.';

        if (error.code === USER_STATUS_ENUM.BLOCKED) {
          errorMessage = 'Ваш акаунт заблокований або видалений, зверністься до адміністратора';
        }

        if (error.code === 'NOT_FOUND') {
          errorMessage = 'Користувач не знайдений';
        }

        this.logout();
        return throwError(() => new Error(errorMessage));
      })
    );
  }


  register(email: string, password: string): Observable<string> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      tap((userCredential) => {
        console.log('✅ Реєстрація успішна:', userCredential);
      }),
      map((userCredential) => userCredential.user?.uid || '')
    );
  }

  isLoggedIn(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const unsubscribe = onAuthStateChanged(this.auth, user => {
        if (user) {
          this.getUserById(user.uid);
        }
        observer.next(!!user);
        observer.complete();
      });

      return () => unsubscribe();
    }).pipe(take(1));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      map(() => {
        this.userFirebaseSubject.next(null);
        this.userSubject.next(null);

        localStorage.clear();
        sessionStorage.clear();
      })
    );
  }


  private monitorAuthState() {
    onAuthStateChanged(this.auth, (user) => {

      console.log(user ? `Користувач залогований: ${user.email}` : 'Користувач не залогований');
    });
  }
}
