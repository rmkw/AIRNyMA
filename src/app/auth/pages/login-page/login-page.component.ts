import { authService } from '@/auth/services/auth.service';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  fb = inject(FormBuilder);
  hasError = signal(false);
  isPosting = signal(false);
  router = inject(Router);

  _authService = inject(authService);
  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
      }, 2000);
      return;
    }
    const { username = '', password = '' } = this.loginForm.value;

    this._authService
      .login(username!, password!)
      .subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigateByUrl('/');
          return;
        }
        this.hasError.set(true);
        setTimeout(() => {
          this.hasError.set(false);
        }, 2000);
      });
  }
  selectedTheme = signal(localStorage.getItem('theme') || 'halloween');
  constructor() {
    this.applyTheme(this.selectedTheme());
  }
  private applyTheme(theme: string) {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
