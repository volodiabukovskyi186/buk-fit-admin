import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { ActivatedRoute, Route, Router } from '@angular/router';


import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'bk-user-create-message',
  templateUrl: './user-create-message.component.html',
  styleUrls: ['./user-create-message.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserCreateMessageComponent implements OnInit {

  messageText: FormControl = new FormControl(null)
  message:any = {}
  id: any;
  img: any;
  bot: any;
  constructor(
    public dialogRef: MatDialogRef<UserCreateMessageComponent>,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    // this.bot = new TelegramBot('6759998817:AAFqIvCfOKGi-mKAZ8xksqFWQxBmT4eZ_ts', { polling: true });


  }
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

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

  addChannelLink(): void {
    const link = '\n\n<a href="https://t.me/buk_lviv_news">[BUK | Львів Новини]</a>';
    this.messageText.setValue(this.messageText.value + link);
  }

  copyPaternText(text: any): string {

    // const patternText = `Уяви що ти редактор новинного каналу з великим стажом проредагуй мій текст на початку заголовок додай в тег <b> text</b> далі основий текст також використовуй AIDA і додавай смайлики і видаляй будь які посилання на телеграм канали типу https://t.me/ ,а якщо є посилання на який сайт тоді додавай його ось таким чином a href=URL">Text</a> і в кінці додай це <a href="https://t.me/buk_lviv_news">[BUK | Львів Новини]</a> текст відпиши мені лише редагований текст : ${text}`;
    const redactor = '1.Уяви що ти редактор новинного каналу з великим стажом проредагуй мій текст зроби щоб він відрізнявся від оригіналу \n' +
      '1.Заголовок має бути бгорнутий в <b> </b> \n' +
      '2.Використай AIDA для тригерування людини яка буде це читати\n' +
      '4.Додай нові смайлики які підходять до цього тексту\n' +
      '5.Відредагуй текст так щоб текст не був похожий на цей що я надаю \n' +
      '6.Видаляй будь які посилання на телеграм канали типу https://t.me/ і текст який йому належить\n' +
      '7.Якщо є посилання на який сайт тоді додавай його ось таким чином <a href=URL">Text</a>\n' +
      '8.В кінці додай це <a href="https://t.me/+8Rvm40tRgxAxYTJi">[BUK | Львів Новини]</a>\n' +
      '9.Віддай мені відформатований текст\n' +
      '10.В тексті не повинно бути більше ніж 500 символів\n' +
      '11. не повинна втрачатись суть і текст має бути як в найкращих новинах\n' +
      `Текст:\n ${text}`

    return redactor;
  }

  private botToken = environment.clientBUKBotToken;
  isSending = false;

  sendMessageAction(type: any): void {
    if (type === 'TEST') {
      const chatId = null;
      this.sendMessage(chatId)
    } else {
      const chatId = null;
      this.sendMessage(chatId)
    }
  }

  sendMessage(chatId: any): any {
    this.isSending = true;

    let apiUrl = `https://api.telegram.org/bot${this.botToken}/sendPhoto`;
    let payload: any = {}


    console.log('payload.schedule_date', payload.schedule_date);

    const formData: FormData = new FormData();


    if (this.message?.medias?.length === 1) {


      if (this.message.medias[0].type === 'video' || this.message.medias[0].type === 'video/mp4') {
        apiUrl = `https://api.telegram.org/bot${this.botToken}/sendVideo`;

        // formData.append('chat_id', (chatId as any));
        formData.append('caption', this.messageText.value ? this.messageText.value : '');
        formData.append('video', this.message.medias[0].url);
        formData.append('parse_mode', 'html');

      } else {
        apiUrl = `https://api.telegram.org/bot${this.botToken}/sendPhoto`;

        // formData.append('chat_id', (chatId as any));
        formData.append('caption', this.messageText.value ? this.messageText.value : '');
        formData.append('photo', this.message.medias[0].url);
        formData.append('parse_mode', 'html');
      }
    } else if (this.message?.medias?.length > 1) {
      apiUrl = `https://api.telegram.org/bot${this.botToken}/sendMediaGroup`;
      const medias = this.prepareMedia();
      medias[0].caption = this.messageText.value ? this.messageText.value : '',
      medias[0].parse_mode = 'html'
      // formData.append('chat_id', ( chatId as any));
      formData.append('media',  JSON.stringify(medias));

      this.message.medias.forEach((media:any, index:number) => {
        formData.append(`photo${index}`, media.url);
      });


    } else {
      apiUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      // formData.append('chat_id', ( chatId as any));
      formData.append('text', this.messageText.value ? this.messageText.value : '')
      formData.append('parse_mode', 'html');
    }

    const reply_markup = {
      inline_keyboard : [
        [{
          text: 'Перевірити Годину ТУТ 🕒',
          url: 'https://t.me/+nMxhI7detocxNTQy'
        }]
      ]
    }

    formData.append('reply_markup', JSON.stringify(reply_markup));


    this.dialogRef.close({api: apiUrl,formData:formData } )
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

