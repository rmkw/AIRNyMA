import { authService } from '@/auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TicketsVariablesService } from '@/tickets/services/tickets-variables.service';

@Component({
  selector: 'front-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './front-navbar.component.html',
})
export class FrontNavbarComponent implements OnInit {
  public _authService = inject(authService);
  private ticketsService = inject(TicketsVariablesService);
  public auth = this._authService;

  user = computed(() => this._authService.user());
  userName = computed(() => this.user()?.aka ?? '');
  ticketsPendientes = this.ticketsService.pendientes;

  ngOnInit(): void {
    this.ticketsService.actualizarPendientes();
  }

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
