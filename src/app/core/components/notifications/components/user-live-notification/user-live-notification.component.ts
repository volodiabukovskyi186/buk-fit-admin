import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { TicketReminderService } from 'src/app/pages/main/pages/panel/pages/dashboards/tickets/services/ticket-reminder.service';
import { AlertService } from '../../../alert';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'hs-user-live-notification',
  templateUrl: './user-live-notification.component.html',
  styleUrls: ['./user-live-notification.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserLiveNotificationComponent {
  @Output() remove: EventEmitter<null> = new EventEmitter<null>();

  @Input() notification: any;


  constructor(
  
    private router: Router
  ){}

  removeNotification(): void {
    this.remove.emit(null)
  }

  moveToLink(notification): void {
    this.router.navigate([notification.link])
  }
}
