import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PanelHeaderService {
  triggerMobileMenu$: Observable<boolean>;

  private triggerMobileSubject = new BehaviorSubject<boolean| null>(null);

  constructor() {
    this.triggerMobileMenu$ = this.triggerMobileSubject.asObservable().pipe(filter((isOpen: boolean)=> isOpen !== null));
   }

  triggerMobileMenu(isOpen: boolean): void {
    this.triggerMobileSubject.next(isOpen);
  }
}
