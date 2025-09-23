import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HSButtonModule} from '../../components/button';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'bk-confirm-dialog',
  standalone: true,
  imports: [CommonModule, HSButtonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ConfirmDialogComponent {


  constructor(   @Inject(MAT_DIALOG_DATA) public data: any,
                 public dialogRef: MatDialogRef<ConfirmDialogComponent>,) {
  }

  closeDialog() {
    this.dialogRef.close(false)
  }

  approve(): void {
    this.dialogRef.close(true)
  }
}
