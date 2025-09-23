import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserCreateMessageComponent } from './user-create-message.component';
import { HSButtonModule } from 'src/app/core/components/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';



@NgModule({
  declarations: [
    UserCreateMessageComponent
  ],
  imports: [
    ClipboardModule,
    FormsModule,
    ReactiveFormsModule,
    HSButtonModule,
    CommonModule
  ],
  exports:[
    UserCreateMessageComponent
  ]
})
export class UserCreateMessageModule { }
