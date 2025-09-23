import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MealsNamesRoutingModule } from './meals-names-routing.module';
import { MealsNamesComponent } from './meals-names.component';
import {HSButtonModule} from "../../../core/components/button";
import {TableGridModule} from "../../../core/components/table-grid";
import {HSSelectModule} from "../../../core/components/select/select.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ButtonToggleModule} from "../../../core/components/button-toggle/button-toggle.module";
import {MatDialogModule} from "@angular/material/dialog";
import {HSInputModule} from "../../../core/components/input";
import {HSFormFieldModule} from "../../../core/components/form-field";
import {HSTimeToUtcModule} from "../../../core/pipes/utc-to-local/utc-to-local.module";
import {ClipboardModule} from "@angular/cdk/clipboard";
import {UsersRoutingModule} from "../users/users-routing.module";
import {HSIconButtonModule} from "../../../core/components/icon-button";
import {CreateMealsNamesComponent} from "./pages/create-meals-names/create-meals-names.component";
import {MatPaginator} from "@angular/material/paginator";
import {EditMealsNameComponent} from './pages/edit-meals-names/edit-exercise-home.component';


@NgModule({
  declarations: [
    MealsNamesComponent,
    EditMealsNameComponent,
    CreateMealsNamesComponent
  ],
    imports: [
        CommonModule,
        MealsNamesRoutingModule,
        HSButtonModule,
        TableGridModule,
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
        HSIconButtonModule,
        MatPaginator
    ]
})
export class MealsNamesModule { }
