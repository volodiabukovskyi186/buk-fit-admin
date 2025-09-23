import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersComponent } from './users.component';
import { UsersRoutingModule } from './users-routing.module';
// import { TableGridModule } from 'src/app/core/components/table-grid';
// import { HSButtonModule } from 'src/app/core/components/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
// import { HSTimeToUtcModule } from 'src/app/core/pipes/utc-to-local/utc-to-local.module';

// import { HSInputModule } from 'src/app/core/components/input';
// import { HSFormFieldModule } from 'src/app/core/components/form-field';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';

import { MatDialogModule } from "@angular/material/dialog";
import { CreateUserComponent } from './pages/create-user/create-user.component';
import { ExesisesComponent } from './pages/user-detail/components/exesises/exesises.component';
// import { ButtonToggleModule } from 'src/app/core/components/button-toggle/button-toggle.module';
import { UserMealsComponent } from './pages/user-detail/components/user-meals/user-meals.component';
import { UserCaloriesComponent } from './pages/user-detail/components/user-calories/user-calories.component';
// import { HSSelectModule } from 'src/app/core/components/select/select.module';
import { UserInfoComponent } from './pages/user-detail/components/user-info/user-info.component';
import { HSIconButtonModule } from "../../../core/components/icon-button/icon-button.module";
import {UserMealsTextComponent} from "./pages/user-detail/components/user-meals-text/user-meals-text.component";
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
import {UserSurveyComponent} from "./pages/user-detail/components/user-info/features/user-survey/user-survey.component";
import {IQMenuModule} from "../../../core/components/menu";
import {UserPaymentComponent} from "./pages/user-detail/components/user-payment/user-payment.component";



@NgModule({
  declarations: [
    UsersComponent,
    UserDetailComponent,
    CreateUserComponent,
    ExesisesComponent,
    UserMealsComponent,
    UserCaloriesComponent,
    UserInfoComponent,
    UserMealsTextComponent
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
        UsersRoutingModule,
        HSIconButtonModule,
        HSFormFieldModule,
        HSInputModule,
        MatPaginator,
        HSStatusModule,
        MatDatepicker,
        MatDatepickerInput,
        UserSurveyComponent,
        IQMenuModule,
        UserPaymentComponent,

    ]
})
export class UsersModule { }
