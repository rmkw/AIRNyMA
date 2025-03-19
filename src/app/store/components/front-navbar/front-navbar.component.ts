import { authService } from '@/auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, Inject, signal } from '@angular/core';
import { InjectSetupWrapper } from '@angular/core/testing';
import { RouterLink, RouterLinkActive } from '@angular/router';


@Component({
  selector: 'front-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './front-navbar.component.html',
})
export class FrontNavbarComponent {
  public _authService = inject(authService);


  user = computed(() => {
    // console.log(' Computed userFRONTNAVBAR:', this._authService.user());
    return this._authService.user();
  });


  userName = computed(() => {
    // console.log(' Computed userNameFRONTNAVBAR:', this.user()?.nombre ?? '');
    return this.user()?.nombre ?? '';
  });

  menuAbierto: boolean = false;

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

}
