import { authService } from '@/auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'front-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './front-navbar.component.html',
})
export class FrontNavbarComponent {
  public _authService = inject(authService);
  public auth = this._authService;

  user = computed(() => this._authService.user());
  userName = computed(() => this.user()?.aka ?? '');

  navegandosinStorage() {
    localStorage.removeItem('fuenteEditable');
  }
}
