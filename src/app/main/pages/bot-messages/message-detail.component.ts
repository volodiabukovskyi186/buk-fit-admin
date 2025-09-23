import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { Observable, Subscription, from, forkJoin, of } from 'rxjs';
import { concatMap, finalize, map, switchMap, tap, toArray } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';


import { ActivatedRoute, Route, Router } from '@angular/router';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import {CommonModule} from '@angular/common';
import {HSButtonModule} from '../../../core/components/button';
import {HSFormFieldModule} from '../../../core/components/form-field';
import {CdkCopyToClipboard} from '@angular/cdk/clipboard';
import {HSInputModule} from '../../../core/components/input';
import {NgxMaskDirective} from 'ngx-mask';
// import * as TelegramBot from 'node-telegram-bot-api';
@Component({
  selector: 'bk-message-detail',
  standalone: true,
  imports: [CommonModule, HSButtonModule, ReactiveFormsModule, HSFormFieldModule, CdkCopyToClipboard, HSInputModule, NgxMaskDirective],
  templateUrl: './message-detail.component.html',
  styleUrls: ['./message-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BotMessagesComponent implements OnInit {
  listMessageButtons = []
  messageText: FormControl = new FormControl(null)
  message:any = {}
  id: any;
  img: any;
  bot: any;

  buttonsForm: FormGroup;
  constructor(
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    // this.bot = new TelegramBot('6759998817:AAFqIvCfOKGi-mKAZ8xksqFWQxBmT4eZ_ts', { polling: true });
  }
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.getMessages();

    this.buttonsForm = this.fb.group({
      buttons: this.fb.array([])
    });
  }

  addButton(): void {
    const buttonGroup = this.fb.group({
      text: ['', Validators.required],
      url: ['https://t.me/KhomytskyiPro_bot', [Validators.required]]
    });

    this.buttons.push(buttonGroup);
  }

  removeButton(index: number): void {
    this.buttons.removeAt(index);
  }



  get buttons(): FormArray {
    return this.buttonsForm.get('buttons') as FormArray;
  }


  getMessages() {
    console.log(64353);

    this.http.get(`https://api.telegram.org/bot${this.botToken}/getUpdates`).subscribe(response => {
      // Обробіть відповідь, щоб витягнути повідомлення
      console.log('222223,', response);
      // Припустимо, що ви хочете повернути лише текст повідомлень

    });
  }


  addImage(input: any): void {
    input.value = null;
    input.click();
  }


  onFileSelected(event: any): void {
    if(!this.message?.medias) {
      this.message.medias = [];
    }
    this.img = event.target.files[0];
    const payload = {
      type: event.target.files[0].type,
      url: event.target.files[0],
      viewUrl: URL.createObjectURL(event.target.files[0])
    }

    this.message.medias.push(payload)
  }



  private botToken = environment.botNewRegister;
  isSending = false;

  sendMessageAction(type: any): void {
      const chatId = environment.welcomeMessageChannelID;
      this.sendMessage(chatId)
  }


  sendMessage(chatId: any): any {
    this.isSending = true;

    let apiUrl = `https://api.telegram.org/bot${this.botToken}/sendPhoto`;


    let payload: any = {}


    console.log('payload.schedule_date', payload.schedule_date);
    let formData1
    const formData: FormData = new FormData();


    if (this.message?.medias?.length === 1) {
      console.log(1111, this.message.medias[0].type);

      if (this.message.medias[0].type === 'video' || this.message.medias[0].type === 'video/mp4') {
        apiUrl = `https://api.telegram.org/bot${this.botToken}/sendVideo`;

        formData.append('chat_id', (chatId as any));
        formData.append('caption', this.messageText.value ? this.messageText.value : '');
        formData.append('video', this.message.medias[0].url);
        formData.append('parse_mode', 'html');

      } else {
        apiUrl = `https://api.telegram.org/bot${this.botToken}/sendPhoto`;

        formData.append('chat_id', (chatId as any));
        formData.append('caption', this.messageText.value ? this.messageText.value : '');
        formData.append('photo', this.message.medias[0].url);
        formData.append('parse_mode', 'html');
      }



    } else if (this.message?.medias?.length > 1) {
      apiUrl = `https://api.telegram.org/bot${this.botToken}/sendMediaGroup`;
      const medias = this.prepareMedia();
      medias[0].caption = this.messageText.value ? this.messageText.value : '',
        medias[0].parse_mode = 'html'
      formData.append('chat_id', ( chatId as any));
      formData.append('media',  JSON.stringify(medias));

      this.message.medias.forEach((media:any, index:number) => {
        formData.append(`photo${index}`, media.url);
      });


    } else {
      apiUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

      formData.append('chat_id', ( chatId as any));
      formData.append('text', this.messageText.value ? this.messageText.value : '')
      formData.append('parse_mode', 'html');;
      formData.append('link_preview', (false as any));

    }

    if (this.buttons.value.length > 0) {
      const replyMarkup = {
        inline_keyboard: this.buttons.value.map((button) => [
          {
            text: button.text,
            ...(button.url ? { url: button.url } : {}),
            ...(button.callback_data ? { callback_data: button.callback_data } : {})
          }
        ])
      };

      formData.append('reply_markup', JSON.stringify(replyMarkup));
    }

    this.http.post(apiUrl, formData).pipe(
      catchError((err) => {
        console.log(111, err);

        this.snackBar.open(err.error?.description);
        this.isSending = false;
        return of()
      })
    ).subscribe((data: any) => {
      if (data) {
        console.log(11231, data);
        this.isSending = false;
        this.snackBar.open('Повідомлення успішно надіслано')
      }

    });
  }

  private prepareMedia(): any {
    let medias:any = [];
    this.message.medias.forEach((media: any, index: number) => {
      if (typeof media.url === 'string' || media.url instanceof String) {
        medias.push({ type: media.type, media: media.url, isFile:false})
      } else {
        const mediaType = this.checkIfPhoto(media.type);
        medias.push({ type: mediaType, media: `attach://photo${index}`, isFile:true  })

      }



    })

    return medias
  }


  removeImage(media: any): void {
    const index = this.message.medias.findIndex((item: any) => item.url === media.url);

    this.message.medias.splice(index, 1)
  }

  private checkIfPhoto(mediaType: string): string {
    const listPhotoTypes = ['image/jpeg','image/png', 'image/svg+xml', 'image/tiff'];
    return !!listPhotoTypes.find((type: string) => type === mediaType) ? 'photo': 'video'
  }

}
