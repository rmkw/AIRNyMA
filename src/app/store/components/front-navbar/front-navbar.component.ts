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
    console.log(' Computed user:', this._authService.user());
    return this._authService.user();
  });

  userName = computed(() => {
    console.log(' Computed userName:', this.user()?.nombre ?? '');
    return this.user()?.nombre ?? '';
  });

  //! MENU HAMBURGESA
  menuHamburgesa: boolean = false;
  toggleMenuHamburgesa() {
    this.menuHamburgesa = !this.menuHamburgesa;
  }
  cerrarMenuHamburgesa() {
    this.menuHamburgesa = false;
  }

  //!CAMBIAR THEMAS
  themes = ['default', 'retro', 'cyberpunk', 'valentine', 'aqua'];
  selectedTheme = signal(localStorage.getItem('theme') || 'default');

  dropdownAbierto = signal(false);

  constructor() {
    this.applyTheme(this.selectedTheme());
  }

  toggleDropdown() {
    this.dropdownAbierto.set(!this.dropdownAbierto());
  }

  cerrarDropdown() {
    this.dropdownAbierto.set(false);
  }

  changeTheme(theme: string) {
    this.selectedTheme.set(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
    this.cerrarDropdown(); // Cierra el dropdown después de seleccionar
  }

  private applyTheme(theme: string) {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
