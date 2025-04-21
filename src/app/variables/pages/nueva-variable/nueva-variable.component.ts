import { RelacionODS } from '@/variables/interfaces/relationVarWhit_ODS.interface';
import { RelationVarWhitMDEA } from '@/variables/interfaces/relationVarWhitMdea.interface';
import { VariableDTO } from '@/variables/interfaces/variablesCapDTO.interface';
import { CapturaMdeaVarService } from '@/variables/services/captura-mdea-vars.service';
import { relacionODS_Service } from '@/variables/services/captura-ods-vars.service';
import { MdeaService } from '@/variables/services/mdea-pull.service';
import { OdsService } from '@/variables/services/ods-pull.service';
import { VariableService } from '@/variables/services/variables.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-nueva-variable',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './nueva-variable.component.html',
})
export class NuevaVariableComponent implements OnInit {
  ngOnInit(): void {
    this.getComponentes();
    this.getObjetivos();
    this.getPropetiesLocalStorage();
    this.getRelation_MDEA_Var();
    this.obtenerRelaciones_ods();
  }

  //! COSAS PARA QUE FUNCIONE MDEA RELATION
  _mdeaService = inject(MdeaService);
  flagMDEArelation: boolean = false;

  //? para el warning MDEA o ODS
  showWarning: boolean = false;
  currentDeactivation: {
    type: 'MDEA' | 'ODS' | 'firstActivationMDEA';
    name: string;
  } | null = null;

  //? seguro de eliminar ALERT

  activacionInicialMDEA = false; // <-- esta controla si ya se hizo la primera vez

  checkedAliniationMDEA(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const newValue = checkbox.checked;

    if (this.flagMDEArelation && !newValue) {
      event.preventDefault();
      this.currentDeactivation = { type: 'MDEA', name: 'MDEA' };
      this.showWarning = true;
    } else if (!this.flagMDEArelation && newValue) {
      this.flagMDEArelation = true;
      this.showWarning = false;
    }
  }

  //? seguro de eliminar ALERT ODS
  flagODSrelation: boolean = false;
  checkedAliniationODS(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const newValue = checkbox.checked;

    if (this.flagODSrelation && !newValue) {
      event.preventDefault();
      this.currentDeactivation = { type: 'ODS', name: 'ODS' };
      this.showWarning = true;
    } else if (!this.flagODSrelation && newValue) {
      this.flagODSrelation = true;
    }
  }

  // ? WARNING ACEPTAR
  confirmDeactivation() {
    if (this.currentDeactivation) {
      if (this.currentDeactivation.type === 'MDEA') {
        this.flagMDEArelation = false;
        this.showPOST_RELATIONES_MDE = false;
      } else {
        this.flagODSrelation = false;
        this.showPOST_RELATIONES_ODS = false;
      }
    }
    this.showWarning = false;
    this.currentDeactivation = null;
  }

  // ? WARNING CANCELAR
  cancelDeactivation() {
    this.showWarning = false;
    this.currentDeactivation = null;
    // Forzar el estado de los checkboxes
    setTimeout(() => {
      const mdeaCheckbox = document.querySelector(
        '#alinea_MDEA'
      ) as HTMLInputElement;
      const odsCheckbox = document.querySelector(
        '#alinea_ODS'
      ) as HTMLInputElement;

      if (mdeaCheckbox) mdeaCheckbox.checked = this.flagMDEArelation;
      if (odsCheckbox) odsCheckbox.checked = this.flagODSrelation;
    });
  }

  // ! VARIABLES MDEA RELATION
  arrComponentes: any[] = [];
  arrSubcompo: any[] = [];
  arrTopicos: any[] = [];
  arrVariables: any[] = [];
  arrEstadisticos: any[] = [];

  idComponente: number | string = '';
  idSubcomponente: number | string = '';
  idTopico: number | string = '';
  idVariableMDEAPULL: number | string = '';
  idEstadistico: number | string = '';

  //! funciones tablas control
  getComponentes() {
    this._mdeaService.getComponentes().subscribe((data) => {
      this.arrComponentes = data;
    });
  }
  getSubcomponentes(idComp: number | string) {
    this._mdeaService.getSubcomponentes(idComp).subscribe((data) => {
      this.arrSubcompo = data;
    });
  }
  getTopicos(idSub: number | string) {
    this._mdeaService.getTopicos(this.idComponente, idSub).subscribe((data) => {
      this.arrTopicos = data;
    });
  }

  getVariables(idTop: number | string) {
    this._mdeaService
      .getVariables(this.idComponente, this.idSubcomponente, idTop)
      .subscribe((data) => {
        this.arrVariables = data;
      });
  }
  getEstadisticos(idVar: number | string) {
    this._mdeaService
      .getEstadisticos(
        this.idComponente,
        this.idSubcomponente,
        this.idTopico,
        idVar
      )
      .subscribe((data) => {
        this.arrEstadisticos = data;
      });
  }
  // ? selects habilitados MDEA
  isSelectEnabled_Subc: boolean = false;
  isSelectEnabled_Top: boolean = false;
  isSelectEnabled_Var: boolean = false;
  isSelectEnabled_Est: boolean = false;

  isSelectEnabled_Nivel: boolean = false;
  isSelectEnabled_Comentario: boolean = false;

  @ViewChild('subcomponenteSelect')
  subcomponenteSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('topicoSelect') topicoSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('variableSelect') variableSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('estadisticoSelect')
  estadisticoSelect!: ElementRef<HTMLSelectElement>;
  //! onSelects
  onSelectComponente(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const _idComponente = selectElement.value;
    this.idComponente = _idComponente;

    //* limpieza de selects
    this.isSelectEnabled_Subc = true;
    const conSubSelect = this.subcomponenteSelect
      .nativeElement as HTMLSelectElement;
    conSubSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrSubcompo = []; // Limpiar el array de subcomponentes

    this.isSelectEnabled_Top = false;
    const conTopSelect = this.topicoSelect.nativeElement as HTMLSelectElement;
    conTopSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrTopicos = []; // Limpiar el array de tópicos

    this.isSelectEnabled_Var = false;
    const conVarSelect = this.variableSelect.nativeElement as HTMLSelectElement;
    conVarSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrVariables = []; // Limpiar el array de variables

    this.isSelectEnabled_Est = false;
    const conEstSelect = this.estadisticoSelect
      .nativeElement as HTMLSelectElement;
    conEstSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrEstadisticos = []; // Limpiar el array de estadísticos

    this.getSubcomponentes(_idComponente);
  }

  onSelectSubcomponente(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const idSubcomponente = selectElement.value;
    this.idSubcomponente = idSubcomponente;

    this.isSelectEnabled_Top = true;

    const conTopSelect = this.topicoSelect.nativeElement as HTMLSelectElement;
    conTopSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrTopicos = [];

    this.isSelectEnabled_Var = false;
    const conVarSelect = this.variableSelect.nativeElement as HTMLSelectElement;
    conVarSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrVariables = []; // Limpiar el array de variables

    this.isSelectEnabled_Est = false;
    const conEstSelect = this.estadisticoSelect
      .nativeElement as HTMLSelectElement;
    conEstSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrEstadisticos = []; // Limpiar el array de estadísticos

    if (this.idSubcomponente == '-') {
      //! Forzar visualmente el cambio en el otro select cuando se selecciona el valor '-' en subcomponente

      console.log('entre a hacer el cambiio');
      this.topicoSelect.nativeElement.value = '-';
      this.variableSelect.nativeElement.value = '-';
      this.estadisticoSelect.nativeElement.value = '-';

      this.idTopico = '-';
      this.idVariableMDEAPULL = '-';
      this.idEstadistico = '-';

      this.isSelectEnabled_Var = true;
      this.isSelectEnabled_Est = true;
      this.isSelectEnabled_Nivel = true;

      this.arrTopicos = [];
      this.arrVariables = [];
      this.arrEstadisticos = [];

      return;
    }

    this.getTopicos(idSubcomponente);
  }

  onSelectTopico(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const idTopico = selectElement.value;
    this.idTopico = idTopico;

    this.isSelectEnabled_Var = true;

    const conVarSelect = this.variableSelect.nativeElement as HTMLSelectElement;
    conVarSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrVariables = []; // Limpiar el array de variables

    this.isSelectEnabled_Est = false;
    const conEstSelect = this.estadisticoSelect
      .nativeElement as HTMLSelectElement;
    conEstSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrEstadisticos = []; // Limpiar el array de estadísticos

    if (this.idTopico == '-') {
      //! Forzar visualmente el cambio en el otro select cuando se selecciona el valor '-' en subcomponente

      this.variableSelect.nativeElement.value = '-';
      this.estadisticoSelect.nativeElement.value = '-';

      this.idVariableMDEAPULL = '-';
      this.idEstadistico = '-';

      this.isSelectEnabled_Est = true;
      this.isSelectEnabled_Nivel = true;

      this.arrVariables = [];
      this.arrEstadisticos = [];

      return;
    }

    this.getVariables(idTopico);
  }

  onSelectVariable(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const idVariable = selectElement.value;
    this.idVariableMDEAPULL = idVariable;

    this.isSelectEnabled_Est = true;

    const conEstSelect = this.estadisticoSelect
      .nativeElement as HTMLSelectElement;
    conEstSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrEstadisticos = []; // Limpiar el array de estadísticos

    if (this.idVariableMDEAPULL == '-') {
      //! Forzar visualmente el cambio en el otro select cuando se selecciona el valor '-' en subcomponente

      this.estadisticoSelect.nativeElement.value = '-';
      this.idEstadistico = '-';

      this.arrEstadisticos = [];

      this.isSelectEnabled_Nivel = true;

      return;
    }

    this.getEstadisticos(idVariable);
  }

  onSelectEstadistico(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const idEstadistico = Number(selectElement.value);
    this.idEstadistico = idEstadistico;
    console.log('Estadistico seleccionado:', idEstadistico);

    this.isSelectEnabled_Nivel = true;
  }

  onSelectNivel(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const nivel = selectElement.value;
    this.nivelContribucionContenidosMdeaRelation = nivel;
    console.log('nivel: ', this.nivelContribucionContenidosMdeaRelation);
    this.isSelectEnabled_Comentario = true;
  }

  // ! ODS RELATION
  _odsServices = inject(OdsService);
  arrODS: any[] = [];
  arrMetas: any[] = [];
  arrIndicadores: any[] = [];

  idObjetivo: number | string = '';
  idMeta: number | string = '';
  idIndicador: number | string = '';
  getObjetivos() {
    this._odsServices.getObjetivos().subscribe((data) => {
      this.arrODS = data;
    });
  }
  getMetas(idObj: number | string) {
    this._odsServices.getMetas(idObj).subscribe((data) => {
      this.arrMetas = data;
    });
  }
  getIndicadores(idMeta: number | string) {
    this._odsServices
      .getIndicadores(this.idObjetivo, idMeta)
      .subscribe((data) => {
        this.arrIndicadores = data;
      });
  }

  _ods_isSelectEnabled_Nivel: boolean = false;
  _ods_isSelectEnabled_Comentario: boolean = false;
  // ? selects habilitados ODS
  isSelectEnabled_Meta: boolean = false;
  isSelectEnabled_Ind: boolean = false;
  @ViewChild('metaSelect') metaSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('indicadorSelect')
  indicadorSelect!: ElementRef<HTMLSelectElement>;
  //! onSelects
  onSelectObjetivo(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const idObjetivo = selectElement.value;
    this.idObjetivo = idObjetivo;
    console.log('Objetivo seleccionado:', idObjetivo);

    //* limpieza de selects
    this.isSelectEnabled_Meta = true;
    const conMetaSelect = this.metaSelect.nativeElement as HTMLSelectElement;
    conMetaSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrMetas = []; // Limpiar el array de metas

    this.isSelectEnabled_Ind = false;
    const conIndSelect = this.indicadorSelect
      .nativeElement as HTMLSelectElement;
    conIndSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrIndicadores = []; // Limpiar el array de indicadores

    this.getMetas(idObjetivo);
  }

  onSelectMeta(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const idMeta = selectElement.value;
    this.idMeta = idMeta;
    console.log('Meta seleccionada:', idMeta);
    this.isSelectEnabled_Ind = true;

    const conIndSelect = this.indicadorSelect
      .nativeElement as HTMLSelectElement;
    conIndSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrIndicadores = []; // Limpiar el array de indicadores

    if (this.idMeta == '-') {
      //! Forzar visualmente el cambio en el otro select cuando se selecciona el valor '-' en subcomponente

      console.log('entre a hacer el cambiio');
      this.indicadorSelect.nativeElement.value = '-';

      this.idIndicador = '-';

      this.arrIndicadores = [];
      this.isSelectEnabled_Ind = true;
      this._ods_isSelectEnabled_Nivel = true;

      return;
    }

    this.getIndicadores(idMeta);
  }
  onSelectIndicador(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const idIndicador = selectElement.value;
    this.idIndicador = idIndicador;
    console.log('Indicador seleccionado:', idIndicador);
    this._ods_isSelectEnabled_Nivel = true;
  }
  _ods_onSelectNivel(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const nivel = selectElement.value;
    this._ods_nivelContribucion = nivel;
    console.log('nivel: ', this._ods_nivelContribucion);

    this.isSelectEnabled_Comentario = true;
  }

  // ! Captura variable
  // ! VARIABLE CAMPOS
  _idFuente: number = 0;
  _idPp: string = '';
  _responsableRegister: number | null = null;
  _anioEvento: string = '';

  getPropetiesLocalStorage() {
    const storeFuente = localStorage.getItem('fuenteEditable');
    const _responsableRegister = localStorage.getItem('_id');

    if (storeFuente) {
      const fuente = JSON.parse(storeFuente);
      this._idFuente = fuente.idFuente;
      this._idPp = fuente.idPp;
      this._responsableRegister = Number(_responsableRegister!);
      this._anioEvento = fuente.anioEvento;

      console.log('_idFuente:', this._idFuente);
      console.log('_idPp:', this._idPp);
      console.log('_responsableRegister:', this._responsableRegister);
      console.log('_anioEvento:', this._anioEvento);

      this.getVarInNewVars(this._idFuente, this._responsableRegister);
    } else {
      console.error('No se encontró el elemento en localStorage');
    }
  }

  _varService = inject(VariableService);
  arrVARIABLES_REGISTER: any[] = [];

  _pP_idVar: string = '';

  getVarInNewVars(idFuente: number, responsableRegister: number) {
    this._pP_idVar = this._idPp + '-';
    this.idVariable = this._pP_idVar;
    const responsableParsed = Number(responsableRegister);

    this._varService.getVars(responsableParsed, idFuente).subscribe((data) => {
      console.log('Variables List:', data);
      this.arrVARIABLES_REGISTER = data;
    });
  }

  idVariable: string = '';
  nombreVariable: string = '';
  definicionVariable: string = '';
  comentarioVariable: string = '-';
  _linkVar: string = '';
  relacion_Mdea: boolean = this.flagMDEArelation;
  relacion_Ods: boolean = this.flagODSrelation;
  varSerieAnio: string = '';

  crearVarInNewVars() {
    const nuevaVariable: VariableDTO = {
      idVariable: this.idVariable,
      idFuente: this._idFuente,
      idPp: this._idPp,
      nombreVariable: this.nombreVariable,
      definicionVar: this.definicionVariable,
      linkVar: this._linkVar,
      comentarioVar: this.comentarioVariable,
      alineacionMdea: this.flagMDEArelation,
      alineacionOds: this.flagODSrelation,
      responsableRegister: this._responsableRegister!,
      varSerieAnio: this.idVariable + '-' + this._anioEvento,
    };

    this._varService
      .crearVar(nuevaVariable)
      .pipe(
        catchError((error) => {
          console.error('❌ Error al crear la variable:', error);

          const mensaje =
            error?.error?.message ||
            'Error inesperado al registrar la variable';
          // Mostrar mensaje de error al usuario (puede ser toast, snackbar, alerta...)
          console.error(mensaje); // ejemplo con ngx-toastr o algo similar

          return of(null); // Evita que se rompa el flujo
        })
      )
      .subscribe((data) => {
        if (!data) return; // Si hubo error, ya fue manejado en catchError

        console.log('✅ Variable registrada:', data);
        console.info('Variable registrada correctamente');
        console.log('props vars: ', nuevaVariable);
      });
  }
  cleanVars() {
    this.idVariable = this._pP_idVar;

    this.nombreVariable = '';
    this.definicionVariable = '';
    this.comentarioVariable = '';
    this._linkVar = '';
    this.flagMDEArelation = false;
    this.flagODSrelation = false;
    this.varSerieAnio = '';

    this.arrSubcompo = []; // Limpiar el array de subcomponentes
    this.arrTopicos = []; // Limpiar el array de tópicos
    this.arrVariables = []; // Limpiar el array de variables
    this.arrEstadisticos = []; // Limpiar el array de estadísticos

    this.arrMetas = []; // Limpiar el array de metas
    this.arrIndicadores = []; // Limpiar el array de indicadores
    this.isSelectEnabled_Subc = false;
    this.isSelectEnabled_Top = false;
    this.isSelectEnabled_Var = false;
    this.isSelectEnabled_Est = false;
    this.isSelectEnabled_Meta = false;
    this.isSelectEnabled_Ind = false;
    this.flagMDEArelation = false;
    this.flagODSrelation = false;
    this.showWarning = false;

    this.getVarInNewVars(this._idFuente, this._responsableRegister!);
  }

  //! relacion mdea VARIABLES
  nivelContribucionContenidosMdeaRelation: string = '';
  comentariopullMdea: string = '';

  _relacionService = inject(CapturaMdeaVarService);
  registrarRelacion() {
    if (!this.comentariopullMdea) {
      alert('Por favor, selecciona');
      return;
    }
    const nuevaRelacion: RelationVarWhitMDEA = {
      idVariableUnique: 1,
      idVariable: 'ATUS-100',

      idComponente: this.idComponente.toString(),
      idSubcomponente: this.idSubcomponente.toString(),
      idTopico: this.idTopico.toString(),
      idVariableMdeaPull: this.idVariableMDEAPULL,
      idEstadistico: this.idEstadistico.toString(),
      nivelContribucion: this.nivelContribucionContenidosMdeaRelation,
      comentarioRelacionMdea: this.comentariopullMdea,
      idVarCaracterizada: 'ATUS-100-2024',
    };

    this._relacionService
      .registrarRelacion(nuevaRelacion)
      .pipe(
        catchError((error) => {
          console.error('❌ Error al registrar la relación:', error);
          return of(null); // Evita que se rompa el flujo
        })
      )
      .subscribe((respuesta) => {
        if (respuesta) {
          console.log('✅ Relación registrada correctamente:', respuesta);
          this.resetRelationMDEA_SELECTS();

          // Aquí podrías resetear el formulario o notificar al usuario
        } else {
          console.warn('⚠️ No se pudo registrar la relación.');
        }
      });
  }
  resetRelationMDEA_SELECTS() {
    this.arrComponentes = [];
    this.getComponentes();

    this.arrSubcompo = []; // Limpiar el array de subcomponentes
    this.arrTopicos = []; // Limpiar el array de tópicos
    this.arrVariables = []; // Limpiar el array de variables
    this.arrEstadisticos = []; // Limpiar el array de estadísticos
    this.nivelContribucionContenidosMdeaRelation = '';
    this.comentariopullMdea = '';

    this.isSelectEnabled_Subc = false;
    this.isSelectEnabled_Top = false;
    this.isSelectEnabled_Var = false;
    this.isSelectEnabled_Est = false;
    this.isSelectEnabled_Nivel = false;
    this.isSelectEnabled_Comentario = false;

    this.getRelation_MDEA_Var();
  }
  resetRelationODS_SELECTS() {
    this.arrODS = [];
    this.getObjetivos();

    this.arrMetas = []; // Limpiar el array de metas
    this.arrIndicadores = []; // Limpiar el array de indicadores
    this._ods_nivelContribucion = '';
    this._ods_comentarioRelacionODS = '';

    this.isSelectEnabled_Meta = false;
    this.isSelectEnabled_Ind = false;
    this._ods_isSelectEnabled_Nivel = false;
    this._ods_isSelectEnabled_Comentario = false;
    this.obtenerRelaciones_ods();
  }

  relationesMDEA: any[] = [];
  getRelation_MDEA_Var() {
    this._relacionService.getRelacionesPorVariable(1).subscribe((response) => {
      console.log('relaciones: ', response);
      this.relationesMDEA = response;
    });
  }

  eliminarRelacionesMDEAWhitVars(idRelacion: number) {
    this._relacionService.eliminarRelacion(idRelacion).subscribe({
      next: () => {
        console.log('Relación eliminada con éxito');
        this.getRelation_MDEA_Var();
        // Puedes actualizar tu lista aquí
      },
      error: (err) => {
        console.error('Error al eliminar relación:', err);
      },
    });
  }

  @ViewChild('miModal') miModal!: ElementRef<HTMLDialogElement>;

  abrirModal() {
    if (this.miModal && this.miModal.nativeElement) {
      this.miModal.nativeElement.showModal();
    }
  }

  accionPersonalizada() {
    this.primeraInteraccion = false;

    // Aquí deshabilitas los inputs que ya fueron registrados si es necesario
    this.deshabilitarCamposRelacionados();

    this.enableTEMA_COBERTURA();

    this.crearVarInNewVars();

    // Cierra el modal
    const modal = document.getElementById('mi_modal_1') as HTMLDialogElement;
    modal?.close();
  }

  camposBloqueados: boolean = false;
  showPOST_RELATIONES_MDE: boolean = false;
  showPOST_RELATIONES_ODS: boolean = false;
  deshabilitarCamposRelacionados() {
    // Puedes dejar banderas que te permitan deshabilitar inputs con [disabled] en el HTML
    this.camposBloqueados = true;

    if (this.flagMDEArelation) {
      console.log('entre a mdea relacion');
      this.showPOST_RELATIONES_MDE = true;
    }
    if (this.flagODSrelation) {
      console.log('entre a ods relacion');
      this.showPOST_RELATIONES_ODS = true;
    }
  }
  primeraInteraccion: boolean = true; // bandera general para el modal
  modalDisparadoDesde: 'MDEA' | 'ODS' | 'comentario' | null = null;
  onComentarioClick(event: Event) {
    if (
      !this.nombreVariable ||
      !this.definicionVariable ||
      !this._linkVar ||
      !this.comentarioVariable
    ) {
      alert('Por favor, captura los datos faltantes primero');
      return;
    }
    if (this.primeraInteraccion) {
      event.preventDefault();
      this.modalDisparadoDesde = 'comentario';
      this.abrirModalGeneral();
    }
  }
  abrirModalGeneral() {
    const modal = document.getElementById('mi_modal_1') as HTMLDialogElement;
    modal?.showModal();
  }
  DISABLE_temaCobertura: boolean = true;
  enableTEMA_COBERTURA() {
    this.DISABLE_temaCobertura = false;
  }
  relacionesODS: RelacionODS[] = [];
  _service_relation_ODS_VAR = inject(relacionODS_Service);

  obtenerRelaciones_ods() {
    this._service_relation_ODS_VAR.getRelacionesPorVariable_ods(1).subscribe({
      next: (res) => {
        console.log('Datos recibidos en obtenerRelaciones_ods():', res);
        this.relacionesODS = res;
      },
      error: (err) => console.error('Error obteniendo relaciones:', err),
    });
  }

  eliminarRelacion(id: number) {
    this._service_relation_ODS_VAR.eliminarRelacion_ods(id).subscribe({
      next: () => {
        console.log(`Relación con id ${id} eliminada correctamente`);
        this.obtenerRelaciones_ods(); // Refresca la lista automáticamente
      },
      error: (err) => console.error('Error eliminando relación:', err),
    });
  }
  _ods_nivelContribucion: string = '';
  _ods_comentarioRelacionODS: string = '';

  registrarNuevaRelacion() {
    if (!this._ods_comentarioRelacionODS) {
      alert('Por favor, selecciona');
      return;
    }
    const nuevaRelacion: RelacionODS = {
      idVariableUnique: 1,
      idVariable: 'ATUS-001',
      idVarCaracterizada: 'ATUS-001-2024',
      idObj: this.idObjetivo.toString(),
      idMeta: this.idMeta.toString(),
      idIndicador: this.idIndicador.toString(),
      nivelContribucion: this._ods_nivelContribucion,
      comentarioRelacionODS: this._ods_comentarioRelacionODS,
    };

    this._service_relation_ODS_VAR
      .registrarRelacion_ods(nuevaRelacion)
      .subscribe({
        next: (res) => {
          console.log('Relacion creada:', res);
          this.resetRelationODS_SELECTS();
        },
        error: (err) => console.error('Error creando relación:', err),
      });
  }
  finalizarCaptura: boolean = true;
  eliminarVariable(id: number) {
    if (confirm('¿Seguro que deseas eliminar esta variable?')) {
      this._varService.deleteVariable(id).subscribe({
        next: () => {
          this.arrVARIABLES_REGISTER = this.arrVARIABLES_REGISTER.filter(
            (v) => v.id !== id
          );
        },
        error: (err) => {
          alert('Error eliminando variable');
          console.error(err);
        },
      });
    }
  }
}

