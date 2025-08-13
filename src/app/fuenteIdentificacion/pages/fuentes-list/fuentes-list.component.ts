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
  acronimo: string = '';

  fuente = '';
  url = '';
  edicion: number | string = '';
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
      this.acronimo = procesoP.acronimo;
      this._responsableRegister = Number(_responsableRegister!);
    }
  }
  getFuentesByidPp() {
    if (!this._responsableRegister || !this.acronimo) {
      console.error('Responsable o acrónimo de proceso no definidos');
      return;
    }
    this._fuentesService
      .getByIdPpAndResponsable(this.acronimo, this._responsableRegister)
      .subscribe({
        next: (response) => {
          console.log('✅ Resultado del backend:', response);

          this.fuentes = response.fuentes;
          if (this.fuentes.length > 0) {
            this.loading = false;
          } else {
            this.loading = true;
          }
        },
        error: (err) => {
          console.error('Error al obtener fuentes:', err);
        },
      });
  }

  async validateYear(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const rawValue = inputElement.value;

    // // Solo procedemos si tiene exactamente 4 caracteres
    // if (rawValue.length !== 9) return;

    // // Limpiamos todo lo que no sea número
    // const cleanedValue = rawValue.replace(/[^0-9]/g, '');

    // // Verificamos si el resultado sigue teniendo 4 caracteres
    // if (cleanedValue.length !== 9) {
    //   await this.limpiarAnio();
    //   return;
    // }

    // const parsedYear = parseInt(cleanedValue, 10);

    // if (isNaN(parsedYear) || parsedYear < 1800 || parsedYear > 2099) {
    //   await this.limpiarAnio();
    //   return;
    // }

    // Si todo está bien, asignamos el valor limpio
    this.edicion = rawValue;
    console.log(this.edicion);
  }

  limpiarAnio() {
    this.edicion = '';
  }
  idFuente: string = '';
  mensajeError: string = '';
  nuevaFuente() {
    if (!this.fuente || !this.url || !this.edicion || !this.comentarioF) {
      console.error('Todos los campos son obligatorios');
      this.showModalSinDatos();
      return;
    }

    const datosFuente = {
      idFuente:
        this.acronimo + '-' + this.fuente + '-' + this.edicion + '-' + this.url,
      acronimo: this.acronimo,
      fuente: this.fuente,
      url: this.url,
      edicion: this.edicion,
      comentarioS: this.comentarioF,
    };

    // console.log('Datos a registrar:', datosFuente);

    this._fuentesService.registrarFuente(datosFuente).subscribe(
      (response) => {
        console.log('Respuesta del backend:', response);
        if (response) {
          this.limpiarFormulario();
          this.ngOnInit();
          this.showmodalFuenteNueva();
        }
      },
      (error) => {
        console.error('Error completo:', error);
        if (error.status === 409) {
          this.mensajeError = 'Ya existe una fuente con esa información.';
          this.showModalErrorFuenteDuplicada();
        } else {
          alert(
            'Error al registrar la fuente (API) o Ya existe una fuente con esta información. '
          );
        }
      }
    );

  }
  limpiarFormulario() {
    this.fuente = '';
    this.url = '';
    this.edicion = '';
    this.comentarioF = '';
  }
  editarFuente(_fuente: FiEcoResponce) {
    localStorage.removeItem('fuenteEditable');
    const fuenteEditable = {
      idFuente: _fuente.idFuente,
      acronimo: _fuente.acronimo,
      fuente: _fuente.fuente,
      url: _fuente.url,
      edicion: _fuente.edicion,
      comentarioS: _fuente.comentarioS,
      responsableActualizacion: _fuente.responsableActualizacion,
    };
    localStorage.setItem('fuenteEditable', JSON.stringify(fuenteEditable));

    this._router.navigate(['/fuente', _fuente.idFuente]);
  }

  addVars(_fuente: FiEcoResponce) {
    localStorage.removeItem('fuenteEditable');
    const fuenteEditable = {
      idFuente: _fuente.idFuente,
      idPp: _fuente.acronimo,
      edicion: _fuente.edicion,
    };
    localStorage.setItem('fuenteEditable', JSON.stringify(fuenteEditable));
    this._router.navigate(['/nueva-variable']);
  }

  @ViewChild('modalEliminar') modalEliminar!: ElementRef<HTMLDialogElement>;
  idFuenteSeleccionada: string | null = null;
  abrirModal(id: string) {
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
  desactivar(id: string): void {
    this._fuentesService.deactivateRecord(id).subscribe({
      next: (res) => {
        console.log('Registro eliminado:', res);
        this.getFuentesByidPp();
      },
      error: (err) => {
        console.error('Error al desactivar:', err);
      },
    });
  }
  @ViewChild('modalSinDatos') modalSinDatos!: ElementRef<HTMLDialogElement>;
  showModalSinDatos() {
    this.modalSinDatos.nativeElement.showModal();
  }
  cloceModalSinDatos() {
    this.modalSinDatos.nativeElement.close();
  }
  @ViewChild('modalFuenteNueva')
  modalFuenteNueva!: ElementRef<HTMLDialogElement>;
  showmodalFuenteNueva() {
    this.modalFuenteNueva.nativeElement.showModal();
  }
  clocemodalFuenteNueva() {
    this.modalFuenteNueva.nativeElement.close();
  }

  @ViewChild('modalErrorFuenteDuplicada')
  modalErrorFuenteDuplicada!: ElementRef<HTMLDialogElement>;
  showModalErrorFuenteDuplicada() {
    this.modalErrorFuenteDuplicada.nativeElement.showModal();
  }
  cerrarModalerror(){
    this.modalErrorFuenteDuplicada.nativeElement.close();
    this.mensajeError = ''; // Limpiar el mensaje de error
    this.limpiarFormulario(); // Limpiar el formulario
    this.ngOnInit(); // Recargar las fuentes
  }
}
