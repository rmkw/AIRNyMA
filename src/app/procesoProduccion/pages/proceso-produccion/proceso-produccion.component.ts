import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { PpEconomicas } from '@/procesoProduccion/interfaces/ppEco-responce.interface';
import { Direccion } from '@/variables/interfaces/direcciones.interface';
import { DireccionesService } from '@/procesoProduccion/services/direcciones.service';

@Component({
  selector: 'app-proceso-produccion',
  imports: [CommonModule, FormsModule],
  templateUrl: './proceso-produccion.component.html',
})
export class ProcesoProduccionComponent implements OnInit{
  ngOnInit(): void {
      this.getDirecciones();
  }
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

  mostrarAlertaNoProceso = signal(false);

  actualizarComentario() {
    const id = this.procesoSeleccionado()?.id;
    this.ppSelected = id;

    if (!id) {
      console.error('No hay proceso seleccionado');

      // 🔥 Mostrar alerta
      this.mostrarAlertaNoProceso.set(true);
      this.mensajeAlerta = `Ningun proceso seleccionado.`;
      setTimeout(() => this.mostrarAlertaNoProceso.set(false), 3000);

      return;
    }

    this.showWarning = true;
  }

  showWarning: boolean = false;
  ppSelected: any = null;

  cancelDeactivation() {
    this.showWarning = false;
  }

  confirmDeactivation() {
    this._ppEcoService
      .actualizarComentario(this.ppSelected, this.comentario)
      .subscribe({
        next: (procesoActualizado) => {
          this.procesoSeleccionado.set(procesoActualizado);

          // 🔥 Recargar los datos correctamente
          this.ppEcoResource.reload();

          // 🔥 Mostrar alerta
          this.mostrarAlerta.set(true);
          this.mensajeAlerta = `Proceso: ${procesoActualizado.acronimoProceso} actualizado correctamente.`;
          setTimeout(() => this.mostrarAlerta.set(false), 3000);
          this.showWarning = false;
        },
        error: (err) => console.error('Error al actualizar:', err),
      });
  }

  arrDirecciones: Direccion[] = [];
  direccionSelected: string | null = null;
  _serviceDirecciones = inject(DireccionesService);

  getDirecciones() {
    this._serviceDirecciones.getDirecciones().subscribe({
      next: (data) => {
        this.arrDirecciones = data;
        console.log(this.arrDirecciones);
      },
      error: (err) => {
        console.error('error al cargar', err);
      },
    });
  }
}
