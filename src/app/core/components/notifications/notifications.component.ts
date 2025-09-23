import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { Subject, Subscription, delay } from 'rxjs';

import { LiveNotificationService } from 'src/app/core/services/notifications/live-notification.service';
import { NotificationSoundService } from 'src/app/core/services/notification-sound.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'hs-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NotificationsComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();
  notifications: any[] = [];

  listSubject = new Subject();

  constructor(
    private notificationSoundService: NotificationSoundService,
    private liveNotificationService: LiveNotificationService,
    private notificationService: NotificationService,
    private titleService: Title
  ){}

  ngOnInit(): void {
    this.getNotifications();
    this.getRemoveID();
    this.notifications = [

  ]
  
  }

  removeByIndexNotification(index) {    
    this.notifications.splice(index, 1);
    this.liveNotificationService.removeByIndexNotification(index);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getRemoveID(): void {
    this.notificationService.removeByIDNotificationState$.subscribe((id: string) => {
      this.removeByID(id);
    });
  }

  private removeByID(id: string): void {
    const index = this.notifications.findIndex((elem: any) => elem.notificationId === id);

    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }

  private getNotifications(): void {
    let countUnreaded = 0;

    const  stream$ = this.liveNotificationService.newNotificationState$.subscribe((notification: any) => {
      this.notifications.push(notification); 
    
      this.addItemToList(notification);
    
      this.setSoundNotificationByType(notification);
      
      this.setTitleByType(notification, countUnreaded);     
    });
    
    this.listSubject.pipe(delay(5000)).subscribe(item => {
      const isRemove = this.canNotRemovedAfterTime(item);
      if (isRemove) {
        this.removeLastNotification();
      }
     
    });

    this.subscription.add(stream$);
  }


  private canNotRemovedAfterTime(notification): boolean {
    switch(notification.type) {
      case "":
      return false;
    }

    return true;
  }

  private addItemToList(item) {
    this.listSubject.next(item);
  }

  private removeLastNotification() {
    this.notifications.pop();
    this.liveNotificationService.removeLastNotification()
  }

  private setTitleByType(notification: any, countUnreaded: any): any {
    countUnreaded += 1;
    
    switch(notification.type) {
      case "NEW_MESSAGE":
      this.titleService.setTitle(`(${countUnreaded}) messages in tickets`);
    }
  }

  private setSoundNotificationByType(notification: any): any {
    switch(notification.type) {
      case "ADD_RESPONSIBLE":
      case "CREATE_TICKET":
      case "CLOSE_TICKET":
      case "NEW_MESSAGE":
      case "REMINDER":
      this.notificationSoundService.soundNotification();
    }
  }

}
