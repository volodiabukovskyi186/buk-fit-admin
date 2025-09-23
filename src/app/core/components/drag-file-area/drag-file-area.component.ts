import {Component, ElementRef, EventEmitter, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { AlertService } from '../alert';
import { PanelTranslationsService } from 'src/app/core/services/transaltion/panel-translation.service';

@Component({
  selector: 'hs-drag-file-area',
  templateUrl: './drag-file-area.component.html',
  styleUrls: ['./drag-file-area.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DragFileAreaComponent {
  @ViewChild('fileinput') public fileinput: ElementRef<HTMLInputElement>;
  
  @Output() fileDropped: EventEmitter<any> = new EventEmitter<any>();
  
  constructor(
    private panelTranslationsService: PanelTranslationsService,
    private alertService: AlertService,
  ) {
  }

  onFileDropped(event): void {
    const isCorrectFile = this.testFile(event[0])

    if (isCorrectFile) {
      this.fileDropped.emit(event);
    }

    event = null;
  }

  readFile(event: any) {
    const isCorrectFile = this.testFile(event.target.files[0]);
    if (isCorrectFile) {
      this.fileDropped.emit(event.target.files);
    }

    event = null;
  }

  testFile(file): boolean {
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/pdf',
      'application/x-rar-compressed',
      'application/zip',
      'application/x-7z-compressed',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/rtf',
      'text/plain',
      'application/octet-stream',
      'text/csv',
      'application/pkcs7-signature',
      'application/octet-stream'
    ];


    if (file.size >= 16000000) {
      this.alertService.openDefaultError('ERROR', this.panelTranslationsService.translations.ALERT_MESSAGE.FILE_TOO_LARGE);
      return false;
    }

    if (file.name.length >= 180) {
      this.alertService.openDefaultError('ERROR', this.panelTranslationsService.translations.GENERAL.FILE_IS_NOT_VALID_LENGHT);
      return false;
    }
    else if (allowedTypes.includes(file.type)) {
      return true;
    }
    else {
      this.alertService.openDefaultError('ERROR', this.panelTranslationsService.translations.GENERAL.FILE_IS_NOT_VALID);
      return false;
    }
  }

  openSelectFile(file): void {
    file.click();
    this.fileinput.nativeElement.value = null;
  }
}
