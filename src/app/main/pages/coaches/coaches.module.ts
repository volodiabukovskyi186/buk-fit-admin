import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoachesComponent } from './coaches.component';
import { CoachesRoutingModule } from './coaches-routing.module';
// import { TableGridModule } from 'src/app/core/components/table-grid';
// import { HSButtonModule } from 'src/app/core/components/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
// import { HSTimeToUtcModule } from 'src/app/core/pipes/utc-to-local/utc-to-local.module';

// import { HSInputModule } from 'src/app/core/components/input';
// import { HSFormFieldModule } from 'src/app/core/components/form-field';
import { CoachDetailComponent } from './pages/coach-detail/coach-detail.component';

import { MatDialogModule } from "@angular/material/dialog";
import { ExesisesComponent } from './pages/coach-detail/components/exesises/exesises.component';
// import { ButtonToggleModule } from 'src/app/core/components/button-toggle/button-toggle.module';
import { UserMealsComponent } from './pages/coach-detail/components/user-meals/user-meals.component';
import { UserCaloriesComponent } from './pages/coach-detail/components/user-calories/user-calories.component';
// import { HSSelectModule } from 'src/app/core/components/select/select.module';
import { CoachInfoComponent } from './pages/coach-detail/components/coach-info/coach-info.component';
import { HSIconButtonModule } from "../../../core/components/icon-button/icon-button.module";
import {UserMealsTextComponent} from "./pages/coach-detail/components/user-meals-text/user-info.component";
import {HSFormFieldModule} from "../../../core/components/form-field";
import {HSInputModule} from '../../../core/components/input';
import {TableGridModule} from '../../../core/components/table-grid';
import {HSSelectModule} from '../../../core/components/select/select.module';
import {ButtonToggleModule} from '../../../core/components/button-toggle/button-toggle.module';
import {HSTimeToUtcModule} from '../../../core/pipes/utc-to-local/utc-to-local.module';
import {HSButtonModule} from '../../../core/components/button';
import {MatPaginator} from '@angular/material/paginator';
import {HSStatusModule} from '../../../core/components/status/status.module';
import {CoachClientsComponent} from './pages/coach-detail/components/coach-clients/coach-clients.component';
import {IQCheckboxModule} from "../../../core/components/checkbox";



@NgModule({
  declarations: [
    CoachesComponent,
    CoachDetailComponent,
    ExesisesComponent,
    UserMealsComponent,
    UserCaloriesComponent,
    CoachInfoComponent,
    UserMealsTextComponent
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
        CoachesRoutingModule,
        HSIconButtonModule,
        HSFormFieldModule,
        HSInputModule,
        MatPaginator,
        HSStatusModule,
        CoachClientsComponent,
        IQCheckboxModule,

    ]
})
export class CoachesModule { }
