import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { homeService } from '../../services/home.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink,CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  totalProcesos = 0;
  totalFuentes = 0;
  totalVariables = 0;
  totalVariablesPrioritarias = 0;
  totalVariablesArmonizadas = 0;
  homeService = inject(homeService);

  ngOnInit(): void {
    this.homeService.getTotalProcesos().subscribe({
      next: (resp) => {
        this.totalProcesos = resp.total;
      },
      error: (err) => {
        console.error('Error al obtener total de procesos', err);
      },
    });

    this.homeService.getTotalFuentes().subscribe({
      next: (resp) => {
        this.totalFuentes = resp.total;
      },
      error: (err) => {
        console.error('Error al obtener total de fuentes', err);
      },
    });

    this.homeService.getTotalVariables().subscribe({
      next: (resp) => {
        this.totalVariables = resp.total;
      },
      error: (err) => {
        console.error('Error al obtener total de variables', err);
      },
    });

    this.homeService.getTotalVariablesPrioritarias().subscribe({
      next: (resp) => {
        this.totalVariablesPrioritarias = resp.total;
      },
      error: (err) => {
        console.error('Error al obtener total de variables', err);
      },
    });
    this.homeService.getTotalVariablesArmonizadas().subscribe({
      next: (resp) => {
        this.totalVariablesArmonizadas = resp.total;
      },
      error: (err) => {
        console.error('Error al obtener total de variables armonizadas', err);
      },
    });
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

  esSeleccionPura(): boolean {
    return this.tieneRol('USER') && !this.tieneRol('ARMO');
  }

  esArmonizacion(): boolean {
    return this.tieneRol('ARMO');
  }
}
