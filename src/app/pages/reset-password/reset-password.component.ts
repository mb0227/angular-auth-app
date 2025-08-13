import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  imports: [CommonModule, FormsModule]
})
export class ResetPasswordComponent {
  email = history.state?.email || '';
  otp = '';
  password = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit(e: Event) {
    e.preventDefault();
    this.loading = true;
    try {
      await this.auth.resetPassword({ email: this.email, password: this.password, otp: this.otp }).toPromise();
      alert('Password reset successful. Please sign in.');
      this.router.navigateByUrl('/signin');
    } catch (err: any) {
      const msg = err?.error?.errorMessage || 'Reset failed';
      alert(msg);
    } finally {
      this.loading = false;
    }
  }
}