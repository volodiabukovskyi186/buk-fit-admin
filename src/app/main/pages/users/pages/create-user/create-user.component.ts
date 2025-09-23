import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Route, Router } from '@angular/router';
import { of } from 'rxjs';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {

  formGroup: FormGroup;

  constructor(
    public firestore: AngularFirestore,
    private snackBar: MatSnackBar,
    private fb:FormBuilder,
    private route: Router
  ){}


  ngOnInit(): void {
    this.formGroup = this.fb.group({
      name: this.fb.control(null),
      lastName: this.fb.control(null),
      login: this.fb.control(null),
      password: this.fb.control(null),
      role: this.fb.control("CLIENT"),
      id: this.fb.control(null),
    })
  }

  createUser(): void {
    const id = this.generateUUID();
    this.formGroup.get('id').patchValue(id);
    of(this.firestore.collection('clients').add(this.formGroup.value)).subscribe((data: any) => {
      this.snackBar.open('Користувача успішно створено')
      this.route.navigate(['/users'])
    });
  }

  generateUUID(): string {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }
}
