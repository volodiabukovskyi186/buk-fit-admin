import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  removeByIDNotificationState$: Observable<any>;
  private removeByIDNotificationState = new BehaviorSubject<any| null>(null);
 
 
  constructor() { 
     this.removeByIDNotificationState$ = this.removeByIDNotificationState.asObservable().pipe(filter((message:string| null )=> message !== null));
  }

  removeByIDNotification(id): void {
    this.removeByIDNotificationState.next(id);
  }

  addToLocalStorageNotification(notification: any): void { 
   
    let notifications = JSON.parse(localStorage.getItem('notifications'));

    if ( !notifications) {
      
      
      const notificationStr = JSON.stringify(notification);
      localStorage.setItem('notifications', `[${notificationStr}]`)

      return;
    }
    const listNotifications = JSON.parse(localStorage.getItem('notifications'));

    const index = listNotifications.findIndex((elem: any) => elem.id === notification.id);

    if (index == -1) {
      listNotifications.push(notification);
      localStorage.setItem('notifications', JSON.stringify(listNotifications))
    }
  }

  removeToLocalStorageNotification(reminderId: string): void {
    let notifications = JSON.parse(localStorage.getItem('notifications'));
    if (!notifications.length) return;
      
    const index = notifications.findIndex((elem: any) => {
      return elem.body.reminderId === reminderId
    });
    
    if (index !== -1) {      
      notifications.splice(index, 1);      
      localStorage.setItem('notifications', JSON.stringify(notifications))
    }

  }
}
