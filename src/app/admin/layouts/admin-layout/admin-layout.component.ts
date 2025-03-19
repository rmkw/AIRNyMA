import { authService } from '@/auth/services/auth.service';
import { Component, computed, Inject, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  public _authService = inject(authService);

  user = computed(()=> this._authService.user());





}
