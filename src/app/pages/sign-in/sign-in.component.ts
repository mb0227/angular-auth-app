import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  imports: [CommonModule, FormsModule, RouterModule]
})
export class SignInComponent {
  email = '';
  password = '';
  showPass = false;
  loading = false;
  googleLoading = false;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit(e: Event) {
    e.preventDefault();
    this.loading = true;
    try {
      await this.auth.signIn({ email: this.email, password: this.password });
      this.router.navigateByUrl('/');
    } catch (err: any) {
      const msg =
        err?.error?.errorMessage || err?.error?.responseMessage || 'Invalid credentials';
      alert(msg);
    } finally {
      this.loading = false;
    }
  }

  async continueWithGoogle() {
    this.googleLoading = true;
    try {
      const { url } = await this.auth.googleLogin();
      if (url) window.location.href = url;
      else alert('Failed to initiate Google login.');
    } catch (err: any) {
      const msg = err?.error?.errorMessage || 'Google login failed';
      alert(msg);
    } finally {
      this.googleLoading = false;
    }
  }
}