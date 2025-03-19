import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { PpEconomicas } from '@/procesoProduccion/interfaces/ppEco-responce.interface';

@Component({
  selector: 'app-proceso-produccion',
  imports: [CommonModule, FormsModule],
  templateUrl: './proceso-produccion.component.html',
})
export class ProcesoProduccionComponent {
  _ppEcoService = inject(ppEcoService);
  ppEco = signal<PpEconomicas[]>([]);
  procesoSeleccionado = signal<PpEconomicas | null>(null);
  comentario = '';
  mostrarAlerta = signal(false);
  mensajeAlerta = '';

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

  seleccionarProceso(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const procesoId = Number(selectElement.value);

    const procesoEncontrado =
      this.ppEco().find((proceso) => proceso.id === procesoId) || null;
    this.procesoSeleccionado.set(procesoEncontrado);
    this.comentario = procesoEncontrado
      ? procesoEncontrado.comentarioPp || ''
      : '';
  }

  alertaVisible = signal(false);

  actualizarComentario() {
    const id = this.procesoSeleccionado()?.id;

    if (!id) {
      console.error('No hay proceso seleccionado');
      return;
    }

    this._ppEcoService.actualizarComentario(id, this.comentario).subscribe({
      next: (procesoActualizado) => {

        this.procesoSeleccionado.set(procesoActualizado);

        // 🔥 Recargar los datos correctamente
        this.ppEcoResource.reload();

        // 🔥 Mostrar alerta
        this.mostrarAlerta.set(true);
        this.mensajeAlerta = `Proceso: ${procesoActualizado.acronimoProceso} actualizado correctamente.`;
        setTimeout(() => this.mostrarAlerta.set(false), 3000);
      },
      error: (err) => console.error('Error al actualizar:', err),
    });
  }
}
