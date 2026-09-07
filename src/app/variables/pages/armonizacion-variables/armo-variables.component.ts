/**
 * @author Luis Gerardo Castañeda López
 * @organization INEGI
 * @project SIIERNMA
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
import {
  FuenteArmonizacionDTO,
  FuenteSaveDTO,
} from '@/variables/interfaces/fuenteArmonizacion.interface';
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
import { Component, computed, ElementRef, inject, Input, OnChanges, OnInit, signal, SimpleChanges, ViewChild } from '@angular/core';
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
export class ArmonizacionVariablesComponent implements OnInit, OnChanges {
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
  private estatusVariablesRequestId = 0;
  private seleccionVariableRequestId = 0;

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

  @Input() ticketVariableIdA = '';
  @Input() ticketClasificacionesIdA = '';

  ngOnInit(): void {
    this.getDirecciones();
    this.inicializarFormularioVariable();
    this.cargarTemasCatalogo();
    const idA = this.ticketVariableIdA || this.ticketClasificacionesIdA;
    if (idA) this.cargarVariableDesdeTicket(idA);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const idA =
      changes['ticketVariableIdA']?.currentValue?.trim() ||
      changes['ticketClasificacionesIdA']?.currentValue?.trim();
    if (idA && this.variableForm) this.cargarVariableDesdeTicket(idA);
  }

  private cargarVariableDesdeTicket(idA: string) {
    this.variablesArmoService.obtenerPorIdA(idA).subscribe({
      next: (variable) => {
        this.variableSeleccionada = {
          idA: variable.idA,
          idS: variable.idS ?? '',
          idFuente: variable.idFuente,
          acronimo: variable.acronimo,
          nombre: variable.variableS ?? '',
          definicion: variable.definicion ?? '',
          url: variable.url ?? '',
          comentarioS: variable.comentarioS ?? '',
          mdea: variable.mdea ?? false,
          ods: variable.ods ?? false,
          responsableRegister: 0,
          revisada: false,
        };
        this.variableExisteEnArmonizacion = true;
        this.modoEdicionVariable = true;
        this.fuenteExisteEnArmonizacion = true;
        this.cargarTematicasPorProceso(variable.acronimo);
        this.cargarVariableArmonizacion(idA);
      },
      error: (err) => {
        console.error('Error al cargar variable del ticket:', err);
        this.abrirModalError('No fue posible cargar la variable reportada.');
      },
    });
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
    const requestId = ++this.estatusVariablesRequestId;
    this.variablesArmonizadasIds.clear();

    variables.forEach((variable) => {
      this.variablesArmoService.existePorIdA(variable.idA).subscribe({
        next: (existe) => {
          if (requestId !== this.estatusVariablesRequestId) return;
          if (existe) this.variablesArmonizadasIds.add(variable.idA);
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
  private idFuenteCanonicaCargada: string | null = null;

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
    const requestId = ++this.seleccionVariableRequestId;
    this.variableSeleccionada = variable;
    this.fuenteExisteEnArmonizacion = false;
    this.idFuenteCanonicaCargada = null;
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

    this.variablesArmoService.existePorIdA(variable.idA).subscribe({
      next: (existe) => {
        if (requestId !== this.seleccionVariableRequestId) return;

        this.variableExisteEnArmonizacion = existe;
        this.modoEdicionVariable = existe;

        if (existe) {
          this.fuenteExisteEnArmonizacion = true;
          this.cargandoEstadoFuente = true;
          this.cargarVariableArmonizacion(variable.idA);
          return;
        }

        this.fuenteExisteEnArmonizacion = false;
        this.cargandoEstadoFuente = false;
        this.prepararVariableNueva();
      },
      error: (err) => {
        if (requestId !== this.seleccionVariableRequestId) return;
        console.error('Error al verificar variable en armonización:', err);
        this.fuenteExisteEnArmonizacion = false;
        this.cargandoEstadoFuente = false;
        this.prepararVariableNueva();
      },
    });
  }

  verificarSiFuenteExisteEnArmonizacionPorIdFuenteSeleccion(
    idFuenteSeleccion: string,
  ) {
    this.cargandoEstadoFuente = true;

    this._varService.getFuenteArmonizacionByIdFuenteSeleccion(idFuenteSeleccion).subscribe({
      next: (fuenteArm) => {
        if (!this.fuenteForm) return;

        const idA = this.variableSeleccionada?.idA;
        if (!idA) {
          this.fuenteExisteEnArmonizacion = true;
          this.cargandoEstadoFuente = false;
          this.aplicarFuenteArmonizacion(fuenteArm, idFuenteSeleccion, true);
          return;
        }

        if (this.variableExisteEnArmonizacion) {
          this.cargandoEstadoFuente = false;
          return;
        }

        this.variablesArmoService.existePorIdA(idA).subscribe({
          next: (existe) => {
            this.variableExisteEnArmonizacion = existe;
            this.modoEdicionVariable = existe;
            this.cargandoEstadoFuente = false;

            if (existe) {
              this.cargarVariableArmonizacion(idA);
              return;
            }

            this.fuenteExisteEnArmonizacion = true;
            this.aplicarFuenteArmonizacion(fuenteArm, idFuenteSeleccion, true);
            this.prepararVariableNueva();
          },
          error: (err) => {
            console.error('Error al verificar variable en armonización:', err);
            this.fuenteExisteEnArmonizacion = true;
            this.cargandoEstadoFuente = false;
            this.aplicarFuenteArmonizacion(fuenteArm, idFuenteSeleccion, true);
            this.prepararVariableNueva();
          },
        });
      },
      error: (err) => {
        console.error('Error al verificar fuente en armonización:', err);
        this.fuenteExisteEnArmonizacion = false;
        this.cargandoEstadoFuente = false;

        if (this.variableSeleccionada?.idA) {
          this.verificarSiVariableExiste(this.variableSeleccionada.idA);
        }

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

          this.aplicarFuenteArmonizacion(fuenteArm, idFuenteSeleccion, true);
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
    this.guardarFuenteSegunEstado();
  }

  guardarFuenteSegunEstado() {
    if (!this.fuenteForm) {
      console.warn('No hay fuente cargada para guardar');
      return;
    }

    const payload = this.crearPayloadFuente();

    if (!this.variableExisteEnArmonizacion) {
      payload.idFuenteSeleccion = this.obtenerIdFuenteSeleccionPorVariable();
      this.crearFuenteArmonizacion(payload);
      return;
    }

    this.confirmarActualizacionFuente(payload);
  }

  crearOtraFuenteParaVariable() {
    if (!this.fuenteForm) {
      console.warn('No hay fuente cargada para guardar');
      return;
    }

    const payload = this.crearPayloadFuente();
    payload.idFuenteSeleccion = this.obtenerIdFuenteSeleccionPorVariable(true);

    this.crearFuenteArmonizacion(payload, true);
  }

  private crearFuenteArmonizacion(
    payload: FuenteSaveDTO,
    actualizarVariableExistente = false,
  ) {
    this._varService.createFuenteArmonizacion(payload).subscribe({
      next: (resp) => {
        console.log('Fuente guardada en armonización:', resp);
        this.fuenteExisteEnArmonizacion = true;
        this.aplicarFuenteArmonizacion(resp, payload.idFuenteSeleccion);

        if (actualizarVariableExistente) {
          this.moverVariableActualAFuente(resp);
          return;
        }

        this.verificarVariableSeleccionadaConFuenteCanonica();
        this.abrirModalSuccessSave(
          this.obtenerMensajeFuenteGuardada(resp, payload),
        );
      },
      error: (err) => {
        console.error('Error al guardar fuente en armonización:', err);
        this.reutilizarFuenteCanonicaExistente(
          payload,
          err,
          actualizarVariableExistente,
        );
      },
    });
  }

  private actualizarFuenteArmonizacion(payload: FuenteSaveDTO) {
    this._varService.updateFuenteArmonizacion(payload).subscribe({
      next: (resp) => {
        if (this.fuenteFueReutilizada(resp, payload)) {
          this.abrirModalError(
            'Ya existe una fuente con esos datos. Usa "Usar estos datos como otra fuente" para mover esta variable ahí.',
          );
          return;
        }

        console.log('Fuente actualizada en armonización:', resp);
        this.abrirModalSuccessUpdate(
          'La fuente actual se actualizó. El cambio aplica a todas sus variables asociadas.',
        );
        this.fuenteExisteEnArmonizacion = true;
        this.aplicarFuenteArmonizacion(resp, payload.idFuenteSeleccion);
        this.verificarVariableSeleccionadaConFuenteCanonica();
      },
      error: (err) => {
        console.error('Error al guardar fuente en armonización:', err);
        this.abrirModalError(this.obtenerMensajeError(err));
      },
    });
  }

  private confirmarActualizacionFuente(payload: FuenteSaveDTO) {
    const idFuenteActual =
      this.idFuenteCanonicaCargada ||
      this.fuenteForm?.idFuente ||
      this.variableForm.get('idFuente')?.value;

    if (!idFuenteActual) {
      this.abrirModalError('No se encontró la fuente actual para actualizar.');
      return;
    }

    this._varService.countVariablesFuenteArmonizacion(idFuenteActual).subscribe({
      next: (resp) => {
        const total = resp?.total ?? 0;
        const confirmar = confirm(
          `Esta fuente es usada por ${total} variable(s). Si la actualizas, cambiará para todas. ¿Continuar?`,
        );

        if (!confirmar) return;

        this.actualizarFuenteArmonizacion(payload);
      },
      error: (err) => {
        this.abrirModalError(this.obtenerMensajeError(err));
      },
    });
  }

  private crearPayloadFuente(): FuenteSaveDTO {
    return {
      idFuenteSeleccion: this.obtenerIdFuenteSeleccionParaGuardar(),
      idFuenteSeleccionOrigen: this.variableSeleccionada?.idFuente || undefined,
      acronimo: this.fuenteForm?.acronimo?.trim() || '',
      fuente: this.fuenteForm?.fuente?.trim() || '',
      url: this.fuenteForm?.url?.trim() || null,
      edicion: this.fuenteForm?.edicion?.trim() || null,
      comentarioS: this.fuenteForm?.comentarioS?.trim() || null,
      comentarioA: this.fuenteForm?.comentarioA?.trim() || null,
    };
  }

  private moverVariableActualAFuente(fuente: FuenteArmonizacionDTO) {
    const idFuente = fuente.idFuente ?? this.fuenteForm?.idFuente;

    if (!this.variableSeleccionada?.idA || !idFuente) {
      this.abrirModalError('No se pudo asociar la variable a la fuente seleccionada.');
      return;
    }

    const payload = {
      ...this.variableForm.getRawValue(),
      idFuente,
    };

    this.variablesArmoService
      .actualizarVariable(this.variableSeleccionada.idA, payload)
      .subscribe({
        next: (resp) => {
          this.variableForm.patchValue(resp);
          this.variableExisteEnArmonizacion = true;
          this.modoEdicionVariable = true;
          this.variablesArmonizadasIds.add(resp.idA);
          this.abrirModalSuccessSave(
            'La fuente ya existía o fue creada; esta variable quedó asociada a esa fuente.',
          );
        },
        error: (err) => {
          this.abrirModalError(this.obtenerMensajeError(err));
        },
      });
  }

  eliminarVariableArmonizada() {
    if (!this.variableSeleccionada?.idA || !this.variableExisteEnArmonizacion) {
      return;
    }

    const confirmar = confirm(
      `Se eliminará solo la variable ${this.variableSeleccionada.idA} de armonización. No se tocará selección. ¿Deseas continuar?`,
    );

    if (!confirmar) return;

    this.variablesArmoService.eliminarVariable(this.variableSeleccionada.idA).subscribe({
      next: () => {
        const idA = this.variableSeleccionada?.idA;
        if (idA) this.variablesArmonizadasIds.delete(idA);
        this.variableExisteEnArmonizacion = false;
        this.modoEdicionVariable = false;
        this.fuenteExisteEnArmonizacion = false;
        this.prepararVariableNueva();
        this.abrirModalSuccessUpdate('La variable se eliminó de armonización.');
      },
      error: (err) => {
        this.abrirModalError(this.obtenerMensajeError(err));
      },
    });
  }

  eliminarFuenteYVariables() {
    const idFuente = this.fuenteForm?.idFuente || this.variableForm.get('idFuente')?.value;

    if (!idFuente || !this.fuenteExisteEnArmonizacion) {
      return;
    }

    this._varService.countVariablesFuenteArmonizacion(idFuente).subscribe({
      next: (resp) => {
        const total = resp?.total ?? 0;
        const confirmar = confirm(
          `Se eliminará esta fuente de armonización y ${total} variable(s) asociada(s). No se tocarán las tablas de selección. ¿Deseas continuar?`,
        );

        if (!confirmar) return;

        this._varService.deleteFuenteArmonizacionById(idFuente).subscribe({
          next: () => {
            this.actualizarListaDespuesDeEliminarFuente(idFuente);
            this.fuenteForm = null;
            this.fuenteExisteEnArmonizacion = false;
            this.variableExisteEnArmonizacion = false;
            this.modoEdicionVariable = false;
            this.limpiarEstadoVariableSeleccionada();
            this.abrirModalSuccessUpdate(
              `La fuente y ${total} variable(s) asociada(s) se eliminaron de armonización.`,
            );
          },
          error: (err) => {
            this.abrirModalError(this.obtenerMensajeError(err));
          },
        });
      },
      error: (err) => {
        this.abrirModalError(this.obtenerMensajeError(err));
      },
    });
  }

  private actualizarListaDespuesDeEliminarFuente(idFuente: string) {
    this.arrVariablesSeleccionadas.forEach((variable) => {
      if (this.variableForm.get('idFuente')?.value === idFuente) {
        this.variablesArmonizadasIds.delete(variable.idA);
      }
    });

    if (this.arrVariablesSeleccionadas.length > 0) {
      this.cargarEstatusVariablesArmonizadas(this.arrVariablesSeleccionadas);
    }
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

  private aplicarFuenteArmonizacion(
    fuente: FuenteArmonizacionDTO,
    idFuenteSeleccionFallback?: string,
    recordarComoFuenteCargada = false,
  ) {
    if (!this.fuenteForm) return;

    const idFuenteCanonica = fuente.idFuente ?? this.fuenteForm.idFuente ?? '';

    this.fuenteForm = {
      ...this.fuenteForm,
      idFuente: idFuenteCanonica,
      idFuenteSeleccion:
        fuente.idFuenteSeleccion ??
        this.fuenteForm.idFuenteSeleccion ??
        idFuenteSeleccionFallback,
      acronimo: fuente.acronimo ?? this.fuenteForm.acronimo,
      fuente: fuente.fuente ?? this.fuenteForm.fuente,
      url: fuente.url ?? '',
      edicion: fuente.edicion ?? '',
      comentarioS: fuente.comentarioS ?? '',
      comentarioA: fuente.comentarioA ?? '',
    };

    if (idFuenteCanonica) {
      this.variableForm.patchValue({ idFuente: idFuenteCanonica });
    }

    if (recordarComoFuenteCargada) {
      this.idFuenteCanonicaCargada = idFuenteCanonica || null;
    }
  }

  private verificarVariableSeleccionadaConFuenteCanonica() {
    if (this.variableSeleccionada?.idA) {
      this.verificarSiVariableExiste(this.variableSeleccionada.idA);
    }
  }

  private obtenerMensajeFuenteGuardada(
    fuente: FuenteArmonizacionDTO,
    payload: FuenteSaveDTO,
  ): string {
    const fuenteReutilizada = this.fuenteFueReutilizada(fuente, payload);

    return fuenteReutilizada
      ? 'La fuente ya existía; esta variable se asociará a esa fuente.'
      : 'La fuente se guardó correctamente. Ya puedes armonizar la variable.';
  }

  private fuenteFueReutilizada(
    fuente: FuenteArmonizacionDTO,
    payload: FuenteSaveDTO,
  ): boolean {
    return (
      fuente.reutilizada === true ||
      (!!fuente.idFuenteSeleccion &&
        fuente.idFuenteSeleccion !== payload.idFuenteSeleccion)
    );
  }

  private reutilizarFuenteCanonicaExistente(
    payload: FuenteSaveDTO,
    errorOriginal: any,
    actualizarVariableExistente = false,
  ) {
    const idFuenteCanonica = this.generarIdFuenteCanonica(payload);

    this._varService.getFuenteArmonizacionById(idFuenteCanonica).subscribe({
      next: (fuenteExistente) => {
        this.fuenteExisteEnArmonizacion = true;
        this.aplicarFuenteArmonizacion(
          {
            ...fuenteExistente,
            reutilizada: true,
          },
          payload.idFuenteSeleccion,
        );

        if (actualizarVariableExistente) {
          this.moverVariableActualAFuente(fuenteExistente);
          return;
        }

        this.verificarVariableSeleccionadaConFuenteCanonica();
        this.abrirModalSuccessSave(
          'La fuente ya existía; esta variable se asociará a esa fuente.',
        );
      },
      error: () => {
        this.abrirModalError(this.obtenerMensajeError(errorOriginal));
      },
    });
  }

  private generarIdFuenteCanonica(payload: FuenteSaveDTO): string {
    return `${payload.acronimo}-${payload.fuente}-${payload.edicion ?? ''}-${payload.url ?? ''}`;
  }

  private obtenerIdFuenteSeleccionParaGuardar(): string {
    return (
      this.fuenteForm?.idFuenteSeleccion ||
      this.variableSeleccionada?.idFuente ||
      ''
    );
  }

  private obtenerIdFuenteSeleccionPorVariable(forzarNuevo = false): string {
    const idFuenteSeleccionBase =
      this.variableSeleccionada?.idFuente ||
      this.fuenteForm?.idFuenteSeleccion ||
      '';

    if (!this.variableSeleccionada?.idA) {
      return idFuenteSeleccionBase;
    }

    const idPorVariable = `${idFuenteSeleccionBase}::${this.variableSeleccionada.idA}`;
    return forzarNuevo ? `${idPorVariable}::${Date.now()}` : idPorVariable;
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
        if (variable.idFuente) {
          this.cargarFuenteCanonicaVariable(variable.idFuente);
        }
        this.aplicarTemasGuardados();
        this.cargarClasificacionesVariable(variable.idA);
        this.cargarMicrodatosVariable(variable.idA);
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
      idFuente: this.fuenteForm?.idFuente || variableSeleccionada.idFuente,
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
      microdatos: false,
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
          this.cargarMicrodatosVariable(resp.idA);
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
      microdatos: [false],
      datosabiertos: [false],
      mdea: [false],
      ods: [false],
      comentarioS: [''],
      comentarioA: ['', Validators.required],
    });
  }

  private cargarFuenteCanonicaVariable(idFuente: string) {
    this._varService.getFuenteArmonizacionById(idFuente).subscribe({
      next: (fuente) => {
        if (!this.fuenteForm) return;
        this.aplicarFuenteArmonizacion(fuente, fuente.idFuenteSeleccion, true);
        this.fuenteExisteEnArmonizacion = true;
        this.cargandoEstadoFuente = false;
      },
      error: (err) => {
        console.error('Error al cargar fuente canonica de la variable:', err);
        this.cargandoEstadoFuente = false;
      },
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
      microdatos: false,
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
  microdatoEditandoId: number | null = null;
  microdatosForm: MicrodatosVariableForm = {
    laboratorio: false,
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
  datoAbiertoEditandoId: number | null = null;

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
    this.datoAbiertoEditandoId = null;
  }
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
      this.variableForm.patchValue({ microdatos: false });
      this.microdatosForm = this.crearMicrodatosFormVacio();
      return;
    }

  }

  limpiarMicrodatosLocal() {
    this.microdatosActivo = false;
    this.arrMicrodatos = [];
    this.guardandoMicrodatos = false;
    this.variableForm?.patchValue({ microdatos: false });
    this.microdatosForm = this.crearMicrodatosFormVacio();
    this.microdatoEditandoId = null;
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

    const datoAbiertoDuplicado = this.arrDatosAbiertos.some((registrado) =>
      registrado.idUnique !== this.datoAbiertoEditandoId && this.sonDatosAbiertosIguales(registrado, payload),
    );

    if (datoAbiertoDuplicado) {
      this.abrirModalError(
        'Este dato abierto ya está registrado para la variable. Modifica al menos uno de sus campos antes de intentarlo nuevamente.',
      );
      return;
    }

    const editandoId = this.datoAbiertoEditandoId;
    this.guardandoDatosAbiertos = true;
    const guardar = editandoId
      ? this.datosAbiertosArmoService.actualizarDatoAbierto(editandoId, payload)
      : this.datosAbiertosArmoService.guardarDatoAbierto(payload);
    guardar.subscribe({
      next: () => {
        this.datosAbiertosActivo = true;
        this.datosAbiertosForm = this.crearDatosAbiertosFormVacio();
        this.datoAbiertoEditandoId = null;
        this.persistirBanderaDatosAbiertosVariable(true, () => {
          this.guardandoDatosAbiertos = false;
          this.cargarDatosAbiertosVariable(payload.idA);
          this.mostrarToast(editandoId ? 'Dato abierto actualizado correctamente.' : 'Dato abierto agregado correctamente.');
        });
      },
      error: (err) => {
        this.guardandoDatosAbiertos = false;
        this.abrirModalError(this.obtenerMensajeError(err));
      },
    });
  }

  private sonDatosAbiertosIguales(
    registrado: DatoAbiertoArmo,
    capturado: DatoAbiertoArmo,
  ): boolean {
    const normalizar = (valor: string) => valor.trim().toLocaleLowerCase();

    return (
      normalizar(registrado.urlAcceso) === normalizar(capturado.urlAcceso) &&
      normalizar(registrado.urlDescarga) ===
        normalizar(capturado.urlDescarga) &&
      normalizar(registrado.descriptor) === normalizar(capturado.descriptor) &&
      normalizar(registrado.tabla) === normalizar(capturado.tabla) &&
      normalizar(registrado.campo) === normalizar(capturado.campo) &&
      normalizar(registrado.comentarioA) ===
        normalizar(capturado.comentarioA)
    );
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

  editarDatoAbiertoLocal(datoAbierto: DatoAbiertoArmo) {
    if (!datoAbierto.idUnique) return;
    this.datoAbiertoEditandoId = datoAbierto.idUnique;
    this.datosAbiertosActivo = true;
    this.datosAbiertosForm = {
      urlAcceso: datoAbierto.urlAcceso,
      urlDescarga: datoAbierto.urlDescarga,
      descriptor: datoAbierto.descriptor,
      tabla: datoAbierto.tabla,
      campo: datoAbierto.campo,
      comentarioA: datoAbierto.comentarioA,
    };
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

  agregarMicrodatosLocal(payload: { form: MicrodatosVariableForm }) {
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
      laboratorio: payload.form.laboratorio,
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

    const microdatoDuplicado = this.arrMicrodatos.some((registrado) =>
      registrado.idUnique !== this.microdatoEditandoId && this.sonMicrodatosIguales(registrado, microdato),
    );

    if (microdatoDuplicado) {
      this.abrirModalError(
        'Este microdato ya está registrado para la variable. Modifica al menos uno de sus campos antes de intentarlo nuevamente.',
      );
      return;
    }

    const editandoId = this.microdatoEditandoId;
    this.guardandoMicrodatos = true;
    const guardar = editandoId
      ? this.microdatosArmoService.actualizarMicrodato(editandoId, microdato)
      : this.microdatosArmoService.guardarMicrodato(microdato);
    guardar.subscribe({
      next: () => {
        this.microdatosActivo = true;
        this.variableForm.patchValue({ microdatos: true });
        this.microdatosForm = this.crearMicrodatosFormVacio();
        this.microdatoEditandoId = null;
        this.guardandoMicrodatos = false;
        this.cargarMicrodatosVariable(microdato.idA);
        this.mostrarToast(editandoId ? 'Microdato actualizado correctamente.' : 'Microdato agregado correctamente.');
      },
      error: (err) => {
        this.guardandoMicrodatos = false;
        this.abrirModalError(this.obtenerMensajeError(err));
      },
    });
  }

  private sonMicrodatosIguales(
    registrado: MicrodatoArmo,
    capturado: MicrodatoArmo,
  ): boolean {
    const normalizar = (valor: string) => valor.trim().toLocaleLowerCase();

    return (
      normalizar(registrado.urlAcceso) === normalizar(capturado.urlAcceso) &&
      normalizar(registrado.descriptor) === normalizar(capturado.descriptor) &&
      normalizar(registrado.urlDescriptor) ===
        normalizar(capturado.urlDescriptor) &&
      normalizar(registrado.tabla) === normalizar(capturado.tabla) &&
      normalizar(registrado.campo) === normalizar(capturado.campo) &&
      normalizar(registrado.comentarioA) ===
        normalizar(capturado.comentarioA) &&
      registrado.laboratorio === capturado.laboratorio
    );
  }

  cargarMicrodatosVariable(idA: string) {
    this.microdatosArmoService.obtenerPorIdA(idA).subscribe({
      next: (resp) => {
        this.arrMicrodatos = resp ?? [];

        if (this.arrMicrodatos.length > 0) {
          this.microdatosActivo = true;
          this.variableForm.patchValue({ microdatos: true });
          return;
        }

        this.microdatosActivo = false;
        this.variableForm.patchValue({ microdatos: false });
      },
      error: (err) => {
        console.error('Error al cargar microdatos:', err);
        this.arrMicrodatos = [];
      },
    });
  }

  editarMicrodatoLocal(microdato: MicrodatoArmo) {
    if (!microdato.idUnique) return;
    this.microdatoEditandoId = microdato.idUnique;
    this.microdatosActivo = true;
    this.microdatosForm = {
      laboratorio: microdato.laboratorio,
      urlAcceso: microdato.urlAcceso,
      descriptor: microdato.descriptor,
      urlDescriptor: microdato.urlDescriptor,
      tabla: microdato.tabla,
      campo: microdato.campo,
      comentarioA: microdato.comentarioA,
    };
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
          this.variableForm.patchValue({ microdatos: false });
          this.guardandoMicrodatos = false;
          this.mostrarToast('Microdato eliminado correctamente.');
          return;
        }

        this.microdatosActivo = true;
        this.variableForm.patchValue({ microdatos: true });
        this.guardandoMicrodatos = false;
        this.mostrarToast('Microdato eliminado correctamente.');
      },
      error: (err) => {
        this.guardandoMicrodatos = false;
        this.mostrarToast(this.obtenerMensajeError(err), 'error');
      },
    });
  }

  private crearMicrodatosFormVacio(): MicrodatosVariableForm {
    return {
      laboratorio: false,
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
