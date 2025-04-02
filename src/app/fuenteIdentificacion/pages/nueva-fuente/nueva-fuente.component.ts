import { FuenteIdentificacionService } from '@/fuenteIdentificacion/services/fuente-identificacion.service';
import { PpEconomicas } from '@/procesoProduccion/interfaces/ppEco-responce.interface';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { tap } from 'rxjs';

@Component({
  selector: 'app-nueva-fuente',
  imports: [FormsModule, CommonModule],
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

  flagVarButton: boolean = true;

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
          this.flagVarButton = true;
          // this.limpiarFormulario();
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
    this.procesoSeleccionado.set(null); // Restablecer el proceso seleccionado
  }

  idVariable: string = '';
  nombreVariable: string = '';
  definicionVariable: string = '';
  comentarioVariable: string = '';
  alinea_MDEA: string = '';
  alinea_ODS: string = '';

  flagMDEArelation: boolean = false;
  showWarning: boolean = false;

  currentDeactivation: { type: 'MDEA' | 'ODS'; name: string } | null = null;

  checkedAliniationMDEA(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const newValue = checkbox.checked;

    // Si está intentando desactivar (de true a false)
    if (this.flagMDEArelation && !newValue) {
      event.preventDefault(); // Prevenir el cambio
      this.currentDeactivation = { type: 'MDEA', name: 'MDEA' };

      this.showWarning = true;
    } else if (!this.flagMDEArelation && newValue) {
      // Activación directa (sin confirmación)
      this.flagMDEArelation = true;
      this.showWarning = false;
    }
  }

  confirmDeactivation() {
    if (this.currentDeactivation) {
      if (this.currentDeactivation.type === 'MDEA') {
        this.flagMDEArelation = false;
      } else {
        this.flagODSrelation = false;
      }
    }
    this.showWarning = false;
    this.currentDeactivation = null;
  }

  cancelDeactivation() {
    this.showWarning = false;
    this.currentDeactivation = null;
    // Forzar el estado de los checkboxes
    setTimeout(() => {
      const mdeaCheckbox = document.querySelector(
        '#alinea_MDEA'
      ) as HTMLInputElement;
      const odsCheckbox = document.querySelector(
        '#alinea_ODS'
      ) as HTMLInputElement;

      if (mdeaCheckbox) mdeaCheckbox.checked = this.flagMDEArelation;
      if (odsCheckbox) odsCheckbox.checked = this.flagODSrelation;
    });
  }

  flagODSrelation: boolean = false;
  pendingDeactivationODS: boolean = false;

  checkedAliniationODS(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const newValue = checkbox.checked;

    if (this.flagODSrelation && !newValue) {
      event.preventDefault();
      this.currentDeactivation = { type: 'ODS', name: 'ODS' };
      this.showWarning = true;
    } else if (!this.flagODSrelation && newValue) {
      this.flagODSrelation = true;
    }
  }


}
