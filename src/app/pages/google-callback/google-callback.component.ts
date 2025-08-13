import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-google-callback',
  templateUrl: './google-callback.component.html',
  imports: [CommonModule, RouterModule]
})
export class GoogleCallbackComponent implements OnInit {
  error = '';

  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {}

  async ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');
    if (!code) {
      this.error = 'Missing authorization code.';
      return;
    }
    try {
      await this.auth.googleCallback({ code, state });
      this.router.navigateByUrl('/');
    } catch (err: any) {
      this.error =
        err?.error?.errorMessage || err?.error?.responseMessage || 'Google sign-in failed.';
    }
  }
}