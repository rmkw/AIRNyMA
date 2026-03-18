import { authService } from '@/auth/services/auth.service';
import { FuenteIdentificacionService } from '@/fuenteIdentificacion/services/fuente-identificacion.service';
import { interface_ProcesoP } from '@/procesoProduccion/interfaces/procesos.interface';
import { DireccionesService } from '@/procesoProduccion/services/direcciones.service';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { Direccion } from '@/variables/interfaces/direcciones.interface';
import { VariableTablaDTO } from '@/variables/interfaces/variableTablaDTO';
import { VariableService } from '@/variables/services/variables.service';
import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-armonizacion-variables',
  templateUrl: './armo-variables.component.html',
  imports: [CommonModule, FormsModule],
})
export class ArmonizacionVariablesComponent implements OnInit {
  _serviceDirecciones = inject(DireccionesService);
  _pp_Service = inject(ppEcoService);
  _varService = inject(VariableService);
  _fuentesService = inject(FuenteIdentificacionService);
  _authService = inject(authService);

  arrDirecciones: Direccion[] = [];
  arrProcesosPBydire: interface_ProcesoP[] = [];
  arrFuentesByProceso: any[] = [];
  fuentesSeleccionadas: string[] = [];
  arrVariablesSeleccionadas: VariableTablaDTO[] = [];
  arrVariablesSeleccionadasFiltradas: VariableTablaDTO[] = [];

  direccionName: string | number | undefined = undefined;

  @ViewChild('procesoProduccionTag')
  procesoProduccionTag!: ElementRef<HTMLSelectElement>;
  procesoSeleccionado = signal<interface_ProcesoP | null>(null);

  comentario = '';
  filtroIdS: string = '';

  _fuentes_isSelectEnabled: boolean = false;
  _procesos_isSelectEnabled: boolean = false;
  loadingFuentes: boolean = false;
  loadingVariables: boolean = false;

  usuarioId = computed(() => this._authService.user()?.id ?? null);

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
    this.procesoSeleccionado.set(null);
    this.comentario = '';
    this.arrProcesosPBydire = [];

    const selectedOption = this.procesoProduccionTag
      .nativeElement as HTMLSelectElement;
    selectedOption.selectedIndex = 0;

    this._procesos_isSelectEnabled = true;

    console.log(nameDi);
    this.cargarProcesosProduccionByDireccionGeneral(nameDi);
  }

  cargarProcesosProduccionByDireccionGeneral(
    dire: string | number | undefined,
  ) {
    this._pp_Service.getPorDireccionGeneral(dire).subscribe({
      next: (data) => {
        this.arrProcesosPBydire = data;
        console.log(data);
      },
      error: (err) => {
        console.error('Error al obtener procesos por DG', err);
      },
    });
  }

  seleccionarProceso(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const proceso = selectElement.value;

    const procesoEncontrado =
      this.arrProcesosPBydire.find(
        (procesoItem) => procesoItem.acronimo === proceso,
      ) || null;

    this.procesoSeleccionado.set(procesoEncontrado);

    this.comentario = procesoEncontrado
      ? procesoEncontrado.comentarioS || ''
      : '';

    this.arrFuentesByProceso = [];
    this.arrVariablesSeleccionadas = [];
    this.arrVariablesSeleccionadasFiltradas = [];
    this.fuentesSeleccionadas = [];

    this._fuentes_isSelectEnabled = false;

    if (procesoEncontrado) {
      this.cargarFuentesPorProceso(procesoEncontrado.acronimo);
    }
  }

  cargarFuentesPorProceso(acronimo: string) {
    if (!acronimo) {
      console.error('Acrónimo de proceso no definido');
      this.arrFuentesByProceso = [];
      this._fuentes_isSelectEnabled = false;
      return;
    }

    this.loadingFuentes = true;
    this.arrFuentesByProceso = [];
    this.fuentesSeleccionadas = [];
    this.arrVariablesSeleccionadas = [];
    this.arrVariablesSeleccionadasFiltradas = [];
    this.filtroIdS = '';

    this._fuentesService.getByProceso(acronimo).subscribe({
      next: (response) => {
        this.arrFuentesByProceso = response?.fuentes ?? [];
        this._fuentes_isSelectEnabled = this.arrFuentesByProceso.length > 0;
        this.loadingFuentes = false;
      },
      error: (err) => {
        console.error('Error al obtener fuentes:', err);
        this.arrFuentesByProceso = [];
        this._fuentes_isSelectEnabled = false;
        this.loadingFuentes = false;
      },
    });
  }

  toggleFuenteSelection(event: Event, idFuente: string) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      if (!this.fuentesSeleccionadas.includes(idFuente)) {
        this.fuentesSeleccionadas.push(idFuente);
      }
    } else {
      this.fuentesSeleccionadas = this.fuentesSeleccionadas.filter(
        (id) => id !== idFuente,
      );
    }

    console.log('Fuentes seleccionadas:', this.fuentesSeleccionadas);
  }

  cargarVariablesSeleccionadas() {
    if (this.fuentesSeleccionadas.length === 0) {
      console.warn('No hay fuentes seleccionadas');
      return;
    }

    this.loadingVariables = true;
    this.arrVariablesSeleccionadas = [];
    this.arrVariablesSeleccionadasFiltradas = [];

    this._varService
      .getVariablesTablaByFuentes(this.fuentesSeleccionadas)
      .subscribe({
        next: (data) => {
          this.arrVariablesSeleccionadas = data;
          this.arrVariablesSeleccionadasFiltradas = data;
          this.filtroIdS = '';
          this.loadingVariables = false;
          console.log(data);
        },
        error: (err) => {
          console.error('Error al cargar variables:', err);
          this.arrVariablesSeleccionadas = [];
          this.arrVariablesSeleccionadasFiltradas = [];
          this.loadingVariables = false;
        },
      });
  }

  limpiarSeleccionFuentes() {
    this.fuentesSeleccionadas = [];
    this.arrVariablesSeleccionadas = [];
    this.arrVariablesSeleccionadasFiltradas = [];
    this.filtroIdS = '';
    console.log('Selección limpiada');
  }

  filtrarVariablesPorIdS() {
    const texto = this.filtroIdS.trim().toLowerCase();

    if (!texto) {
      this.arrVariablesSeleccionadasFiltradas = this.arrVariablesSeleccionadas;
      return;
    }

    this.arrVariablesSeleccionadasFiltradas =
      this.arrVariablesSeleccionadas.filter(
        (variable) =>
          variable.idS.toLowerCase().includes(texto) ||
          variable.idA.toLowerCase().includes(texto) ||
          variable.nombre.toLowerCase().includes(texto),
      );
  }

  seleccionarTodasLasFuentes() {
    this.fuentesSeleccionadas = this.arrFuentesByProceso.map(
      (fuente) => fuente.idFuente,
    );

    console.log('Todas las fuentes seleccionadas:', this.fuentesSeleccionadas);
  }
}
