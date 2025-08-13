import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  imports: [CommonModule, FormsModule, RouterModule]
})
export class SignUpComponent {
  username = '';
  email = '';
  password = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit(e: Event) {
    e.preventDefault();
    this.loading = true;
    try {
      await this.auth.signUp({ username: this.username, email: this.email, password: this.password }).toPromise();
      alert('Account created! Please verify your email.');
      this.router.navigate(['/verify-otp'], { state: { email: this.email } });
    } catch (err: any) {
      const msg = err?.error?.errorMessage || err?.error?.responseMessage || 'Sign up failed';
      alert(msg);
    } finally {
      this.loading = false;
    }
  }
}