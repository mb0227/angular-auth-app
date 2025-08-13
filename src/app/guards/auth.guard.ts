import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router, private tokens: TokenStorageService) {}

  canActivate(): boolean | UrlTree {
    if (this.auth.authenticated) return true;

    const hasToken = !!this.tokens.getAccessToken();
    if (hasToken) return true;

    return this.router.parseUrl('/signin');
  }
}