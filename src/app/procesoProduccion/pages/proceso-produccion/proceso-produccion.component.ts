import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';

import { Direccion } from '@/variables/interfaces/direcciones.interface';
import { DireccionesService } from '@/procesoProduccion/services/direcciones.service';
import { interface_ProcesoP } from '@/procesoProduccion/interfaces/procesos.interface';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-proceso-produccion',
  imports: [CommonModule, FormsModule],
  templateUrl: './proceso-produccion.component.html',
})
export class ProcesoProduccionComponent implements OnInit {
  _serviceDirecciones = inject(DireccionesService);
  _procesoService = inject(ppEcoService);
  _router = inject(Router);
  arrDirecciones: Direccion[] = [];
  arrProcesosByDir: interface_ProcesoP[] = [];
  procesoSeleccionado = signal<interface_ProcesoP | null>(null);
  idProsesoSelect: any = null;

  direccionName: string | number | undefined = undefined;
  _procesos_isSelectEnabled: boolean = false;

  @ViewChild('procesoProduccionTag')
  procesoProduccionTag!: ElementRef<HTMLSelectElement>;

  @ViewChild('modalNoProceso')
  modalNoProceso!: ElementRef<HTMLDialogElement>;

  @ViewChild('modalActualizacionExitosa')
  modalActualizacionExitosa!: ElementRef<HTMLDialogElement>;

  @ViewChild('modalActualizar')
  modalActualizar!: ElementRef<HTMLDialogElement>;

  @ViewChild('AgregarProceso')
  AgregarProceso!: ElementRef<HTMLDialogElement>;

  ngOnInit(): void {
    this.getDirecciones();
  }

  getDirecciones() {
    this._serviceDirecciones.getDirecciones().subscribe({
      next: (data) => {
        this.arrDirecciones = data;
      },
      error: (err) => {
        console.error('error al cargar', err);
      },
    });
  }

  selectedDireccion(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const nameDi = selectElement.value;

    this.direccionName = nameDi;

    const selectedOption = this.procesoProduccionTag
      .nativeElement as HTMLSelectElement;
    selectedOption.selectedIndex = 0;

    this._procesos_isSelectEnabled = true;

    this.cargarProcesosProduccionByDireccionGeneral(nameDi);
  }

  cargarProcesosProduccionByDireccionGeneral(
    dire: string | number | undefined,
  ) {
    this._procesoService.getPorDireccionGeneral(dire).subscribe({
      next: (data) => {
        this.arrProcesosByDir = data;
      },
      error: (err) => {
        console.error('Error al obtener procesos por DG', err);
      },
    });
  }

  seleccionarProceso(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const proceso = selectElement.value;

    if (proceso === 'otro') {
      this.showModalAgregarProceso();
      return;
    }

    const procesoEncontrado =
      this.arrProcesosByDir.find(
        (procesoItem) => procesoItem.acronimo === proceso,
      ) || null;

    this.procesoSeleccionado.set(procesoEncontrado);

    this.comentarioSeleccion = '';
    this.comentarioArmonizacion = '';
    this.existeComentarioSeleccion = false;
    this.existeComentarioArmonizacion = false;

    if (procesoEncontrado?.acronimo) {
      this.cargarComentarioSegunRol();
    }
  }

  showAlertUpComentario() {
    const id = this.procesoSeleccionado()?.acronimo;
    this.idProsesoSelect = id;

    if (!id) {
      this.modalNingunProceso();
      return;
    }

    this.showModalActualizar();
  }

  cancelDeactivation() {
    this.tipoComentarioPendiente = null;
    this.cloceModalActualizar();
  }

  setLocalStorage(_Pp: interface_ProcesoP) {
    if (!this.procesoSeleccionado()) {
      this.modalNingunProceso();
      return;
    }

    const procesoEditable = {
      nombrePp: _Pp.proceso,
      acronimo: _Pp.acronimo,
    };
    localStorage.setItem('procesoEditable', JSON.stringify(procesoEditable));
    this._router.navigate(['/fuentes']);
  }

  modalNingunProceso() {
    this.modalNoProceso.nativeElement.showModal();
  }
  cerrarModal() {
    this.modalNoProceso.nativeElement.close();
  }

  showmodalActualizacionExitosa() {
    this.cloceModalActualizar();
    this.modalActualizacionExitosa.nativeElement.showModal();
  }
  clocemodalActualizacionExitosa() {
    this.modalActualizacionExitosa.nativeElement.close();
  }

  showModalActualizar() {
    this.modalActualizar.nativeElement.showModal();
  }
  cloceModalActualizar() {
    this.modalActualizar.nativeElement.close();
  }

  showModalAgregarProceso() {
    this.AgregarProceso.nativeElement.showModal();
  }
  clocemodalAgregarProceso() {
    this.AgregarProceso.nativeElement.close();

    const selectElement = this.procesoProduccionTag.nativeElement;
    selectElement.selectedIndex = 0;
  }

  confirmarIrANuevoProceso() {
    if (!this.direccionName) {
      alert('Primero selecciona una unidad productora de información.');
      return;
    }

    this._router.navigate(['/nuevo-proceso'], {
      queryParams: { direccion: this.direccionName },
    });
  }

  //? COMENTARIOS

  comentarioSeleccion: string = '';
  comentarioArmonizacion: string = '';

  existeComentarioSeleccion: boolean = false;
  existeComentarioArmonizacion: boolean = false;

  tipoComentarioPendiente: 'seleccion' | 'armonizacion' | null = null;

  tieneRol(rol: string): boolean {
    const rolesGuardados = localStorage.getItem('roles');
    if (!rolesGuardados) return false;

    try {
      const roles = JSON.parse(rolesGuardados) as string[];
      return roles.includes(rol);
    } catch (error) {
      console.error('Error al leer roles del localStorage', error);
      return false;
    }
  }
  esSeleccionPura(): boolean {
    return this.tieneRol('USER') && !this.tieneRol('ARMO');
  }

  esArmonizacion(): boolean {
    return this.tieneRol('ARMO');
  }

  textoBotonSeleccion(): string {
    return this.existeComentarioSeleccion
      ? 'Actualizar comentario'
      : 'Guardar comentario';
  }

  textoBotonArmonizacion(): string {
    return this.existeComentarioArmonizacion
      ? 'Actualizar comentario'
      : 'Guardar comentario';
  }

  obtenerComentarioSeleccion() {
    const acronimo = this.procesoSeleccionado()?.acronimo;
    if (!acronimo) return;

    this._procesoService.getComentarioSeleccionPorAcronimo(acronimo).subscribe({
      next: (resp) => {
        this.comentarioSeleccion = resp?.comentarioS ?? '';
        this.existeComentarioSeleccion = !!(resp?.comentarioS ?? '').trim();
      },
      error: (err) => {
        console.error('No se pudo cargar comentario de selección', err);
        this.comentarioSeleccion = '';
        this.existeComentarioSeleccion = false;
      },
    });
  }

  obtenerComentarioArmonizacion() {
    const acronimo = this.procesoSeleccionado()?.acronimo;
    if (!acronimo) return;

    this._procesoService
      .getComentarioArmonizacionPorAcronimo(acronimo)
      .subscribe({
        next: (resp) => {
          this.comentarioArmonizacion = resp?.comentarioS ?? '';
          this.existeComentarioArmonizacion = !!(
            resp?.comentarioS ?? ''
          ).trim();
        },
        error: (err) => {
          console.error('No se pudo cargar comentario de armonización', err);
          this.comentarioArmonizacion = '';
          this.existeComentarioArmonizacion = false;
        },
      });
  }

  cargarComentarioSegunRol() {
    if (this.esArmonizacion()) {
      this.obtenerComentarioArmonizacion();
      return;
    }

    if (this.esSeleccionPura()) {
      this.obtenerComentarioSeleccion();
      return;
    }

    console.warn('El usuario no tiene rol válido para comentarios');
  }
  guardarComentarioSeleccion() {
    const acronimo = this.procesoSeleccionado()?.acronimo;

    if (!acronimo) {
      this.modalNingunProceso();
      return;
    }

    const payload = {
      acronimo,
      comentarioS: this.comentarioSeleccion,
    };

    this._procesoService
      .guardarOActualizarComentarioSeleccion(payload)
      .subscribe({
        next: () => {
          this.existeComentarioSeleccion = !!this.comentarioSeleccion.trim();
          this.showmodalActualizacionExitosa();
        },
        error: (err) => {
          console.error('Error al guardar comentario de selección', err);
          this.cloceModalActualizar();
        },
      });
  }

  guardarComentarioArmonizacion() {
    const acronimo = this.procesoSeleccionado()?.acronimo;

    if (!acronimo) {
      this.modalNingunProceso();
      return;
    }

    const payload = {
      acronimo,
      comentarioS: this.comentarioArmonizacion,
    };

    this._procesoService
      .guardarOActualizarComentarioArmonizacion(payload)
      .subscribe({
        next: () => {
          this.existeComentarioArmonizacion =
            !!this.comentarioArmonizacion.trim();
          this.showmodalActualizacionExitosa();
        },
        error: (err) => {
          console.error('Error al guardar comentario de armonización', err);
          this.cloceModalActualizar();
        },
      });
  }

  showAlertUpComentarioSeleccion() {
    const id = this.procesoSeleccionado()?.acronimo;
    this.idProsesoSelect = id;

    if (!id) {
      this.modalNingunProceso();
      return;
    }

    this.tipoComentarioPendiente = 'seleccion';
    this.showModalActualizar();
  }
  showAlertUpComentarioArmonizacion() {
    const id = this.procesoSeleccionado()?.acronimo;
    this.idProsesoSelect = id;

    if (!id) {
      this.modalNingunProceso();
      return;
    }

    this.tipoComentarioPendiente = 'armonizacion';
    this.showModalActualizar();
  }
  confirmarActualizacionComentario() {
    if (this.tipoComentarioPendiente === 'seleccion') {
      this.guardarComentarioSeleccion();
      return;
    }

    if (this.tipoComentarioPendiente === 'armonizacion') {
      this.guardarComentarioArmonizacion();
      return;
    }

    this.cloceModalActualizar();
  }
}
