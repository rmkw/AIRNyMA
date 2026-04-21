import { FiEcoResponce } from "@/fuenteIdentificacion/interfaces/fiEco-responce.interface";
import { FuenteIdentificacionService } from "@/fuenteIdentificacion/services/fuente-identificacion.service";
import { interface_ProcesoP } from "@/procesoProduccion/interfaces/procesos.interface";
import { DireccionesService } from "@/procesoProduccion/services/direcciones.service";
import { ppEcoService } from "@/procesoProduccion/services/proceso-produccion.service";
import { Direccion } from "@/variables/interfaces/direcciones.interface";
import { VariableService } from "@/variables/services/variables.service";
import { CommonModule } from "@angular/common";
import { Component, ElementRef, inject, OnInit, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-seleccion-variables',
  imports: [CommonModule, FormsModule],
  templateUrl: './seleccion-variables.component.html',
})
export class SeleccionVariablesComponent implements OnInit {
  _serviceDirecciones = inject(DireccionesService);
  _procesoService = inject(ppEcoService);
  _fuentesService = inject(FuenteIdentificacionService);
  _varService = inject(VariableService);

  arrDirecciones: Direccion[] = [];
  arrProcesosByDir: interface_ProcesoP[] = [];
  arrFuentesByProceso: FiEcoResponce[] = [];

  direccionSeleccionada = '';
  procesoSeleccionadoValue = '';
  fuenteSeleccionadaValue = '';

  direccionName: string | number | undefined = undefined;
  _procesos_isSelectEnabled = false;
  _fuentes_isSelectEnabled = false;

  variables: any[] = [];
  loadingVariables = false;

  // contexto actual
  idFuenteActual = '';
  acronimoActual = '';
  edicionFuenteActual = '';

  // formulario variable
  idS = '';
  nombre = '';
  definicion = '';
  url = '';
  comentarioS = '-';

  // modo edición
  variableEditando: any = null;

  @ViewChild('procesoProduccionTag')
  procesoProduccionTag!: ElementRef<HTMLSelectElement>;

  ngOnInit(): void {
    this.getDirecciones();
  }

  // ========= CARGA DE CONTEXTO =========

  getDirecciones() {
    this._serviceDirecciones.getDirecciones().subscribe({
      next: (data) => {
        this.arrDirecciones = data;
        this.intentarPrecargarDesdeLocalStorage();
      },
      error: (err) => {
        console.error('error al cargar direcciones', err);
      },
    });
  }

  intentarPrecargarDesdeLocalStorage() {
    const data = localStorage.getItem('fuenteEditable');
    if (!data) return;

    try {
      const fuenteGuardada = JSON.parse(data);

      if (
        !fuenteGuardada?.direccion ||
        !fuenteGuardada?.acronimo ||
        !fuenteGuardada?.idFuente
      ) {
        localStorage.removeItem('fuenteEditable');
        return;
      }

      this.direccionSeleccionada = fuenteGuardada.direccion;
      this.direccionName = fuenteGuardada.direccion;
      this._procesos_isSelectEnabled = true;

      this._procesoService
        .getPorDireccionGeneral(fuenteGuardada.direccion)
        .subscribe({
          next: (procesos) => {
            this.arrProcesosByDir = procesos;
            this.procesoSeleccionadoValue = fuenteGuardada.acronimo;

            this._fuentesService
              .getByAcronimo(fuenteGuardada.acronimo)
              .subscribe({
                next: (fuentes) => {
                  this.arrFuentesByProceso = fuentes ?? [];
                  this._fuentes_isSelectEnabled =
                    this.arrFuentesByProceso.length > 0;
                  this.fuenteSeleccionadaValue = fuenteGuardada.idFuente;

                  const fuenteActual = this.arrFuentesByProceso.find(
                    (f) => f.idFuente === fuenteGuardada.idFuente,
                  );

                  if (fuenteActual) {
                    this.setContextoFuente(fuenteActual);
                  }

                  this.cargarVariablesPorFuente(fuenteGuardada.idFuente);
                },
                error: (err) => {
                  console.error('Error al precargar fuentes:', err);
                  this.arrFuentesByProceso = [];
                  this._fuentes_isSelectEnabled = false;
                },
              });
          },
          error: (err) => {
            console.error('Error al precargar procesos:', err);
            localStorage.removeItem('fuenteEditable');
          },
        });
    } catch (error) {
      console.error('Error al leer fuenteEditable del localStorage', error);
      localStorage.removeItem('fuenteEditable');
    }
  }

  selectedDireccion(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const nameDi = selectElement.value;

    this.direccionName = nameDi;
    this.direccionSeleccionada = nameDi;

    this._procesos_isSelectEnabled = true;
    this._fuentes_isSelectEnabled = false;

    this.procesoSeleccionadoValue = '';
    this.fuenteSeleccionadaValue = '';

    this.arrProcesosByDir = [];
    this.arrFuentesByProceso = [];
    this.variables = [];

    this.resetFormularioVariable();
    localStorage.removeItem('fuenteEditable');

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

    this.procesoSeleccionadoValue = proceso;
    this.fuenteSeleccionadaValue = '';

    this.arrFuentesByProceso = [];
    this.variables = [];
    this._fuentes_isSelectEnabled = false;

    this.idFuenteActual = '';
    this.acronimoActual = proceso;
    this.edicionFuenteActual = '';

    this.resetFormularioVariable();
    localStorage.removeItem('fuenteEditable');

    if (proceso) {
      this.cargarFuentesPorProceso(proceso);
    }
  }

  cargarFuentesPorProceso(acronimo: string) {
    if (!acronimo) {
      this.arrFuentesByProceso = [];
      this._fuentes_isSelectEnabled = false;
      return;
    }

    this._fuentesService.getByAcronimo(acronimo).subscribe({
      next: (response) => {
        this.arrFuentesByProceso = response ?? [];
        this._fuentes_isSelectEnabled = this.arrFuentesByProceso.length > 0;
      },
      error: (err) => {
        console.error('Error al obtener fuentes:', err);
        this.arrFuentesByProceso = [];
        this._fuentes_isSelectEnabled = false;
      },
    });
  }

  seleccionarFuente(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const idFuente = selectElement.value;

    this.fuenteSeleccionadaValue = idFuente;
    this.variables = [];

    const fuenteActual = this.arrFuentesByProceso.find(
      (f) => f.idFuente === idFuente,
    );

    if (fuenteActual) {
      this.setContextoFuente(fuenteActual);
    }

    this.resetFormularioVariable();
    localStorage.removeItem('fuenteEditable');

    if (idFuente) {
      this.cargarVariablesPorFuente(idFuente);
    }
  }

  setContextoFuente(fuente: FiEcoResponce) {
    this.idFuenteActual = fuente.idFuente;
    this.acronimoActual = fuente.acronimo;
    this.edicionFuenteActual = fuente.edicion?.toString() ?? '';
  }

  cargarVariablesPorFuente(idFuente: string) {
    if (!idFuente) {
      this.variables = [];
      return;
    }

    this.loadingVariables = true;
    this.variables = [];

    this._varService.getVarsByFuente(idFuente).subscribe({
      next: (data) => {
        this.variables = data ?? [];
        this.loadingVariables = false;
      },
      error: (err) => {
        console.error('Error al obtener variables por fuente:', err);
        this.variables = [];
        this.loadingVariables = false;
      },
    });
  }

  // ========= FORM VARIABLE =========

  get idAGenerado(): string {
    const idSLimpio = this.idS?.trim() ?? '';
    const edicionLimpia = this.edicionFuenteActual?.trim() ?? '';

    if (!idSLimpio || !edicionLimpia) return '';
    return `${idSLimpio}-${edicionLimpia}`;
  }

  obtenerUsuarioId(): number | null {
    const idDirecto = localStorage.getItem('_id');
    if (idDirecto) {
      const parsed = Number(idDirecto);
      return Number.isNaN(parsed) ? null : parsed;
    }

    const userResponse = localStorage.getItem('useResponce');
    if (userResponse) {
      try {
        const user = JSON.parse(userResponse);
        const parsed = Number(user?.id);
        return Number.isNaN(parsed) ? null : parsed;
      } catch (error) {
        console.error('Error al leer useResponce del localStorage', error);
      }
    }

    return null;
  }

  formularioVariableValido(): boolean {
    return !!(
      this.idS?.trim() &&
      this.nombre?.trim() &&
      this.definicion?.trim() &&
      this.url?.trim()
    );
  }

  guardarVariable() {
    const userId = this.obtenerUsuarioId();

    if (
      !this.idFuenteActual ||
      !this.acronimoActual ||
      !this.edicionFuenteActual
    ) {
      console.error('No hay contexto suficiente de la fuente');
      return;
    }

    if (!this.formularioVariableValido()) {
      console.error('Faltan campos obligatorios de la variable');
      return;
    }

    if (!userId) {
      console.error('No se pudo obtener el id del usuario logueado');
      return;
    }

    const payload = {
      idA: this.idAGenerado,
      idS: this.idS.trim(),
      idFuente: this.idFuenteActual,
      acronimo: this.acronimoActual,
      nombre: this.nombre.trim(),
      definicion: this.definicion.trim(),
      url: this.url.trim(),
      comentarioS: this.comentarioS?.trim() || '-',
      mdea: false,
      ods: false,
      responsableRegister: this.variableEditando?.responsableRegister ?? userId,
      responsableActualizacion: this.variableEditando ? userId : undefined,
      prioridad: 1,
      revisada: false,
      fechaRevision: undefined,
      responsableRevision: undefined,
    };

    if (this.variableEditando?.idA) {
      this._varService
        .editarVariable(this.variableEditando.idA, payload)
        .subscribe({
          next: () => {
            this.resetFormularioVariable();
            this.cargarVariablesPorFuente(this.idFuenteActual);
          },
          error: (err) => {
            console.error('Error al actualizar variable:', err);
          },
        });
      return;
    }

    this._varService.crearVar(payload).subscribe({
      next: () => {
        this.resetFormularioVariable();
        this.cargarVariablesPorFuente(this.idFuenteActual);
      },
      error: (err) => {
        console.error('Error al registrar variable:', err);
      },
    });
  }

  editarVariable(item: any) {
    this.variableEditando = item;
    this.idS = item.idS ?? '';
    this.nombre = item.nombre ?? '';
    this.definicion = item.definicion ?? '';
    this.url = item.url ?? '';
    this.comentarioS = item.comentarioS ?? '-';
  }

  eliminarVariable(idA: string) {
    this._varService.deleteVariableFull(idA).subscribe({
      next: () => {
        if (this.variableEditando?.idA === idA) {
          this.resetFormularioVariable();
        }
        this.cargarVariablesPorFuente(this.idFuenteActual);
      },
      error: (err) => {
        console.error('Error al eliminar variable:', err);
      },
    });
  }

  resetFormularioVariable() {
    this.idS = '';
    this.nombre = '';
    this.definicion = '';
    this.url = '';
    this.comentarioS = '-';
    this.variableEditando = null;
  }
  consultarPorIdS() {
    if (!this.idS?.trim()) {
      console.warn('No hay ID_S para consultar');
      return;
    }

    console.log('Consultando variables similares con ID_S:', this.idS);

    // aquí luego conectamos backend:
    // this._varService.getByIdS(this.idS).subscribe(...)
  }
}
