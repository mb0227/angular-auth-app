import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse, HttpResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';

@Injectable()
export class ApiHttpInterceptor implements HttpInterceptor {
  constructor(private tokens: TokenStorageService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let headers = req.headers;
    const access = this.tokens.getAccessToken();
    if (access) {
      headers = headers.set('Authorization', `Bearer ${access}`);
    }

    const cloned = req.clone({
      url: req.url.startsWith('http') ? req.url : `${environment.apiBaseUrl}${req.url}`,
      withCredentials: true,
      headers,
    });

    return next.handle(cloned).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const newAccess = event.headers.get('X-New-Access-Token');
            const newRefresh = event.headers.get('X-New-Refresh-Token');
            if (newAccess) this.tokens.setAccessToken(newAccess);
            if (newRefresh) this.tokens.setRefreshToken(newRefresh);
          }
        },
        error: (err: HttpErrorResponse) => {
          const status = err.status;
          if ([401, 403, 419, 498].includes(status)) {
            this.tokens.clearTokens();
            this.tokens.broadcastLogout(); 
          }
        },
      })
    );
  }
}