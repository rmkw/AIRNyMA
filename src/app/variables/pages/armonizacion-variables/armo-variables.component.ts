/**
 * @author Luis Gerardo Castañeda López
 * @organization INEGI
 * @project SIIRNMA
 * @since 2026-04-07
 * @description Lógica principal de variables
 */
import { authService } from '@/auth/services/auth.service';
import { FuenteIdentificacionService } from '@/fuenteIdentificacion/services/fuente-identificacion.service';
import { interface_ProcesoP } from '@/procesoProduccion/interfaces/procesos.interface';
import { DireccionesService } from '@/procesoProduccion/services/direcciones.service';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { ClasificacionesVariableComponent, ClasificacionVariableForm, MINIMO_CLASIFICACIONES } from '@/variables/components/clasificaciones-variable/clasificaciones-variable.component';
import { DatosAbiertosVariableComponent, DatosAbiertosVariableForm } from '@/variables/components/datos-abiertos-variable/datos-abiertos-variable.component';
import { MicrodatosVariableComponent, MicrodatosVariableForm } from '@/variables/components/microdatos-variable/microdatos-variable.component';
import { ClasificacionArmo } from '@/variables/interfaces/armonizacion/clasificaciones-armo.interface';
import { DatoAbiertoArmo } from '@/variables/interfaces/armonizacion/datos-abiertos-armo.interface';
import { MicrodatoArmo } from '@/variables/interfaces/armonizacion/microdatos-armo.interface';
import { TemaSubtemaDTO } from '@/variables/interfaces/armonizacion/tema_subtema/temasubtema.interface';
import { Direccion } from '@/variables/interfaces/direcciones.interface';
import { FuenteSaveDTO } from '@/variables/interfaces/fuenteArmonizacion.interface';
import { TematicaDTO } from '@/variables/interfaces/tematicas_temas/tematicaDTO.interface';
import { VariableTablaDTO } from '@/variables/interfaces/variableTablaDTO';
import { ClasificacionesArmoService } from '@/variables/services/armonizacion/clasificaciones-armo.service';
import { DatosAbiertosArmoService } from '@/variables/services/armonizacion/datos-abiertos-armo.service';
import { MicrodatosArmoService } from '@/variables/services/armonizacion/microdatos-armo.service';
import { VariablesArmoService } from '@/variables/services/armonizacion/variables-armo.service';
import { TemasSubtemasService } from '@/variables/services/tema_subtema/TemasSubtemasService.service';
import { TematicasService } from '@/variables/services/tematicas_temas/tematicas_temas.service';
import { VariableService } from '@/variables/services/variables.service';
import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-armonizacion-variables',
  standalone: true,
  templateUrl: './armo-variables.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClasificacionesVariableComponent,
    DatosAbiertosVariableComponent,
    MicrodatosVariableComponent,
  ],
})
export class ArmonizacionVariablesComponent implements OnInit {
  _serviceDirecciones = inject(DireccionesService);
  _pp_Service = inject(ppEcoService);
  _varService = inject(VariableService);
  _fuentesService = inject(FuenteIdentificacionService);
  _authService = inject(authService);
  private clasificacionesArmoService = inject(ClasificacionesArmoService);
  private microdatosArmoService = inject(MicrodatosArmoService);
  private datosAbiertosArmoService = inject(DatosAbiertosArmoService);

  arrDirecciones: Direccion[] = [];
  arrProcesosPBydire: interface_ProcesoP[] = [];
  arrFuentesByProceso: any[] = [];
  fuentesSeleccionadas: string[] = [];
  arrVariablesSeleccionadas: VariableTablaDTO[] = [];
  arrVariablesSeleccionadasFiltradas: VariableTablaDTO[] = [];
  variablesArmonizadasIds = new Set<string>();

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

  variableForm!: FormGroup;

  ngOnInit(): void {
    this.getDirecciones();
    this.inicializarFormularioVariable();
    this.cargarTemasCatalogo();
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
          this.cargarEstatusVariablesArmonizadas(data);
          this.filtroIdS = '';
          this.loadingVariables = false;
          console.log(data);
        },
        error: (err) => {
          console.error('Error al cargar variables:', err);
          this.arrVariablesSeleccionadas = [];
          this.arrVariablesSeleccionadasFiltradas = [];
          this.variablesArmonizadasIds.clear();
          this.loadingVariables = false;
        },
      });
  }

  limpiarSeleccionFuentes() {
    this.fuentesSeleccionadas = [];
    this.arrVariablesSeleccionadas = [];
    this.arrVariablesSeleccionadasFiltradas = [];
    this.variablesArmonizadasIds.clear();
    this.filtroIdS = '';
    console.log('Selección limpiada');
  }

  cargarEstatusVariablesArmonizadas(variables: VariableTablaDTO[]) {
    this.variablesArmonizadasIds.clear();

    const fuentes = Array.from(
      new Set(
        variables
          .map((variable) => variable.idFuente)
          .filter((idFuente): idFuente is string => !!idFuente),
      ),
    );

    fuentes.forEach((idFuente) => {
      this.variablesArmoService.obtenerPorIdFuente(idFuente).subscribe({
        next: (variablesArmo) => {
          variablesArmo.forEach((variable) => {
            this.variablesArmonizadasIds.add(variable.idA);
          });
        },
        error: (err) => {
          console.error('Error al cargar estatus de variables:', err);
        },
      });
    });
  }

  variableEstaArmonizada(idA: string): boolean {
    return this.variablesArmonizadasIds.has(idA);
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

  variableSeleccionada: VariableTablaDTO | null = null;

  fuenteForm: {
    idFuente?: string;
    acronimo: string;
    fuente: string;
    url: string;
    edicion: string;
    comentarioS: string;
    comentarioA: string;
    idFuenteSeleccion?: string;
  } | null = null;

  seleccionarVariable(variable: VariableTablaDTO) {
    this.variableSeleccionada = variable;
    this.fuenteExisteEnArmonizacion = false;
    this.limpiarEstadoVariableSeleccionada();
    this.limpiarClasificacionLocal();
    this.limpiarMicrodatosLocal();
    this.limpiarDatosAbiertosLocal();

    const fuenteEncontrada = this.arrFuentesByProceso.find(
      (fuente) => fuente.idFuente === variable.idFuente,
    );

    if (!fuenteEncontrada) {
      console.warn('No se encontró la fuente de la variable seleccionada');
      this.fuenteForm = null;
      return;
    }

    const acronimoProceso =
      variable.acronimo || fuenteEncontrada.acronimo || '';
    this.cargarTematicasPorProceso(acronimoProceso);

    const fuenteForm = {
      idFuente: fuenteEncontrada.idFuente ?? '',
      acronimo: fuenteEncontrada.acronimo ?? '',
      fuente: fuenteEncontrada.fuente ?? '',
      url: fuenteEncontrada.url ?? '',
      edicion: fuenteEncontrada.edicion ?? '',
      comentarioS: fuenteEncontrada.comentarioS ?? '',
      comentarioA: '',
    };

    this.fuenteForm = fuenteForm;

    console.log('Variable seleccionada:', this.variableSeleccionada);
    console.log('Fuente cargada en formulario:', this.fuenteForm);

    this.verificarSiFuenteExisteEnArmonizacionPorIdFuenteSeleccion(
      variable.idFuente,
    );
  }

  verificarSiFuenteExisteEnArmonizacionPorIdFuenteSeleccion(
    idFuenteSeleccion: string,
  ) {
    this.cargandoEstadoFuente = true;

    this._varService.getFuenteArmonizacionByIdFuenteSeleccion(idFuenteSeleccion).subscribe({
      next: (fuenteArm) => {
        if (!this.fuenteForm) return;

        this.fuenteExisteEnArmonizacion = true;
        this.cargandoEstadoFuente = false;

        this.fuenteForm = {
          ...this.fuenteForm,
          idFuente: fuenteArm.idFuente ?? this.fuenteForm.idFuente,
          idFuenteSeleccion: fuenteArm.idFuenteSeleccion ?? idFuenteSeleccion,
          acronimo: fuenteArm.acronimo ?? '',
          fuente: fuenteArm.fuente ?? '',
          url: fuenteArm.url ?? '',
          edicion: fuenteArm.edicion ?? '',
          comentarioS: fuenteArm.comentarioS ?? '',
          comentarioA: fuenteArm.comentarioA ?? '',
        };

        if (this.variableSeleccionada?.idA) {
          this.verificarSiVariableExiste(this.variableSeleccionada.idA);
        }
      },
      error: (err) => {
        console.error('Error al verificar fuente en armonización:', err);
        this.fuenteExisteEnArmonizacion = false;
        this.cargandoEstadoFuente = false;

        if (err.status && err.status !== 404) {
          this.abrirModalError(this.obtenerMensajeError(err));
        }
      },
    });
  }

  cargarFuenteArmonizacion(idFuenteSeleccion: string) {
    this._varService
      .getFuenteArmonizacionByIdFuenteSeleccion(idFuenteSeleccion)
      .subscribe({
        next: (fuenteArm) => {
          if (!this.fuenteForm) return;

          this.fuenteForm = {
            ...this.fuenteForm,
            idFuente: fuenteArm.idFuente ?? this.fuenteForm.idFuente,
            idFuenteSeleccion: fuenteArm.idFuenteSeleccion ?? idFuenteSeleccion,
            acronimo: fuenteArm.acronimo ?? '',
            fuente: fuenteArm.fuente ?? '',
            url: fuenteArm.url ?? '',
            edicion: fuenteArm.edicion ?? '',
            comentarioS: fuenteArm.comentarioS ?? '',
            comentarioA: fuenteArm.comentarioA ?? '',
          };
          if (this.variableSeleccionada?.idA) {
            this.verificarSiVariableExiste(this.variableSeleccionada.idA);
          }
        },

        error: (err) => {
          console.error('Error al cargar fuente de armonización:', err);
        },
      });
  }

  guardarFuenteTemporal() {
    if (!this.fuenteForm) {
      console.warn('No hay fuente cargada para guardar');
      return;
    }

    const payload: FuenteSaveDTO = {
      idFuenteSeleccion:
        this.fuenteForm.idFuenteSeleccion ||
        this.variableSeleccionada?.idFuente ||
        '',
      acronimo: this.fuenteForm.acronimo?.trim() || '',
      fuente: this.fuenteForm.fuente?.trim() || '',
      url: this.fuenteForm.url?.trim() || null,
      edicion: this.fuenteForm.edicion?.trim() || null,
      comentarioS: this.fuenteForm.comentarioS?.trim() || null,
      comentarioA: this.fuenteForm.comentarioA?.trim() || null,
    };

    if (!this.fuenteExisteEnArmonizacion) {
      this._varService.createFuenteArmonizacion(payload).subscribe({
        next: (resp) => {
          console.log('Fuente guardada en armonización:', resp);
          this.abrirModalSuccessSave(
            'La fuente se guardó correctamente en armonización.',
          );
          this.fuenteExisteEnArmonizacion = true;
          if (this.variableSeleccionada?.idA) {
            this.verificarSiVariableExiste(this.variableSeleccionada.idA);
          }

          this.fuenteForm = {
            idFuente: resp.idFuente ?? this.fuenteForm!.idFuente,
            idFuenteSeleccion:
              resp.idFuenteSeleccion ?? this.fuenteForm!.idFuenteSeleccion,
            acronimo: resp.acronimo ?? this.fuenteForm!.acronimo,
            fuente: resp.fuente ?? this.fuenteForm!.fuente,
            url: resp.url ?? '',
            edicion: resp.edicion ?? '',
            comentarioS: resp.comentarioS ?? '',
            comentarioA: resp.comentarioA ?? '',
          };
        },
        error: (err) => {
          console.error('Error al guardar fuente en armonización:', err);
          this.abrirModalError(this.obtenerMensajeError(err));
        },
      });

      return;
    }

    // Esto solo funcionará cuando ya tengas PUT en backend

    this._varService.updateFuenteArmonizacion(payload).subscribe({
      next: (resp) => {
        console.log('Fuente actualizada en armonización:', resp);
        this.abrirModalSuccessUpdate(
          'La fuente se actualizó correctamente en armonización.',
        );
        this.fuenteExisteEnArmonizacion = true;
        this.verificarSiVariableExiste(this.variableSeleccionada!.idA);

        this.fuenteForm = {
          idFuente: resp.idFuente ?? this.fuenteForm!.idFuente,
          acronimo: resp.acronimo ?? this.fuenteForm!.acronimo,
          fuente: resp.fuente ?? this.fuenteForm!.fuente,
          url: resp.url ?? '',
          edicion: resp.edicion ?? '',
          comentarioS: resp.comentarioS ?? '',
          comentarioA: resp.comentarioA ?? '',
        };
      },
      error: (err) => {
        console.error('Error al guardar fuente en armonización:', err);
        this.abrirModalError(this.obtenerMensajeError(err));
      },
    });
  }

  fuenteExisteEnArmonizacion = false;
  cargandoEstadoFuente = false;

  get puedeMostrarBloqueVariableSeleccion(): boolean {
    return this.fuenteExisteEnArmonizacion;
  }

  puedeGuardarFuente(): boolean {
    return !!(
      this.fuenteForm?.acronimo?.trim() &&
      this.fuenteForm?.fuente?.trim() &&
      this.fuenteForm?.url?.trim() &&
      this.fuenteForm?.edicion?.trim() &&
      this.fuenteForm?.comentarioS?.trim() &&
      this.fuenteForm?.comentarioA?.trim()
    );
  }

  @ViewChild('SuccessSaveModal')
  SuccessSaveModal!: ElementRef<HTMLDialogElement>;
  @ViewChild('SuccessUpdateModal')
  SuccessUpdateModal!: ElementRef<HTMLDialogElement>;
  @ViewChild('ErrorModal') ErrorModal!: ElementRef<HTMLDialogElement>;
  @ViewChild('CamposFaltantesModal')
  CamposFaltantesModal!: ElementRef<HTMLDialogElement>;

  mensajeSuccessSave: string = '';
  mensajeSuccessUpdate: string = '';
  mensajeError: string = '';
  camposFaltantesVariable: string[] = [];
  toastVisible = false;
  toastMensaje = '';
  toastTipo: 'success' | 'info' | 'error' = 'success';
  private toastTimer?: ReturnType<typeof setTimeout>;
  abrirModalSuccessSave(mensaje: string) {
    this.mensajeSuccessSave = mensaje;
    this.SuccessSaveModal.nativeElement.showModal();
  }

  cerrarModalSuccessSave() {
    this.SuccessSaveModal.nativeElement.close();
  }

  abrirModalSuccessUpdate(mensaje: string) {
    this.mensajeSuccessUpdate = mensaje;
    this.SuccessUpdateModal.nativeElement.showModal();
  }

  cerrarModalSuccessUpdate() {
    this.SuccessUpdateModal.nativeElement.close();
  }

  abrirModalError(mensaje: string) {
    this.mensajeError = mensaje;
    this.ErrorModal.nativeElement.showModal();
  }

  cerrarModalError() {
    this.ErrorModal.nativeElement.close();
  }

  abrirModalCamposFaltantes(campos: string[]) {
    this.camposFaltantesVariable = campos;
    this.CamposFaltantesModal.nativeElement.showModal();
  }

  cerrarModalCamposFaltantes() {
    this.CamposFaltantesModal.nativeElement.close();
  }

  mostrarToast(
    mensaje: string,
    tipo: 'success' | 'info' | 'error' = 'success',
  ) {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.toastVisible = true;

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
    }, 2800);
  }

  private obtenerMensajeError(err: any): string {
    return (
      err?.error?.message ||
      err?.error?.detail ||
      err?.error?.error ||
      err?.message ||
      'Ocurrió un error inesperado.'
    );
  }

  variableExisteEnArmonizacion: boolean = false;
  modoEdicionVariable: boolean = false;
  private variablesArmoService = inject(VariablesArmoService);

  verificarSiVariableExiste(idA: string) {
    this.variablesArmoService.existePorIdA(idA).subscribe({
      next: (existe) => {
        this.variableExisteEnArmonizacion = existe;
        this.modoEdicionVariable = existe;

        if (existe) {
          this.cargarVariableArmonizacion(idA);
        } else {
          this.prepararVariableNueva();
        }
      },
      error: (err) => {
        console.error('Error al verificar variable en armonización:', err);
        this.variableExisteEnArmonizacion = false;
        this.modoEdicionVariable = false;
        this.prepararVariableNueva();
      },
    });
  }

  cargarVariableArmonizacion(idA: string) {
    this.variablesArmoService.obtenerPorIdA(idA).subscribe({
      next: (variable) => {
        this.variableForm.patchValue({
          idA: variable.idA,
          idFuente: variable.idFuente,
          acronimo: variable.acronimo,
          idS: variable.idS,
          variableS: variable.variableS,
          variableA: variable.variableA,
          url: variable.url,
          pregunta: variable.pregunta,
          definicion: variable.definicion,
          universo: variable.universo,
          anioReferencia: variable.anioReferencia,
          tematica: variable.tematica,
          tema1: variable.tema1,
          subtema1: variable.subtema1,
          tema2: variable.tema2,
          subtema2: variable.subtema2,
          tabulados: variable.tabulados,
          clasificacion: variable.clasificacion,
          microdatos: variable.microdatos,
          datosabiertos: variable.datosabiertos,
          mdea: variable.mdea,
          ods: variable.ods,
          comentarioS: variable.comentarioS,
          comentarioA: variable.comentarioA,
        });
        this.aplicarTemasGuardados();
        this.cargarClasificacionesVariable(variable.idA);
        this.cargarMicrodatosVariable(variable.idA, variable.microdatos ?? 'No');
        this.cargarDatosAbiertosVariable(variable.idA);
        this.cargarSubtemasGuardados();
      },
      error: (err) => {
        console.error('Error al cargar variable de armonización:', err);
      },
    });
  }

  prepararVariableNueva() {
    const variableSeleccionada = this.variableSeleccionada;

    if (!variableSeleccionada) return;

    this.variableForm.patchValue({
      idA: variableSeleccionada.idA,
      idFuente: variableSeleccionada.idFuente,
      acronimo: variableSeleccionada.acronimo,
      idS: variableSeleccionada.idS,
      variableS: variableSeleccionada.nombre,
      variableA: '',
      url: variableSeleccionada.url ?? '',
      definicion: variableSeleccionada.definicion ?? '',
      comentarioS: variableSeleccionada.comentarioS ?? '',

      pregunta: '',
      universo: '',
      anioReferencia: null,
      tematica: '',
      tema1: '',
      subtema1: '',
      tema2: '',
      subtema2: '',
      tabulados: false,
      clasificacion: false,
      microdatos: 'No',
      datosabiertos: false,
      mdea: variableSeleccionada.mdea ?? false,
      ods: variableSeleccionada.ods ?? false,
      comentarioA: '',
    });
  }
  guardarOActualizarVariable() {
    if (!this.variableForm.valid) {
      this.variableForm.markAllAsTouched();
      this.abrirModalCamposFaltantes(this.obtenerCamposFaltantesVariable());
      return;
    }

    const payload = this.variableForm.getRawValue();

    if (this.variableExisteEnArmonizacion) {
      this.variablesArmoService
        .actualizarVariable(payload.idA, payload)
        .subscribe({
          next: (resp) => {
            this.variableExisteEnArmonizacion = true;
            this.modoEdicionVariable = true;
            this.variablesArmonizadasIds.add(resp.idA);
            console.log('Variable actualizada:', resp);
            this.abrirModalSuccessUpdate(
              'La variable se actualizó correctamente en armonización.',
            );
          },
          error: (err) => {
            console.error('Error al actualizar variable:', err);
            this.abrirModalError(this.obtenerMensajeError(err));
          },
        });
    } else {
      this.variablesArmoService.guardarVariable(payload).subscribe({
        next: (resp) => {
          this.variableExisteEnArmonizacion = true;
          this.modoEdicionVariable = true;
          this.variableForm.patchValue(resp);
          this.variablesArmonizadasIds.add(resp.idA);
          this.cargarClasificacionesVariable(resp.idA);
          this.cargarMicrodatosVariable(resp.idA, resp.microdatos ?? 'No');
          this.cargarDatosAbiertosVariable(resp.idA);
          console.log('Variable guardada:', resp);
          this.abrirModalSuccessSave(
            'La variable se registró correctamente en armonización.',
          );
        },
        error: (err) => {
          console.error('Error al guardar variable:', err);
          this.abrirModalError(this.obtenerMensajeError(err));
        },
      });
    }
  }
  private fb = inject(FormBuilder);
  inicializarFormularioVariable() {
    this.variableForm = this.fb.group({
      idA: [''],
      idFuente: [''],
      acronimo: [''],
      idS: [''],
      variableS: [''],
      variableA: ['', Validators.required],
      url: ['', Validators.required],
      pregunta: ['', Validators.required],
      definicion: [''],
      universo: ['', Validators.required],
      anioReferencia: [null, Validators.required],
      tematica: ['', Validators.required],
      tema1: ['', Validators.required],
      subtema1: ['', Validators.required],
      tema2: ['', Validators.required],
      subtema2: ['', Validators.required],
      tabulados: [false],
      clasificacion: [false],
      microdatos: [''],
      datosabiertos: [false],
      mdea: [false],
      ods: [false],
      comentarioS: [''],
      comentarioA: ['', Validators.required],
    });
  }

  private obtenerCamposFaltantesVariable(): string[] {
    const etiquetas: Record<string, string> = {
      variableA: 'Variable armonizada',
      url: 'URL',
      pregunta: 'Pregunta',
      universo: 'Universo',
      anioReferencia: 'Año de referencia',
      tematica: 'Temática',
      tema1: 'Tema 1',
      subtema1: 'Subtema 1',
      tema2: 'Tema 2',
      subtema2: 'Subtema 2',
      comentarioA: 'Comentario armonización',
    };

    return Object.entries(etiquetas)
      .filter(([controlName]) => this.variableForm.get(controlName)?.invalid)
      .map(([, etiqueta]) => etiqueta);
  }

  limpiarEstadoVariableSeleccionada() {
    this.variableExisteEnArmonizacion = false;
    this.modoEdicionVariable = false;

    this.variableForm.reset({
      idA: '',
      idFuente: '',
      acronimo: '',
      idS: '',
      variableS: '',
      variableA: '',
      url: '',
      pregunta: '',
      definicion: '',
      universo: '',
      anioReferencia: null,
      tematica: '',
      tema1: '',
      subtema1: '',
      tema2: '',
      subtema2: '',
      tabulados: false,
      clasificacion: false,
      microdatos: 'No',
      datosabiertos: false,
      mdea: false,
      ods: false,
      comentarioS: '',
      comentarioA: '',
    });
    this.limpiarClasificacionLocal();
    this.limpiarMicrodatosLocal();
  }

  clasificacionActiva: boolean = false;
  arrClasificaciones: ClasificacionArmo[] = [];
  guardandoClasificacion = false;
  private readonly minimoClasificaciones = MINIMO_CLASIFICACIONES;

  clasificacionForm: ClasificacionVariableForm = {
    clase: '',
    comentarioA: '',
  };

  cambiarEstadoClasificacion(activa: boolean) {
    if (!activa && this.arrClasificaciones.length > 0) {
      this.clasificacionActiva = true;
      this.abrirModalError(
        'No puedes desactivar clasificaciones mientras existan registros. Primero elimina las clasificaciones registradas.',
      );
      return;
    }

    this.clasificacionActiva = activa;

    if (!activa) {
      this.clasificacionForm = {
        clase: '',
        comentarioA: '',
      };
    }
  }

  microdatosActivo: boolean = false;
  arrMicrodatos: MicrodatoArmo[] = [];
  guardandoMicrodatos = false;
  readonly microdatosEstadoSi = 'Sí';
  readonly microdatosEstadoNo = 'No';
  readonly microdatosEstadoLaboratorio = 'Sí (disponibles a través del Laboratorio de Microdatos)';

  microdatosForm: MicrodatosVariableForm = {
    urlAcceso: '',
    descriptor: '',
    urlDescriptor: '',
    tabla: '',
    campo: '',
    comentarioA: '',
  };
  datosAbiertosActivo: boolean = false;
  arrDatosAbiertos: DatoAbiertoArmo[] = [];
  guardandoDatosAbiertos = false;

  datosAbiertosForm: DatosAbiertosVariableForm = {
    urlAcceso: '',
    urlDescarga: '',
    descriptor: '',
    tabla: '',
    campo: '',
    comentarioA: '',
  };
  limpiarClasificacionLocal() {
    this.clasificacionActiva = false;
    this.arrClasificaciones = [];
    this.guardandoClasificacion = false;
    this.variableForm?.patchValue({ clasificacion: false });
    this.clasificacionForm = {
      clase: '',
      comentarioA: '',
    };
  }

  agregarClasificacionLocal(form: ClasificacionVariableForm) {
    if (!this.variableSeleccionada?.idA) {
      this.abrirModalError('Selecciona una variable antes de agregar clasificaciones.');
      return;
    }

    if (!this.variableExisteEnArmonizacion) {
      this.abrirModalError('Primero guarda la variable en armonización para poder agregar clasificaciones.');
      return;
    }

    const payload: ClasificacionArmo = {
      idA: this.variableSeleccionada.idA,
      clase: form.clase?.trim() || '',
      comentarioA: form.comentarioA?.trim() || '',
    };

    if (!payload.clase || !payload.comentarioA) {
      this.abrirModalError('Captura la clase y el comentario antes de agregar la clasificación.');
      return;
    }

    const claseDuplicada = this.arrClasificaciones.some(
      (clasificacion) => clasificacion.clase.trim() === payload.clase,
    );

    if (claseDuplicada) {
      this.abrirModalError(
        `La clase "${payload.clase}" ya está registrada para esta variable.`,
      );
      return;
    }

    this.guardandoClasificacion = true;
    this.clasificacionesArmoService.guardarClasificacion(payload).subscribe({
      next: () => {
        this.clasificacionForm = {
          clase: '',
          comentarioA: '',
        };
        this.clasificacionActiva = true;
        this.cargarClasificacionesVariable(payload.idA, () => {
          this.guardandoClasificacion = false;
          if (this.arrClasificaciones.length < this.minimoClasificaciones) {
            this.mostrarToast(
              'Clasificación agregada correctamente. Falta 1 clasificación para activar la bandera.',
            );
            return;
          }
          this.mostrarToast('Clasificación agregada correctamente.');
        });
      },
      error: (err) => {
        this.guardandoClasificacion = false;
        this.abrirModalError(this.obtenerMensajeError(err));
      },
    });
  }

  cargarClasificacionesVariable(idA: string, onSuccess: () => void = () => {}) {
    this.clasificacionesArmoService.obtenerPorIdA(idA).subscribe({
      next: (resp) => {
        this.arrClasificaciones = resp ?? [];
        this.clasificacionActiva = this.arrClasificaciones.length > 0;
        this.sincronizarBanderaClasificacion(onSuccess);
      },
      error: (err) => {
        console.error('Error al cargar clasificaciones:', err);
        this.arrClasificaciones = [];
        this.guardandoClasificacion = false;
        this.mostrarToast(this.obtenerMensajeError(err), 'error');
      },
    });
  }

  eliminarClasificacionLocal(clasificacion: ClasificacionArmo) {
    if (!clasificacion.idUnique) {
      this.mostrarToast('No se encontró el identificador de la clasificación.', 'error');
      return;
    }

    this.guardandoClasificacion = true;
    this.clasificacionesArmoService.eliminarClasificacion(clasificacion.idUnique).subscribe({
      next: () => {
        if (this.variableSeleccionada?.idA) {
          this.actualizarClasificacionesDespuesDeEliminar(this.variableSeleccionada.idA);
          return;
        }
        this.guardandoClasificacion = false;
        this.mostrarToast('Clasificación eliminada correctamente.');
      },
      error: (err) => {
        this.guardandoClasificacion = false;
        this.mostrarToast(this.obtenerMensajeError(err), 'error');
      },
    });
  }

  private actualizarClasificacionesDespuesDeEliminar(idA: string) {
    this.cargarClasificacionesVariable(idA, () => {
      this.guardandoClasificacion = false;
      this.mostrarToast('Clasificación eliminada correctamente.');
    });
  }

  private sincronizarBanderaClasificacion(onSuccess: () => void) {
    const clasificacion =
      this.arrClasificaciones.length >= this.minimoClasificaciones;
    const banderaActual = this.variableForm.get('clasificacion')?.value === true;

    this.variableForm.patchValue({ clasificacion });

    if (banderaActual === clasificacion) {
      onSuccess();
      return;
    }

    this.persistirBanderaClasificacionVariable(clasificacion, onSuccess);
  }

  private persistirBanderaClasificacionVariable(
    clasificacion: boolean,
    onSuccess: () => void,
  ) {
    if (!this.variableSeleccionada?.idA) {
      this.guardandoClasificacion = false;
      this.abrirModalError('No se encontró la variable seleccionada para actualizar la bandera de clasificación.');
      return;
    }

    this.variableForm.patchValue({ clasificacion });
    const payload = this.variableForm.getRawValue();

    this.variablesArmoService.actualizarVariable(this.variableSeleccionada.idA, payload).subscribe({
      next: (resp) => {
        this.variableForm.patchValue(resp);
        this.variableExisteEnArmonizacion = true;
        this.modoEdicionVariable = true;
        onSuccess();
      },
      error: (err) => {
        this.guardandoClasificacion = false;
        this.abrirModalError(this.obtenerMensajeError(err));
      },
    });
  }

  limpiarDatosAbiertosLocal() {
    this.datosAbiertosActivo = false;
    this.arrDatosAbiertos = [];
    this.guardandoDatosAbiertos = false;
    this.variableForm?.patchValue({ datosabiertos: false });
    this.datosAbiertosForm = this.crearDatosAbiertosFormVacio();
  }
  microdatosEstado: string = '';

  cambiarEstadoMicrodatos(activo: boolean) {
    if (!activo && this.arrMicrodatos.length > 0) {
      this.microdatosActivo = true;
      this.abrirModalError(
        'No puedes desactivar microdatos mientras existan registros. Primero elimina los microdatos registrados.',
      );
      return;
    }

    this.microdatosActivo = activo;

    if (!activo) {
      this.microdatosEstado = '';
      this.variableForm.patchValue({ microdatos: this.microdatosEstadoNo });
      this.microdatosForm = this.crearMicrodatosFormVacio();
      return;
    }

    if (!this.microdatosEstado) {
      this.microdatosEstado = this.microdatosEstadoSi;
    }
  }

  limpiarMicrodatosLocal() {
    this.microdatosActivo = false;
    this.microdatosEstado = '';
    this.arrMicrodatos = [];
    this.guardandoMicrodatos = false;
    this.variableForm?.patchValue({ microdatos: this.microdatosEstadoNo });
    this.microdatosForm = this.crearMicrodatosFormVacio();
  }

  cambiarEstadoDatosAbiertos(activo: boolean) {
    if (!activo && this.arrDatosAbiertos.length > 0) {
      this.datosAbiertosActivo = true;
      this.variableForm.patchValue({ datosabiertos: true });
      this.abrirModalError(
        'No puedes desactivar datos abiertos mientras existan registros. Primero elimina los datos abiertos registrados.',
      );
      return;
    }

    this.datosAbiertosActivo = activo;

    if (!activo) {
      this.variableForm.patchValue({ datosabiertos: false });
      this.datosAbiertosForm = this.crearDatosAbiertosFormVacio();
    }
  }

  agregarDatosAbiertosLocal(form: DatosAbiertosVariableForm) {
    if (!this.variableSeleccionada?.idA) {
      this.abrirModalError('Selecciona una variable antes de agregar datos abiertos.');
      return;
    }

    if (!this.variableExisteEnArmonizacion) {
      this.abrirModalError('Primero guarda la variable en armonización para poder agregar datos abiertos.');
      return;
    }

    const payload: DatoAbiertoArmo = {
      idA: this.variableSeleccionada.idA,
      urlAcceso: form.urlAcceso?.trim() || '',
      urlDescarga: form.urlDescarga?.trim() || '',
      descriptor: form.descriptor?.trim() || '',
      tabla: form.tabla?.trim() || '',
      campo: form.campo?.trim() || '',
      comentarioA: form.comentarioA?.trim() || '',
    };

    if (
      !payload.urlAcceso ||
      !payload.urlDescarga ||
      !payload.descriptor ||
      !payload.tabla ||
      !payload.campo ||
      !payload.comentarioA
    ) {
      this.abrirModalError('Captura todos los campos de datos abiertos antes de agregar el registro.');
      return;
    }

    this.guardandoDatosAbiertos = true;
    this.datosAbiertosArmoService.guardarDatoAbierto(payload).subscribe({
      next: () => {
        this.datosAbiertosActivo = true;
        this.datosAbiertosForm = this.crearDatosAbiertosFormVacio();
        this.persistirBanderaDatosAbiertosVariable(true, () => {
          this.guardandoDatosAbiertos = false;
          this.cargarDatosAbiertosVariable(payload.idA);
          this.mostrarToast('Dato abierto agregado correctamente.');
        });
      },
      error: (err) => {
        this.guardandoDatosAbiertos = false;
        this.abrirModalError(this.obtenerMensajeError(err));
      },
    });
  }

  cargarDatosAbiertosVariable(idA: string) {
    this.datosAbiertosArmoService.obtenerPorIdA(idA).subscribe({
      next: (resp) => {
        this.arrDatosAbiertos = resp ?? [];

        if (this.arrDatosAbiertos.length > 0) {
          this.datosAbiertosActivo = true;
          this.variableForm.patchValue({ datosabiertos: true });
          return;
        }

        this.datosAbiertosActivo = false;
        this.variableForm.patchValue({ datosabiertos: false });
      },
      error: (err) => {
        console.error('Error al cargar datos abiertos:', err);
        this.arrDatosAbiertos = [];
      },
    });
  }

  eliminarDatoAbiertoLocal(datoAbierto: DatoAbiertoArmo) {
    if (!datoAbierto.idUnique) {
      this.mostrarToast('No se encontró el identificador del dato abierto.', 'error');
      return;
    }

    this.guardandoDatosAbiertos = true;
    this.datosAbiertosArmoService.eliminarDatoAbierto(datoAbierto.idUnique).subscribe({
      next: () => {
        if (this.variableSeleccionada?.idA) {
          this.actualizarDatosAbiertosDespuesDeEliminar(this.variableSeleccionada.idA);
          return;
        }
        this.guardandoDatosAbiertos = false;
        this.mostrarToast('Dato abierto eliminado correctamente.');
      },
      error: (err) => {
        this.guardandoDatosAbiertos = false;
        this.mostrarToast(this.obtenerMensajeError(err), 'error');
      },
    });
  }

  private actualizarDatosAbiertosDespuesDeEliminar(idA: string) {
    this.datosAbiertosArmoService.obtenerPorIdA(idA).subscribe({
      next: (resp) => {
        this.arrDatosAbiertos = resp ?? [];

        if (this.arrDatosAbiertos.length === 0) {
          this.datosAbiertosActivo = false;
          this.persistirBanderaDatosAbiertosVariable(false, () => {
            this.guardandoDatosAbiertos = false;
            this.mostrarToast('Dato abierto eliminado correctamente.');
          });
          return;
        }

        this.datosAbiertosActivo = true;
        this.persistirBanderaDatosAbiertosVariable(true, () => {
          this.guardandoDatosAbiertos = false;
          this.mostrarToast('Dato abierto eliminado correctamente.');
        });
      },
      error: (err) => {
        this.guardandoDatosAbiertos = false;
        this.mostrarToast(this.obtenerMensajeError(err), 'error');
      },
    });
  }

  private persistirBanderaDatosAbiertosVariable(
    datosabiertos: boolean,
    onSuccess: () => void,
  ) {
    if (!this.variableSeleccionada?.idA) {
      this.guardandoDatosAbiertos = false;
      this.abrirModalError('No se encontró la variable seleccionada para actualizar la bandera de datos abiertos.');
      return;
    }

    this.variableForm.patchValue({ datosabiertos });
    const payload = this.variableForm.getRawValue();

    this.variablesArmoService.actualizarVariable(this.variableSeleccionada.idA, payload).subscribe({
      next: (resp) => {
        this.variableForm.patchValue(resp);
        this.variableExisteEnArmonizacion = true;
        this.modoEdicionVariable = true;
        onSuccess();
      },
      error: (err) => {
        this.guardandoDatosAbiertos = false;
        this.abrirModalError(this.obtenerMensajeError(err));
      },
    });
  }

  private crearDatosAbiertosFormVacio(): DatosAbiertosVariableForm {
    return {
      urlAcceso: '',
      urlDescarga: '',
      descriptor: '',
      tabla: '',
      campo: '',
      comentarioA: '',
    };
  }

  agregarMicrodatosLocal(payload: {
    estado: string;
    form: MicrodatosVariableForm;
  }) {
    if (!this.variableSeleccionada?.idA) {
      this.abrirModalError('Selecciona una variable antes de agregar microdatos.');
      return;
    }

    if (!this.variableExisteEnArmonizacion) {
      this.abrirModalError('Primero guarda la variable en armonización para poder agregar microdatos.');
      return;
    }

    const microdato: MicrodatoArmo = {
      idA: this.variableSeleccionada.idA,
      urlAcceso: payload.form.urlAcceso?.trim() || '',
      descriptor: payload.form.descriptor?.trim() || '',
      urlDescriptor: payload.form.urlDescriptor?.trim() || '',
      tabla: payload.form.tabla?.trim() || '',
      campo: payload.form.campo?.trim() || '',
      comentarioA: payload.form.comentarioA?.trim() || '',
    };

    if (
      !microdato.urlAcceso ||
      !microdato.descriptor ||
      !microdato.urlDescriptor ||
      !microdato.tabla ||
      !microdato.campo ||
      !microdato.comentarioA
    ) {
      this.abrirModalError('Captura todos los campos de microdatos antes de agregar el registro.');
      return;
    }

    const estadoMicrodatos = this.obtenerEstadoMicrodatosParaGuardar(payload.estado);

    this.guardandoMicrodatos = true;
    this.microdatosArmoService.guardarMicrodato(microdato).subscribe({
      next: () => {
        this.microdatosActivo = true;
        this.microdatosEstado = estadoMicrodatos;
        this.microdatosForm = this.crearMicrodatosFormVacio();
        this.persistirEstadoMicrodatosVariable(estadoMicrodatos, () => {
          this.guardandoMicrodatos = false;
          this.cargarMicrodatosVariable(microdato.idA, estadoMicrodatos);
          this.mostrarToast('Microdato agregado correctamente.');
        });
      },
      error: (err) => {
        this.guardandoMicrodatos = false;
        this.abrirModalError(this.obtenerMensajeError(err));
      },
    });
  }

  cargarMicrodatosVariable(idA: string, estadoVariable: string = this.microdatosEstadoNo) {
    this.microdatosArmoService.obtenerPorIdA(idA).subscribe({
      next: (resp) => {
        this.arrMicrodatos = resp ?? [];

        if (this.arrMicrodatos.length > 0) {
          this.microdatosActivo = true;
          this.microdatosEstado = this.normalizarEstadoMicrodatos(estadoVariable);
          this.variableForm.patchValue({ microdatos: this.microdatosEstado });
          return;
        }

        this.microdatosActivo = false;
        this.microdatosEstado = '';
        this.variableForm.patchValue({ microdatos: this.microdatosEstadoNo });
      },
      error: (err) => {
        console.error('Error al cargar microdatos:', err);
        this.arrMicrodatos = [];
      },
    });
  }

  eliminarMicrodatoLocal(microdato: MicrodatoArmo) {
    if (!microdato.idUnique) {
      this.mostrarToast('No se encontró el identificador del microdato.', 'error');
      return;
    }

    this.guardandoMicrodatos = true;
    this.microdatosArmoService.eliminarMicrodato(microdato.idUnique).subscribe({
      next: () => {
        if (this.variableSeleccionada?.idA) {
          this.actualizarMicrodatosDespuesDeEliminar(this.variableSeleccionada.idA);
          return;
        }
        this.guardandoMicrodatos = false;
        this.mostrarToast('Microdato eliminado correctamente.');
      },
      error: (err) => {
        this.guardandoMicrodatos = false;
        this.mostrarToast(this.obtenerMensajeError(err), 'error');
      },
    });
  }

  private actualizarMicrodatosDespuesDeEliminar(idA: string) {
    this.microdatosArmoService.obtenerPorIdA(idA).subscribe({
      next: (resp) => {
        this.arrMicrodatos = resp ?? [];

        if (this.arrMicrodatos.length === 0) {
          this.microdatosActivo = false;
          this.microdatosEstado = '';
          this.persistirEstadoMicrodatosVariable(this.microdatosEstadoNo, () => {
            this.guardandoMicrodatos = false;
            this.mostrarToast('Microdato eliminado correctamente.');
          });
          return;
        }

        const estadoActual = this.normalizarEstadoMicrodatos(this.variableForm.get('microdatos')?.value);
        this.microdatosActivo = true;
        this.microdatosEstado = estadoActual;
        this.persistirEstadoMicrodatosVariable(estadoActual, () => {
          this.guardandoMicrodatos = false;
          this.mostrarToast('Microdato eliminado correctamente.');
        });
      },
      error: (err) => {
        this.guardandoMicrodatos = false;
        this.mostrarToast(this.obtenerMensajeError(err), 'error');
      },
    });
  }

  private persistirEstadoMicrodatosVariable(
    microdatos: string,
    onSuccess: () => void,
  ) {
    if (!this.variableSeleccionada?.idA) {
      this.guardandoMicrodatos = false;
      this.abrirModalError('No se encontró la variable seleccionada para actualizar el estado de microdatos.');
      return;
    }

    this.variableForm.patchValue({ microdatos });
    const payload = this.variableForm.getRawValue();

    this.variablesArmoService.actualizarVariable(this.variableSeleccionada.idA, payload).subscribe({
      next: (resp) => {
        this.variableForm.patchValue(resp);
        this.variableExisteEnArmonizacion = true;
        this.modoEdicionVariable = true;
        onSuccess();
      },
      error: (err) => {
        this.guardandoMicrodatos = false;
        this.abrirModalError(this.obtenerMensajeError(err));
      },
    });
  }

  private obtenerEstadoMicrodatosParaGuardar(estado: string): string {
    return estado === this.microdatosEstadoLaboratorio
      ? this.microdatosEstadoLaboratorio
      : this.microdatosEstadoSi;
  }

  private normalizarEstadoMicrodatos(estado: string | null | undefined): string {
    if (estado === this.microdatosEstadoLaboratorio) {
      return this.microdatosEstadoLaboratorio;
    }

    return estado === this.microdatosEstadoSi || estado === 'Si'
      ? this.microdatosEstadoSi
      : this.microdatosEstadoNo;
  }

  private crearMicrodatosFormVacio(): MicrodatosVariableForm {
    return {
      urlAcceso: '',
      descriptor: '',
      urlDescriptor: '',
      tabla: '',
      campo: '',
      comentarioA: '',
    };
  }

  arrTematicas: TematicaDTO[] = [];
  private tematicasService = inject(TematicasService);
  cargarTematicasPorProceso(acronimo: string) {
    this.arrTematicas = [];

    if (!acronimo) {
      console.warn('No se pudo cargar temáticas: acrónimo no definido');
      return;
    }

    this.tematicasService.obtenerPorAcronimo(acronimo).subscribe({
      next: (resp) => {
        this.arrTematicas = resp ?? [];
        if (this.arrTematicas.length === 0) {
          console.warn(`No se encontraron temáticas para el acrónimo ${acronimo}`);
        }
      },
      error: (err) => {
        console.error('Error al cargar temáticas:', err);
        this.arrTematicas = [];
      },
    });
  }

  arrTemasCatalogo: string[] = [];

  arrSubtemasTema1: TemaSubtemaDTO[] = [];
  arrSubtemasTema2: TemaSubtemaDTO[] = [];
  private temasSubtemasService = inject(TemasSubtemasService);
  cargarTemasCatalogo() {
    this.arrTemasCatalogo = [];

    this.temasSubtemasService.obtenerTemas().subscribe({
      next: (resp) => {
        this.arrTemasCatalogo = resp;
        this.aplicarTemasGuardados();
        this.cargarSubtemasGuardados();
      },
      error: (err) => {
        console.error('Error al cargar temas:', err);
        this.arrTemasCatalogo = [];
      },
    });
  }

  private aplicarTemasGuardados() {
    this.aplicarTemaGuardado('tema1');
    this.aplicarTemaGuardado('tema2');
  }

  private aplicarTemaGuardado(controlName: 'tema1' | 'tema2') {
    const temaSeleccionado = this.variableForm.get(controlName)?.value;
    const temaNormalizado = this.normalizarTextoCatalogo(temaSeleccionado);

    if (!temaNormalizado || this.arrTemasCatalogo.length === 0) return;

    const temaEnCatalogo =
      this.arrTemasCatalogo.find(
        (tema) => this.normalizarTextoCatalogo(tema) === temaNormalizado,
      ) ?? temaSeleccionado;

    this.variableForm.patchValue({ [controlName]: temaEnCatalogo });
  }

  private cargarSubtemasGuardados() {
    const tema1 = this.variableForm.get('tema1')?.value;
    const subtema1 = this.variableForm.get('subtema1')?.value;
    const tema2 = this.variableForm.get('tema2')?.value;
    const subtema2 = this.variableForm.get('subtema2')?.value;

    if (tema1) {
      this.cargarSubtemasTema1(tema1, subtema1);
    }

    if (tema2) {
      this.cargarSubtemasTema2(tema2, subtema2);
    }
  }

  cargarSubtemasTema1(tema: string, subtemaSeleccionado?: string | null) {
    this.arrSubtemasTema1 = [];
    if (!subtemaSeleccionado) {
      this.variableForm.patchValue({ subtema1: '' });
    }

    if (!tema) return;

    this.temasSubtemasService.obtenerSubtemasPorTema(tema).subscribe({
      next: (resp) => {
        this.arrSubtemasTema1 = resp;
        this.aplicarSubtemaGuardado('subtema1', this.arrSubtemasTema1, subtemaSeleccionado);
      },
      error: (err) => {
        console.error('Error al cargar subtemas de tema1:', err);
        this.arrSubtemasTema1 = [];
      },
    });
  }
  cargarSubtemasTema2(tema: string, subtemaSeleccionado?: string | null) {
    this.arrSubtemasTema2 = [];
    if (!subtemaSeleccionado) {
      this.variableForm.patchValue({ subtema2: '' });
    }

    if (!tema) return;

    this.temasSubtemasService.obtenerSubtemasPorTema(tema).subscribe({
      next: (resp) => {
        this.arrSubtemasTema2 = resp;
        this.aplicarSubtemaGuardado('subtema2', this.arrSubtemasTema2, subtemaSeleccionado);
      },
      error: (err) => {
        console.error('Error al cargar subtemas de tema2:', err);
        this.arrSubtemasTema2 = [];
      },
    });
  }
  private aplicarSubtemaGuardado(
    controlName: 'subtema1' | 'subtema2',
    subtemas: TemaSubtemaDTO[],
    subtemaSeleccionado?: string | null,
  ) {
    const subtemaNormalizado = this.normalizarTextoCatalogo(subtemaSeleccionado);

    if (!subtemaNormalizado) return;

    const subtemaEnCatalogo =
      subtemas.find(
        (item) => this.normalizarTextoCatalogo(item.subtema) === subtemaNormalizado,
      )
        ?.subtema ?? subtemaSeleccionado;

    this.variableForm.patchValue({ [controlName]: subtemaEnCatalogo });
  }

  private normalizarTextoCatalogo(valor?: string | null): string {
    return (valor ?? '').trim().toLowerCase();
  }
  onTema1Change(event: Event) {
    const tema = (event.target as HTMLSelectElement).value;
    this.cargarSubtemasTema1(tema);
  }
  onTema2Change(event: Event) {
    const tema = (event.target as HTMLSelectElement).value;
    this.cargarSubtemasTema2(tema);
  }
}
