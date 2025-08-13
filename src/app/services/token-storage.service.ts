import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const LOGOUT_EVENT = 'app:logout';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private accessTokenMemory: string | null = null;

  logout$ = new Subject<void>();

  constructor(private zone: NgZone) {
    window.addEventListener('storage', (e) => {
      if (e.key === LOGOUT_EVENT) {
        this.zone.run(() => this.logout$.next());
      }
    }); 
    window.addEventListener(LOGOUT_EVENT, () => {
      this.zone.run(() => this.logout$.next());
    });
  }

  getAccessToken(): string | null {
    return this.accessTokenMemory || localStorage.getItem(ACCESS_KEY);
  }

  setAccessToken(token?: string | null) {
    this.accessTokenMemory = token ?? null;
    if (token) localStorage.setItem(ACCESS_KEY, token);
    else localStorage.removeItem(ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  setRefreshToken(token?: string | null) {
    if (token) localStorage.setItem(REFRESH_KEY, token);
    else localStorage.removeItem(REFRESH_KEY);
  }

  clearTokens() {
    this.accessTokenMemory = null;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }

  broadcastLogout() {
    try {
      localStorage.setItem(LOGOUT_EVENT, String(Date.now()));
      window.dispatchEvent(new Event(LOGOUT_EVENT));
    } catch {}
  }
}