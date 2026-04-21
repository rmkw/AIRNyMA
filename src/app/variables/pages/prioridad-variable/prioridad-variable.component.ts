import { authService } from "@/auth/services/auth.service";
import { FuenteIdentificacionService } from "@/fuenteIdentificacion/services/fuente-identificacion.service";
import { interface_ProcesoP } from "@/procesoProduccion/interfaces/procesos.interface";
import { DireccionesService } from "@/procesoProduccion/services/direcciones.service";
import { ppEcoService } from "@/procesoProduccion/services/proceso-produccion.service";
import { Direccion } from "@/variables/interfaces/direcciones.interface";
import { VariableService } from "@/variables/services/variables.service";
import { CommonModule } from "@angular/common";
import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { VariableRevisionPrioridadDTO } from '@/variables/interfaces/variableRevisionPrioridad.interface';

@Component({
  selector: 'app-prioridad-variable',
  imports: [FormsModule, CommonModule],
  templateUrl: './prioridad-variable.component.html',
})
export class PrioridadVariableComponent implements OnInit {
  _serviceDirecciones = inject(DireccionesService);
  arrDirecciones: Direccion[] = [];
  direccionName: string | number | undefined = undefined;
  _procesos_isSelectEnabled: boolean = false;

  arrProcesosPBydire: interface_ProcesoP[] = [];
  _pp_Service = inject(ppEcoService);
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

  procesoSeleccionado = signal<interface_ProcesoP | null>(null);
  comentario = '';
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

  _fuentesService = inject(FuenteIdentificacionService);
  arrFuentesByProceso: any[] = [];
  _fuentes_isSelectEnabled: boolean = false;

  // cargarFuentesPorProceso(acronimo: string) {
  //   const responsableRegister = 1; // aquí luego pones el real del usuario logueado

  //   if (!responsableRegister || !acronimo) {
  //     console.error('Responsable o acrónimo de proceso no definidos');
  //     this.arrFuentesByProceso = [];
  //     this._fuentes_isSelectEnabled = false;
  //     return;
  //   }

  //   this._fuentesService
  //     .getByIdPpAndResponsable(acronimo, responsableRegister)
  //     .subscribe({
  //       next: (response) => {
  //         console.log('✅ Resultado del backend:', response);

  //         this.arrFuentesByProceso = response?.fuentes ?? [];
  //         this._fuentes_isSelectEnabled = this.arrFuentesByProceso.length > 0;
  //       },
  //       error: (err) => {
  //         console.error('Error al obtener fuentes:', err);
  //         this.arrFuentesByProceso = [];
  //         this._fuentes_isSelectEnabled = false;
  //       },
  //     });
  // }

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

    this._fuentesService.getByAcronimo(acronimo).subscribe({
      next: (response) => {
        this.arrFuentesByProceso = response ?? [];
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
  fuentesSeleccionadas: string[] = [];

  _varService = inject(VariableService);

  cargarVariablesSeleccionadas() {
    if (this.fuentesSeleccionadas.length === 0) {
      console.warn('No hay fuentes seleccionadas');
      return;
    }

    this.loadingVariables = true;
    this.arrVariablesSeleccionadas = [];
    this.arrVariablesSeleccionadasFiltradas = [];

    this._varService
      .getVariablesByFuentes(this.fuentesSeleccionadas)
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

  arrVariablesSeleccionadas: VariableRevisionPrioridadDTO[] = [];

  _authService = inject(authService);

  usuarioId = computed(() => this._authService.user()?.id ?? null);

  // asignarPrioridad(variable: VariableRevisionPrioridadDTO, prioridad: number) {
  //   variable.prioridad = prioridad;
  //   variable.revisada = true;
  // }

  asignarPrioridad(variable: VariableRevisionPrioridadDTO, prioridad: number) {
    const responsableRevision = Number(localStorage.getItem('_id'));

    variable.prioridad = prioridad;
    variable.revisada = true;
    variable.responsableRevision = responsableRevision;

    this._varService
      .updateRevisionPrioridad(variable.idA, {
        prioridad,
        revisada: true,
        responsableRevision,
      })
      .subscribe({
        next: (resp) => {
          console.log('Revisión guardada:', resp);
        },
        error: (err) => {
          console.error('Error al guardar revisión:', err);
        },
      });
  }

  arrVariablesSeleccionadasFiltradas: VariableRevisionPrioridadDTO[] = [];
  filtroIdS: string = '';

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

  loadingFuentes: boolean = false;
  loadingVariables: boolean = false;
  togglePrioridad(variable: VariableRevisionPrioridadDTO, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    const prioridad = checked ? 1 : 2;
    this.asignarPrioridad(variable, prioridad);
  }

  asignarPrioridadMasiva(prioridad: number) {
    const responsableRevision = Number(localStorage.getItem('_id'));

    const variablesActualizar = this.arrVariablesSeleccionadasFiltradas.filter(
      (variable) => variable.prioridad !== prioridad,
    );

    if (variablesActualizar.length === 0) {
      return;
    }

    const idsA = variablesActualizar.map((variable) => variable.idA);

    this._varService
      .updateRevisionPrioridadMasiva({
        idsA,
        prioridad,
        revisada: true,
        responsableRevision,
      })
      .subscribe({
        next: (resp) => {
          variablesActualizar.forEach((variable) => {
            variable.prioridad = prioridad;
            variable.revisada = true;
            variable.responsableRevision = responsableRevision;
          });

          console.log('Actualización masiva correcta:', resp);
        },
        error: (err) => {
          console.error('Error en actualización masiva:', err);
        },
      });
  }
}
