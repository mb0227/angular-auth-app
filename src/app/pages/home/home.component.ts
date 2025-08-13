import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [CommonModule, FormsModule]
})
export class HomeComponent implements OnInit {
  user: User | null = null;
  loading = true;

  username = '';
  file: File | null = null;
  profileSaving = false;

  pwd = { OldPassword: '', NewPassword: '' };
  pwdLoading = false;

  b64File: File | null = null;
  b64Uploading = false;

  profileImageUrl = '';
  imageLoading = false;

  updateAll = { username: '', email: '', password: '' };
  updateAllLoading = false;

  constructor(private auth: AuthService, private userService: UserService) {}

  async ngOnInit() {
    this.user = this.auth.user;
    if (!this.user) {
      try {
        this.user = await this.userService.getProfile();
      } catch {}
    }
    this.username = this.user?.username || '';
    this.updateAll.username = this.user?.username || '';
    this.updateAll.email = (this.user as any)?.email || '';
    this.loading = false;

    this.refreshProfileImage();
  }

  async refreshProfileImage() {
    this.imageLoading = true;
    try {
      this.profileImageUrl = await this.userService.getProfileImage();
    } catch {
      this.profileImageUrl = '';
    } finally {
      this.imageLoading = false;
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.file = (input.files && input.files[0]) || null;
  }

  onB64FileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.b64File = (input.files && input.files[0]) || null;
  }

  async onSaveProfile(e: Event) {
    e.preventDefault();
    this.profileSaving = true;
    try {
      const form = new FormData();
      form.append('username', this.username);
      if (this.file) form.append('image', this.file);
      const updated = await this.userService.updateUserProfile(form);
      alert('Profile updated');
      if (updated?.username) {
        this.user = updated;
        this.auth['userSubject']?.next?.(updated); 
      }
      await this.refreshProfileImage();
    } catch (err: any) {
      alert(err?.error?.errorMessage || 'Update failed');
    } finally {
      this.profileSaving = false;
    }
  }

  async onChangePassword(e: Event) {
    e.preventDefault();
    this.pwdLoading = true;
    try {
      await this.userService.changePassword(this.pwd);
      alert('Password changed');
      this.pwd = { OldPassword: '', NewPassword: '' };
    } catch (err: any) {
      alert(err?.error?.errorMessage || 'Change password failed');
    } finally {
      this.pwdLoading = false;
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        resolve(res.split(',')[1] || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async onSaveBase64(e: Event) {
    e.preventDefault();
    if (!this.b64File) return alert('Select a file first.');
    this.b64Uploading = true;
    try {
      const b64 = await this.fileToBase64(this.b64File);
      await this.userService.saveProfileImageBase64(b64);
      alert('Profile image saved (base64).');
      await this.refreshProfileImage();
      this.b64File = null;
    } catch (err: any) {
      alert(err?.error?.errorMessage || 'Upload failed');
    } finally {
      this.b64Uploading = false;
    }
  }

  async onUpdateAll(e: Event) {
    e.preventDefault();
    this.updateAllLoading = true;
    try {
      const updated = await this.userService.updateUser(this.updateAll);
      alert('User updated');
      if (updated) {
        this.user = updated;
        this.username = updated?.username || this.username;
      }
    } catch (err: any) {
      alert(err?.error?.errorMessage || 'Update user failed');
    } finally {
      this.updateAllLoading = false;
    }
  }

  async onDeleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await this.userService.deleteAccount();
      alert('Account deleted');
      await this.auth.signOut();
    } catch (err: any) {
      alert(err?.error?.errorMessage || 'Delete account failed');
    }
  }

  async onSignOut() {
    await this.auth.signOut();
  }
}