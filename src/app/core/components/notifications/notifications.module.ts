import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationComponent } from './components/notification/notification.component';
import { NotificationsComponent } from './notifications.component';
import { HSButtonModule } from '../button';
import { HSSaveHtmlModule } from '../../pipes/save-html/save-html.module';
import { NotificationReminderComponent } from './components/notification-reminder/notification-reminder.component';
import { IQMenuModule } from '../menu';
import { HSTextSelectModule } from '../text-select/text-select.module';
import { UserLiveNotificationComponent } from './components/user-live-notification/user-live-notification.component';
import { HSAvatarModule } from '../avatar/avatar.module';

@NgModule({
  declarations: [
    NotificationsComponent,
    NotificationComponent,
    NotificationReminderComponent,
    UserLiveNotificationComponent
  ],
  imports: [
    HSAvatarModule,
    HSTextSelectModule,
    HSSaveHtmlModule,
    HSButtonModule,
    IQMenuModule,
    CommonModule
  ],
  exports: [NotificationsComponent],

})
export class NotificationsModule { }
