import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeletedUsersComponent } from './deleted-users.component';
import { DeletedUsersRoutingModule } from './deleted-users-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';



import { MatDialogModule } from "@angular/material/dialog";


import { HSIconButtonModule } from "../../../core/components/icon-button/icon-button.module";

import {HSFormFieldModule} from "../../../core/components/form-field";
import {HSInputModule} from '../../../core/components/input';
import {TableGridModule} from '../../../core/components/table-grid';
import {HSSelectModule} from '../../../core/components/select/select.module';
import {ButtonToggleModule} from '../../../core/components/button-toggle/button-toggle.module';
import {HSTimeToUtcModule} from '../../../core/pipes/utc-to-local/utc-to-local.module';
import {HSButtonModule} from '../../../core/components/button';
import {MatPaginator} from '@angular/material/paginator';
import {HSStatusModule} from '../../../core/components/status/status.module';
import {UserCreateMessageModule} from '../../festures/dialogs/user-create-message/user-create-message.module';
import {MatDatepicker, MatDatepickerInput, MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {IQMenuModule} from "../../../core/components/menu";




@NgModule({
  declarations: [
    DeletedUsersComponent,
  ],
    imports: [
        MatNativeDateModule,
        MatDatepickerModule,
        UserCreateMessageModule,
        HSSelectModule,
        ReactiveFormsModule,
        FormsModule,
        ButtonToggleModule,
        MatDialogModule,
        HSInputModule,
        HSFormFieldModule,
        HSTimeToUtcModule,
        ClipboardModule,
        ReactiveFormsModule,
        FormsModule,
        HSButtonModule,
        TableGridModule,
        CommonModule,
        CommonModule,
        DeletedUsersRoutingModule,
        HSIconButtonModule,
        HSFormFieldModule,
        HSInputModule,
        MatPaginator,
        HSStatusModule,
        MatDatepicker,
        MatDatepickerInput,
        IQMenuModule,
    ]
})
export class DeletedUsersModule { }
