import { PpEconomicas } from '@/procesoProduccion/interfaces/ppEco-responce.interface';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { Component, signal, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { tap } from 'rxjs';


@Component({
  selector: 'app-fuente-identificacion',
  imports: [FormsModule],
  templateUrl: './fuente-identificacion.component.html',
})
export class FuenteIdentificacionComponent {
  _ppEcoService = inject(ppEcoService);

  ppEco = signal<PpEconomicas[]>([]);
  procesoSeleccionado = signal<PpEconomicas | null>(null);

  ppEcoResource = rxResource({
    request: () => ({}),
    loader: ({ request }) => {
      return this._ppEcoService.getPpEcos().pipe(
        tap((data) => {
          this.ppEco.set(Array.isArray(data) ? data : []);
        })
      );
    },
  });

  comentario = '';

  Siguiente() {}

  seleccionarProceso(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const procesoId = Number(selectElement.value);

    const procesoEncontrado =
      this.ppEco().find((proceso) => proceso.id === procesoId) || null;
    this.procesoSeleccionado.set(procesoEncontrado);
    console.log(this.procesoSeleccionado())
    this.comentario = procesoEncontrado
      ? procesoEncontrado.comentarioPp || ''
      : '';
  }
}
