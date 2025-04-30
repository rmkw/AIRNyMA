import { FiEcoResponce } from '@/fuenteIdentificacion/interfaces/fiEco-responce.interface';
import { FuenteIdentificacionService } from '@/fuenteIdentificacion/services/fuente-identificacion.service';
import { PpEconomicas } from '@/procesoProduccion/interfaces/ppEco-responce.interface';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, input, OnInit, signal, ViewChild } from '@angular/core';
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

  procesoProduccion: string = '';
  acronimoProceso: string = '';

  fuente = '';
  linkFuente = '';
  anioEvento: number | string = '';
  comentarioF = '';

  flagVarButton: boolean = true;
  loading = true;

  fuentes: any[] = [];

  _responsableRegister: number | null = null;

  ngOnInit(): void {
    this.getPropsLocalStorage();
    this.getFuentesByidPp();
  }

  getPropsLocalStorage() {
    const propsPp = localStorage.getItem('procesoEditable');

    if (propsPp) {
      const procesoP = JSON.parse(propsPp);
      const _responsableRegister = localStorage.getItem('_id');

      this.procesoProduccion = procesoP.nombrePp;
      this.acronimoProceso = procesoP.acronimo;
      this._responsableRegister = Number(_responsableRegister!);
    }
  }
  getFuentesByidPp() {
    if (!this._responsableRegister || !this.acronimoProceso) {
      console.error('Responsable o acrónimo de proceso no definidos');
      return;
    }
    this._fuentesService
      .getByIdPpAndResponsable(this.acronimoProceso, this._responsableRegister)
      .subscribe({
        next: (response) => {
          console.log('Fuentes encontradas:', response.fuentes);
          this.fuentes = response.fuentes;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al obtener fuentes:', err);
        },
      });
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

  limpiarAnio() {
    this.anioEvento = '';
  }

  nuevaFuente() {
    if (
      !this.fuente ||
      !this.linkFuente ||
      !this.anioEvento ||
      !this.comentarioF
    ) {
      console.error('Todos los campos son obligatorios');
      this.showModalSinDatos();
      return;
    }

    const datosFuente = {
      idPp: this.acronimoProceso,
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
  limpiarFormulario() {
    this.fuente = '';
    this.linkFuente = '';
    this.anioEvento = '';
    this.comentarioF = '';
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

  addVars(_fuente: FiEcoResponce) {
    localStorage.removeItem('fuenteEditable');
    const fuenteEditable = {
      idFuente: _fuente.idFuente,
      idPp: _fuente.idPp,
      anioEvento: _fuente.anioEvento,
    };
    localStorage.setItem('fuenteEditable', JSON.stringify(fuenteEditable));
    this._router.navigate(['/nueva-variable']);
  }

  @ViewChild('modalEliminar') modalEliminar!: ElementRef<HTMLDialogElement>;
  idFuenteSeleccionada: number | null = null;
  abrirModal(id: number) {
    this.idFuenteSeleccionada = id;
    this.modalEliminar.nativeElement.showModal();
  }

  cerrarModal() {
    this.modalEliminar.nativeElement.close();
    this.idFuenteSeleccionada = null;
  }
  confirmarEliminacion() {
    if (this.idFuenteSeleccionada !== null) {
      this.desactivar(this.idFuenteSeleccionada);
    }
    this.cerrarModal();
  }
  desactivar(id: number): void {
    this._fuentesService.deactivateRecord(id).subscribe({
      next: (res) => {
        console.log('Registro desactivado:', res);
        this.getFuentesByidPp();
      },
      error: (err) => {
        console.error('Error al desactivar:', err);
      },
    });
  }
  @ViewChild('modalSinDatos') modalSinDatos!: ElementRef<HTMLDialogElement>;
  showModalSinDatos(){
    this.modalSinDatos.nativeElement.showModal();
  }
  cloceModalSinDatos(){
    this.modalSinDatos.nativeElement.close();
  }
}
