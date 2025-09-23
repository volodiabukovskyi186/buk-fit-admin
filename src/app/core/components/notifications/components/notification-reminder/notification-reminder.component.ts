import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { TicketActionNotification } from 'src/app/core/services/notifications/ticket-action-notification.service';
import { REMIND_DELAY_TIME } from 'src/app/core/ui/dialogs/ticket-dialogs/delay-ticket-dialog/enums/remind-time.enum';
import { AlertService } from '../../../alert';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TicketReminderService } from 'src/app/pages/main/pages/panel/pages/dashboards/tickets/services/ticket-reminder.service';
import { ApiData } from 'src/app/core/interfaces/data.interface';
import { PanelTranslationsService } from 'src/app/core/services/transaltion/panel-translation.service';

@Component({
  selector: 'hs-notification-reminder',
  templateUrl: './notification-reminder.component.html',
  styleUrls: ['./notification-reminder.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotificationReminderComponent {
  @Input() data: any;
  @Output() reminderUpdated: EventEmitter<boolean> = new EventEmitter<boolean>(); 

  remindDelayTimeEnum = REMIND_DELAY_TIME;

  private subscription: Subscription = new Subscription()
  constructor(
    private ticketReminderService: TicketReminderService,
    private panelTranslationsService: PanelTranslationsService,
    private alertService: AlertService,
    private router: Router
  ) {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  moveToLink(notification): void {
    this.router.navigate([notification.link])
  }

  navigate(notification): void {
    switch (notification.message.event) {
      case 'REMINDER':
        this.router.navigate(['/panel/tickets/ticket/',notification.message.body.ticketId,'ticket-timeline']);
    }
  }

  closeReminder(): void {
    this.ticketReminderService.compliteTicketReminder(this.data.id).subscribe((data: ApiData<any>) => {
      this.alertService.openDefaultSuccess("SUCCESS", this.panelTranslationsService.translations.ALERT_MESSAGE.REMINDER_CLOSED);
      this.reminderUpdated.emit(true)
    });
  }

  delayReminder(delay): void {
    this.ticketReminderService.delayReminder({time: delay.value, id: this.data.id}).subscribe((data: any) => {
      this.alertService.openDefaultSuccess("SUCCESS", this.panelTranslationsService.translations.ALERT_MESSAGE.REMINDER_DELAYED);
      this.reminderUpdated.emit(true)
    });
  }
}
