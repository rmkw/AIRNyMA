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
  tieneRol(rol: string): boolean {
    const rolesGuardados = localStorage.getItem('roles');
    if (!rolesGuardados) return false;

    try {
      const roles = JSON.parse(rolesGuardados) as string[];
      return roles.includes(rol);
    } catch (error) {
      console.error('Error al leer roles del localStorage', error);
      return false;
    }
  }

  esSeleccion(): boolean {
    return (
      this.tieneRol('USER') &&
      !this.tieneRol('ARMO') &&
      !this.tieneRol('ADMIN') &&
      !this.tieneRol('ROOT')
    );
  }

  esArmonizacion(): boolean {
    return (
      this.tieneRol('USER') &&
      this.tieneRol('ARMO') &&
      !this.tieneRol('ADMIN') &&
      !this.tieneRol('ROOT')
    );
  }

  esAdmin(): boolean {
    return (
      this.tieneRol('USER') &&
      this.tieneRol('ARMO') &&
      this.tieneRol('ADMIN') &&
      !this.tieneRol('ROOT')
    );
  }

  esRoot(): boolean {
    return (
      this.tieneRol('USER') &&
      this.tieneRol('ARMO') &&
      this.tieneRol('ADMIN') &&
      this.tieneRol('ROOT')
    );
  }
  puedeVerSeleccion(): boolean {
    return this.esSeleccion();
  }

  puedeVerArmonizacion(): boolean {
    return this.esArmonizacion();
  }

  puedeVerAdmin(): boolean {
    return this.esAdmin();
  }

  puedeVerRoot(): boolean {
    return this.esRoot();
  }
}
