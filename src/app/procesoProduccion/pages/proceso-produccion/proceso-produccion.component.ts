import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { PpEconomicas } from '@/procesoProduccion/interfaces/ppEco-responce.interface';
import { Direccion } from '@/variables/interfaces/direcciones.interface';
import { DireccionesService } from '@/procesoProduccion/services/direcciones.service';
import { interface_ProcesoP } from '@/procesoProduccion/interfaces/procesos.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-proceso-produccion',
  imports: [CommonModule, FormsModule],
  templateUrl: './proceso-produccion.component.html',
})
export class ProcesoProduccionComponent implements OnInit {
  _serviceDirecciones = inject(DireccionesService);
  _pp_Service = inject(ppEcoService);
  _router = inject(Router);

  arrDirecciones: Direccion[] = [];
  arrProcesosPBydire: interface_ProcesoP[] = [];

  procesoSeleccionado = signal<interface_ProcesoP | null>(null);
  comentario = '';

  mostrarAlertaNoProceso = signal(false);
  mostrarAlerta = signal(false);

  idProsesoSelect: any = null;

  showWarning: boolean = false;
  mensajeAlerta = '';

  direccionName = '';

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

  @ViewChild('procesoProduccionTag')
  procesoProduccionTag!: ElementRef<HTMLSelectElement>;
  selectedDireccion(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const nameDi = selectElement.value;

    this.direccionName = nameDi;

    const selectedOption = this.procesoProduccionTag
      .nativeElement as HTMLSelectElement;
    selectedOption.selectedIndex = 0;

    this.cargarProcesosProduccionByDireccionGeneral(nameDi);
  }

  cargarProcesosProduccionByDireccionGeneral(dire: string) {
    this._pp_Service.getPorDireccionGeneral(dire).subscribe({
      next: (data) => {
        this.arrProcesosPBydire = data;
      },
      error: (err) => {
        console.error('Error al obtener procesos por DG', err);
      },
    });
  }

  seleccionarProceso(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const procesoId = Number(selectElement.value);

    const procesoEncontrado =
      this.arrProcesosPBydire.find((proceso) => proceso.id === procesoId) ||
      null;

    this.procesoSeleccionado.set(procesoEncontrado);

    this.comentario = procesoEncontrado
      ? procesoEncontrado.comentarioPp || ''
      : '';
  }

  showAlertUpComentario() {
    const id = this.procesoSeleccionado()?.id;
    this.idProsesoSelect = id;

    if (!id) {
      this.modalNingunProceso();
      return;
    }

    this.showWarning = true;
  }

  cancelDeactivation() {
    this.showWarning = false;
  }

  confirmDeactivation() {
    const proceso = this.procesoSeleccionado();

    if (!proceso || !proceso.id) {
      console.warn('No hay un proceso seleccionado para actualizar');
      return;
    }

    this._pp_Service
      .actualizarComentario(proceso.id, this.comentario)
      .subscribe({
        next: (res) => {
          this.cargarProcesosProduccionByDireccionGeneral(this.direccionName);

          console.log('Comentario actualizado con éxito:', res);
          this.mostrarAlerta.set(true);
          this.mensajeAlerta =
            res.message || 'Proceso actualizado correctamente.';
          setTimeout(() => this.mostrarAlerta.set(false), 3000);
          this.showWarning = false;
          // Aquí puedes mostrar un toast o snackbar
        },
        error: (err) => {
          console.error('Error al actualizar comentario:', err);
          // Mostrar error al usuario
        },
      });
  }

  setLocalStorage(_Pp: interface_ProcesoP) {
    if (!this.procesoSeleccionado()) {
      this.modalNingunProceso();
      return;
    }
    console.log(_Pp);
    const procesoEditable = {
      nombrePp: _Pp.nombreProceso,
      acronimo: _Pp.acronimo,
    };
    localStorage.setItem('procesoEditable', JSON.stringify(procesoEditable));
    this._router.navigate(['/fuentes']);
  }

  @ViewChild('modalNoProceso') modalNoProceso!: ElementRef<HTMLDialogElement>;

  modalNingunProceso() {
    this.modalNoProceso.nativeElement.showModal();
  }
  cerrarModal() {
    this.modalNoProceso.nativeElement.close();

  }

}
