import { FuenteIdentificacionService } from '@/fuenteIdentificacion/services/fuente-identificacion.service';
import { PpEconomicas } from '@/procesoProduccion/interfaces/ppEco-responce.interface';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { tap } from 'rxjs';

@Component({
  selector: 'app-nueva-fuente',
  imports: [FormsModule],
  templateUrl: './nueva-fuente.component.html',
})
export class NuevaFuenteComponent {
  _fuenteIServive = inject(FuenteIdentificacionService);
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

  fuente = '';
  linkFuente = '';
  anioEvento = '';
  comentarioF = '';

  seleccionarProceso(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const procesoId = Number(selectElement.value);

    const procesoEncontrado =
      this.ppEco().find((proceso) => proceso.id === procesoId) || null;
    this.procesoSeleccionado.set(procesoEncontrado);
  }

  nuevaFuente() {
    if (!this.procesoSeleccionado()) {
      console.error('Por favor, selecciona un proceso de producción');
      alert('Por favor, selecciona un proceso de producción');
      return;
    }

    if (
      !this.fuente ||
      !this.linkFuente ||
      !this.anioEvento ||
      !this.comentarioF
    ) {
      console.error('Todos los campos son obligatorios');
      alert('Por favor, completa todos los campos');
      return;
    }

    const datosFuente = {
      idPp: this.procesoSeleccionado()?.acronimoProceso || '',
      fuente: this.fuente,
      linkFuente: this.linkFuente,
      anioEvento: this.anioEvento,
      comentario: this.comentarioF,
    };

    console.log('Datos a registrar:', datosFuente);

    this._fuenteIServive.registrarFuente(datosFuente).subscribe(
      (response) => {
        if (response) {
          console.log('Fuente registrada exitosamente', response);
          alert('Fuente registrada exitosamente');
          this.limpiarFormulario();
        } else {
          console.error('Hubo un error al registrar la fuente');
          alert('Hubo un error al registrar la fuente');
        }
      },
      (error) => {
        console.error('Error en la solicitud', error);
        alert('Ocurrió un error al intentar registrar la fuente');
      }
    );
  }
  limpiarFormulario() {
    this.fuente = '';
    this.linkFuente = '';
    this.anioEvento = '';
    this.comentarioF = '';
    this.procesoSeleccionado.set(null);  // Restablecer el proceso seleccionado
  }
}
