import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ResponseVM } from '../models/response.model';
import { TokenStorageService } from './token-storage.service';
import { Router } from '@angular/router';

export interface User {
  id?: string;
  username?: string;
  email?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  profileImageUrl: string;
}

type SignInResult =
  | { status: 'ok'; user: User | null }
  | { status: 'inactive'; email: string; message?: string }
  | { status: 'deleted'; email: string; message?: string }
  | { status: 'invalid'; message?: string }
  | { status: 'error'; message?: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  readonly authReady$ = new BehaviorSubject<boolean>(false);

  get user(): User | null {
    return this.userSubject.value;
  }

  get authenticated(): boolean {
    return !!this.userSubject.value;
  }

  constructor(
    private http: HttpClient,
    private tokens: TokenStorageService,
    private router: Router
  ) {
    this.tokens.logout$.subscribe(() => {
      this.userSubject.next(null);
      if (this.router.url !== '/signin') {
        this.router.navigateByUrl('/signin');
      }
    });
  }

  async init(): Promise<void> {
    try {
      const access = this.tokens.getAccessToken();
      if (!access) {
        this.userSubject.next(null);
        return;
      }
      const res = await firstValueFrom(this.http.get<ResponseVM<User>>('/api/user'));
      this.userSubject.next(res.data ?? null);
    } catch {
      this.userSubject.next(null);
    } finally {
      this.authReady$.next(true);
    }
  }

  signUp(payload: { username: string; email: string; password: string }) {
    return this.http.post<ResponseVM>('/api/auth/signup', payload);
  }

  async signIn(payload: { email: string; password: string }): Promise<SignInResult> {
    this.tokens.clearTokens();

    const res = await firstValueFrom(this.http.post<ResponseVM<any>>('/api/auth/signin', payload));
    const vm = res || {};
    const data = vm.data || {};
    const errorMessage: string = vm.errorMessage || '';
    const statusCode: number | undefined = vm.statusCode;

    if (data?.accessToken) {
      this.tokens.setAccessToken(data.accessToken);
      if (data?.refreshToken) this.tokens.setRefreshToken(data.refreshToken);

      const profile = await firstValueFrom(this.http.get<ResponseVM<User>>('/api/user'));
      const user = profile.data ?? null;
      this.userSubject.next(user);
      this.authReady$.next(true);
      return { status: 'ok', user };
    }

    if (errorMessage.includes('User account is not active')) {
      return { status: 'inactive', email: payload.email, message: errorMessage };
    }

    if (errorMessage.includes('User account is deleted')) {
      return { status: 'deleted', email: payload.email, message: errorMessage };
    }

    if (statusCode === 401 || /invalid credentials/i.test(errorMessage)) {
      return { status: 'invalid', message: errorMessage || 'Invalid credentials' };
    }

    return { status: 'error', message: errorMessage || vm.responseMessage || 'Sign in failed' };
  }

  async signOut(): Promise<void> {
    try {
      const refreshToken = this.tokens.getRefreshToken();
      await firstValueFrom(this.http.post<ResponseVM>('/api/auth/signout', { refreshToken }));
    } catch {}
    finally {
      this.tokens.clearTokens();
      this.userSubject.next(null);
      this.tokens.broadcastLogout(); 
    }
  }

  verifyOtp(payload: { email: string; otp: string }) {
    return this.http.post<ResponseVM>('/api/auth/verify-otp', payload);
  }

  resendOtp(payload: { email: string }) {
    return this.http.post<ResponseVM>('/api/auth/resend-otp', payload);
  }

  forgotPassword(payload: { email: string }) {
    return this.http.post<ResponseVM>('/api/auth/forgot-password', payload);
  }

  resetPassword(payload: { email: string; password: string; otp: string }) {
    return this.http.post<ResponseVM>('/api/auth/reset-password', payload);
  }

  async googleLogin(): Promise<{ url: string }> {
    const res = await firstValueFrom(this.http.get<ResponseVM<{ url: string }>>('/api/auth/google/login'));
    return (res.data as { url: string }) || { url: '' };
  }

  async googleCallback(params: { code: string; state?: string | null }): Promise<void> {
    let httpParams = new HttpParams().set('code', params.code);
    if (params.state) httpParams = httpParams.set('state', params.state);

    const res = await firstValueFrom(
      this.http.post<ResponseVM<any>>('/api/auth/google/callback', null, {
        params: httpParams,
        responseType: 'json',
      })
    );

    const data = res.data || res;
    if (data?.accessToken) this.tokens.setAccessToken(data.accessToken);
    if (data?.refreshToken) this.tokens.setRefreshToken(data.refreshToken);

    const profile = await firstValueFrom(this.http.get<ResponseVM<User>>('/api/user'));
    this.userSubject.next(profile.data ?? null);
    this.authReady$.next(true);
  }
}