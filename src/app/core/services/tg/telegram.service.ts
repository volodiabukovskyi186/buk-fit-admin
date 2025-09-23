import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import {environment} from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TelegramService {

  private readonly botToken = environment.botToken;
  private readonly channelId = environment.welcomeMessageChannelID;

  constructor(private http: HttpClient) {}

  /**
   * Надіслати результат опитування у TG канал
   */
  sendPollResult(resultText: string) {
    return this.sendMessage({
      chat_id: this.channelId,
      text: resultText,
      parse_mode: 'html',
      disable_web_page_preview: true
    });
  }

  /**
   * Надіслати повідомлення (текст/фото/відео/медіа-група) у TG
   */
  sendMessage(options: {
    chat_id: string | number;
    text?: string;
    photo?: string;
    video?: string;
    mediaGroup?: { type: string; media: string; caption?: string; parse_mode?: string }[];
    parse_mode?: 'html' | 'Markdown';
    disable_web_page_preview?: boolean;
    buttons?: { text: string; url?: string; callback_data?: string }[];
  }) {
    let apiUrl = '';
    const formData = new FormData();

    // --- Визначаємо тип повідомлення ---
    if (options.photo) {
      apiUrl = `https://api.telegram.org/bot${this.botToken}/sendPhoto`;
      formData.append('photo', options.photo);
      if (options.text) formData.append('caption', options.text);

    } else if (options.video) {
      apiUrl = `https://api.telegram.org/bot${this.botToken}/sendVideo`;
      formData.append('video', options.video);
      if (options.text) formData.append('caption', options.text);

    } else if (options.mediaGroup?.length) {
      apiUrl = `https://api.telegram.org/bot${this.botToken}/sendMediaGroup`;
      formData.append('media', JSON.stringify(options.mediaGroup));

    } else {
      apiUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      if (options.text) formData.append('text', options.text);
      if (options.disable_web_page_preview) {
        formData.append('disable_web_page_preview', 'true');
      }
    }

    formData.append('chat_id', String(options.chat_id));
    if (options.parse_mode) formData.append('parse_mode', options.parse_mode);

    // --- Кнопки ---
    if (options.buttons?.length) {
      const replyMarkup = {
        inline_keyboard: options.buttons.map((b) => [
          {
            text: b.text,
            ...(b.url ? { url: b.url } : {}),
            ...(b.callback_data ? { callback_data: b.callback_data } : {})
          }
        ])
      };
      formData.append('reply_markup', JSON.stringify(replyMarkup));
    }

    return this.http.post(apiUrl, formData).pipe(
      catchError((err) => {
        console.error('Telegram API error:', err.error?.description || err);
        return of(null);
      })
    );
  }
}
