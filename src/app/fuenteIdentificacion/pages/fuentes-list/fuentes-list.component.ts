import { FiEcoResponce } from '@/fuenteIdentificacion/interfaces/fiEco-responce.interface';
import { FuenteIdentificacionService } from '@/fuenteIdentificacion/services/fuente-identificacion.service';
import { PpEconomicas } from '@/procesoProduccion/interfaces/ppEco-responce.interface';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { tap } from 'rxjs';


@Component({
  selector: 'app-fuentes-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './fuentes-list.component.html',
})
export class FuentesListComponent implements OnInit {
  _fuentesService = inject(FuenteIdentificacionService);
  _router = inject(Router);
  _ppEcoService = inject(ppEcoService);

  fuentes: any[] = [];
  loading = true;

  fuente = '';
  linkFuente = '';
  anioEvento: number | string = '';
  comentarioF = '';

  flagVarButton: boolean = true;

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

  ngOnInit(): void {
    this.getFuentes();
  }

  getFuentes() {
    this._fuentesService.obtenerFuentes().subscribe((data) => {
      if (data.length === 0) {
        console.warn('No hay registros en fuentes:', data);
      }
      this.fuentes = data;
      this.loading = false;
    });
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

    this._fuentesService.registrarFuente(datosFuente).subscribe(
      (response) => {
        if (response) {
          console.log('Fuente registrada exitosamente', response);
          alert('Fuente registrada exitosamente');
          this.flagVarButton = true;
          this.ngOnInit();
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

  editarFuente(_fuente: FiEcoResponce) {
    localStorage.removeItem('fuenteEditable');
    const fuenteEditable = {
      idFuente: _fuente.idFuente,
      idPp: _fuente.idPp,
      fuente: _fuente.fuente,
      linkFuente: _fuente.linkFuente,
      anioEvento: _fuente.anioEvento,
      comentario: _fuente.comentario,
      responsableActualizacion: _fuente.responsableActualizacion,
    };
    localStorage.setItem('fuenteEditable', JSON.stringify(fuenteEditable));

    this._router.navigate(['/fuente', _fuente.idFuente]);
  }

  seleccionarProceso(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const procesoId = Number(selectElement.value);

    const procesoEncontrado =
      this.ppEco().find((proceso) => proceso.id === procesoId) || null;
    this.procesoSeleccionado.set(procesoEncontrado);
  }

  limpiarFormulario() {
    this.fuente = '';
    this.linkFuente = '';
    this.anioEvento = '';
    this.comentarioF = '';
    this.procesoSeleccionado.set(null); // Restablecer el proceso seleccionado
  }

  limpiarAnio() {
    this.anioEvento = '';
  }

  async validateYear(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const rawValue = inputElement.value;

    // Solo procedemos si tiene exactamente 4 caracteres
    if (rawValue.length !== 4) return;

    // Limpiamos todo lo que no sea número
    const cleanedValue = rawValue.replace(/[^0-9]/g, '');

    // Verificamos si el resultado sigue teniendo 4 caracteres
    if (cleanedValue.length !== 4) {
      await this.limpiarAnio();
      return;
    }

    const parsedYear = parseInt(cleanedValue, 10);

    if (isNaN(parsedYear) || parsedYear < 1800 || parsedYear > 2099) {
      await this.limpiarAnio();
      return;
    }

    // Si todo está bien, asignamos el valor limpio
    this.anioEvento = cleanedValue;
  }
}
