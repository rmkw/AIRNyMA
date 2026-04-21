import { FiEcoResponce } from '@/fuenteIdentificacion/interfaces/fiEco-responce.interface';
import { FuenteIdentificacionService } from '@/fuenteIdentificacion/services/fuente-identificacion.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit,  ViewChild } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router,  } from '@angular/router';
import { finalize,  } from 'rxjs';


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



  async validateYear(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const rawValue = inputElement.value;


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

  cerrarModalerror() {
    this.modalErrorFuenteDuplicada.nativeElement.close();
    this.mensajeError = ''; // Limpiar el mensaje de error
    this.limpiarFormulario(); // Limpiar el formulario
    this.ngOnInit(); // Recargar las fuentes
  }
}
