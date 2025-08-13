import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ResponseVM } from '../models/response.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  async getProfile() {
    const res = await firstValueFrom(this.http.get<ResponseVM<any>>('/api/user'));
    return res.data;
  }

  async getProfileImage(): Promise<string> {
    const res = await firstValueFrom(
      this.http.get<ResponseVM<any>>('/api/user/get-profile-image')
    );
    return typeof res.data === 'string' ? res.data : res.data?.profileImageUrl || '';
  }

  async changePassword(payload: { OldPassword: string; NewPassword: string }) {
    const res = await firstValueFrom(this.http.post<ResponseVM>('/api/user/change-password', payload));
    return res.data;
  }

  async saveProfileImageBase64(base64: string) {
    const res = await firstValueFrom(
      this.http.post<ResponseVM>('/api/user/save-profile-image', { Base64Image: base64 })
    );
    return res.data;
  }

  async updateUserProfile(form: FormData) {
    const res = await firstValueFrom(
      this.http.patch<ResponseVM>('/api/user/update-user-profile', form)
    );
    return res.data;
  }

  async updateUser(payload: { username?: string; email?: string; password?: string }) {
    const res = await firstValueFrom(this.http.put<ResponseVM>('/api/user/update-user', payload));
    return res.data;
  }

  async deleteAccount() {
    const res = await firstValueFrom(this.http.delete<ResponseVM>('/api/user/delete-account'));
    return res.data;
  }
}