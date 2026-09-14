import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CdnVideoService {
  /**
   * Новий домен (buk-fit.com). Старий buk-fit.online спливає 23.09.2026.
   * У allowedHosts лишені ОБИДВА домени: старі посилання на .online мають
   * розпізнаватись і видалятись доти, доки всі URL у базі не переписані.
   */
  private readonly uploadBaseUrl = 'https://api.buk-fit.com';
  private readonly cdnBaseUrl = 'https://cdn.buk-fit.com';
  private readonly allowedHosts = [
    'cdn.buk-fit.com',
    'api.buk-fit.com',
    'cdn.buk-fit.online',
    'api.buk-fit.online',
  ];

  constructor(private http: HttpClient) {}

  uploadVideo(file: File): Observable<string> {
    const fileName = encodeURIComponent(file.name);
    const uploadUrl = `${this.uploadBaseUrl}/${fileName}`;
    const cdnUrl = `${this.cdnBaseUrl}/${fileName}`;
    const contentType = file.type || 'application/octet-stream';

    return this.http.put(uploadUrl, file, {
      headers: {
        'Content-Type': contentType
      },
      responseType: 'text'
    }).pipe(
      map(() => cdnUrl)
    );
  }

  deleteVideoByUrl(url: string): Observable<unknown> {
    const fileName = this.extractFileNameFromUrl(url);
    if (!fileName) {
      throw new Error('Invalid CDN URL');
    }

    const deleteUrl = `${this.uploadBaseUrl}/${encodeURIComponent(fileName)}`;
    return this.http.delete(deleteUrl, { responseType: 'text' });
  }

  isCdnUrl(url: string): boolean {
    return !!this.extractFileNameFromUrl(url);
  }

  private extractFileNameFromUrl(value: string): string | null {
    if (!value) {
      return null;
    }

    try {
      const parsedUrl = new URL(value);
      if (!this.allowedHosts.includes(parsedUrl.host)) {
        return null;
      }

      const segments = parsedUrl.pathname.split('/').filter(Boolean);
      const fileName = segments[segments.length - 1];
      return fileName ? decodeURIComponent(fileName) : null;
    } catch {
      return null;
    }
  }
}
