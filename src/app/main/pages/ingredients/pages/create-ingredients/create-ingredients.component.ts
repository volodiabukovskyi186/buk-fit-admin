import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Route, Router } from '@angular/router';
import { of } from 'rxjs';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-ingredients.component.html',
  styleUrls: ['./create-ingredients.component.scss']
})
export class CreateIngredientsComponent implements OnInit {

  formGroup: FormGroup;

  constructor(
    public firestore: AngularFirestore,
    private snackBar: MatSnackBar,
    private fb:FormBuilder,
    private route: Router
  ){}


  ngOnInit(): void {
    this.formGroup = this.fb.group({
      id: this.fb.control(null),
      product: this.fb.control(null, Validators.required),
      calories: this.fb.control(null, Validators.required),
      carbohydrates: this.fb.control(null, Validators.required),
      fats: this.fb.control(null, Validators.required),
      protein_type: this.fb.control(null),
      proteins: this.fb.control(null, Validators.required),
    })
  }

  createUser(): void {
    if(!this.formGroup.valid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    const id = this.generateUUID();
    this.formGroup.get('id').patchValue(id);
    of(this.firestore.collection('products').add(this.formGroup.value)).subscribe((data: any) => {
      this.snackBar.open(' Продукт успішно створено')
      this.route.navigate(['/ingredients'])
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
