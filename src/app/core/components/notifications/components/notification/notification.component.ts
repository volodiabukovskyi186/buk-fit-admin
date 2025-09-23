import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TicketActionNotification } from 'src/app/core/services/notifications/ticket-action-notification.service';

@Component({
  selector: 'hs-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  encapsulation: ViewEncapsulation.None,
 

})
export class NotificationComponent {
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
