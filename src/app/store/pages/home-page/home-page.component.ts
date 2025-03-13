
import { Component, inject, input, signal } from '@angular/core';
import { UserService } from '../../../products/services/user.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { ppEcoService } from '@/products/services/ppEco.service';
import { PpEconomicas } from '@/products/interfaces/ppEco-responce.interface';
import { tap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  _userService = inject(UserService);

  UsersResource = rxResource({
    request: () => ({}),
    loader: ({ request }) => {
      return this._userService.getUsers();
    },
  });

  _ppEcoService = inject(ppEcoService);

  // Estado reactivo para almacenar los datos de la API
  ppEco = signal<PpEconomicas[]>([]);

  // Usar rxResource para manejar la solicitud
  ppEcoResource = rxResource({
    request: () => ({}),
    loader: ({ request }) => {
      return this._ppEcoService.getPpEcos().pipe(
        tap((data) => {
          console.log('Datos de la API:', data); // Verifica que llega bien
          this.ppEco.set(Array.isArray(data) ? data : []); // Guarda el array correctamente
        })
      );
    },
  });

  // Estado reactivo para el proceso seleccionado
  procesoSeleccionado = signal<PpEconomicas | null>(null);
  // Método para seleccionar el proceso basado en el ID del select
  seleccionarProceso(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const procesoId = Number(selectElement.value);

    const procesoEncontrado =
      this.ppEco().find((proceso) => proceso.id === procesoId) || null;
    this.procesoSeleccionado.set(procesoEncontrado);
  }
}
