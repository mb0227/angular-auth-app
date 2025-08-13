import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  imports: [CommonModule, FormsModule]
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit(e: Event) {
    e.preventDefault();
    this.loading = true;
    try {
      await this.auth.forgotPassword({ email: this.email }).toPromise();
      alert('OTP sent to your email.');
      this.router.navigate(['/reset-password'], { state: { email: this.email } });
    } catch (err: any) {
      const msg = err?.error?.errorMessage || 'Request failed';
      alert(msg);
    } finally {
      this.loading = false;
    }
  }
}