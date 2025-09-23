import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagersComponent } from './managers.component';
import { ManagersRoutingModule } from './managers-routing.module';
// import { TableGridModule } from 'src/app/core/components/table-grid';
// import { HSButtonModule } from 'src/app/core/components/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
// import { HSTimeToUtcModule } from 'src/app/core/pipes/utc-to-local/utc-to-local.module';

// import { HSInputModule } from 'src/app/core/components/input';
// import { HSFormFieldModule } from 'src/app/core/components/form-field';

import { MatDialogModule } from "@angular/material/dialog";

// import { ButtonToggleModule } from 'src/app/core/components/button-toggle/button-toggle.module';

// import { HSSelectModule } from 'src/app/core/components/select/select.module';
import {ManagerInfoComponent} from './pages/manager-detail/components/manager-info/manager-info.component';
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
import {ManagerDetailComponent} from './pages/manager-detail/manager-detail.component';



@NgModule({
  declarations: [
    ManagerInfoComponent,
    ManagersComponent,
    ManagerDetailComponent,
  ],
  imports: [
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
    ManagersRoutingModule,
    HSIconButtonModule,
    HSFormFieldModule,
    HSInputModule,
    MatPaginator,
    HSStatusModule,
  ]
})
export class ManagersModule { }
