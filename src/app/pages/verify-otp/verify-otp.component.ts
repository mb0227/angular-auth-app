import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  imports: [CommonModule, FormsModule]
})
export class VerifyOtpComponent {
  email = history.state?.email || '';
  otp = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onVerify(e: Event) {
    e.preventDefault();
    this.loading = true;
    try {
      await this.auth.verifyOtp({ email: this.email, otp: this.otp }).toPromise();
      alert('Email verified! You can now sign in.');
      this.router.navigateByUrl('/signin');
    } catch (err: any) {
      const msg = err?.error?.errorMessage || 'Verification failed';
      alert(msg);
    } finally {
      this.loading = false;
    }
  }

  async onResend() {
    try {
      await this.auth.resendOtp({ email: this.email }).toPromise();
      alert('OTP resent.');
    } catch (err: any) {
      const msg = err?.error?.errorMessage || 'Resend failed';
      alert(msg);
    }
  }
}