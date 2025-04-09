import { MdeaService } from '@/variables/services/mdea-pull.service';
import { OdsService } from '@/variables/services/ods-pull.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-nueva-variable',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './nueva-variable.component.html',
})
export class NuevaVariableComponent implements OnInit {
  ngOnInit(): void {
    this.getComponentes();
    this.getObjetivos();
  }

  //! COSAS PARA QUE FUNCIONE MDEA RELATION
  _mdeaService = inject(MdeaService);
  flagMDEArelation: boolean = false;

  //? para el warning MDEA o ODS
  showWarning: boolean = false;
  currentDeactivation: { type: 'MDEA' | 'ODS'; name: string } | null = null;

  //? seguro de eliminar ALERT
  checkedAliniationMDEA(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const newValue = checkbox.checked;
    //! Si está intentando desactivar (de true a false)
    if (this.flagMDEArelation && !newValue) {
      event.preventDefault(); // Prevenir el cambio
      this.currentDeactivation = { type: 'MDEA', name: 'MDEA' };

      this.showWarning = true;
    } else if (!this.flagMDEArelation && newValue) {
      //! Activación directa (sin confirmación)
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

    console.log(this.flagODSrelation,'noma')
  }

  // ? WARNING ACEPTAR
  confirmDeactivation() {
    if (this.currentDeactivation) {
      if (this.currentDeactivation.type === 'MDEA') {
        this.flagMDEArelation = false;
      } else {
        this.flagODSrelation = false;
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
      console.log('Componentes:', data);
      this.arrComponentes = data;
    });
  }
  getSubcomponentes(idComp: number | string) {
    this._mdeaService.getSubcomponentes(idComp).subscribe((data) => {
      console.log('Subcomponentes:', data);
      this.arrSubcompo = data;
    });
  }
  getTopicos(idSub: number | string) {
    this._mdeaService.getTopicos(this.idComponente, idSub).subscribe((data) => {
      console.log('Topicos:', data);
      this.arrTopicos = data;
    });
  }

  getVariables(idTop: number | string) {
    this._mdeaService
      .getVariables(this.idComponente, this.idSubcomponente, idTop)
      .subscribe((data) => {
        console.log('Variables:', data);
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
        console.log('Estadisticos:', data);
        this.arrEstadisticos = data;
      });
  }
  // ? selects habilitados MDEA
  isSelectEnabled_Subc: boolean = false;
  isSelectEnabled_Top: boolean = false;
  isSelectEnabled_Var: boolean = false;
  isSelectEnabled_Est: boolean = false;

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
    console.log('Componente seleccionado:', _idComponente);

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
    console.log('Subcomponente seleccionado:', idSubcomponente);
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

      this.isSelectEnabled_Var = true;
      this.isSelectEnabled_Est = true;

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
    console.log('Topico seleccionado:', idTopico);
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

      console.log('entre a hacer el cambiio');
      this.variableSelect.nativeElement.value = '-';
      this.estadisticoSelect.nativeElement.value = '-';

      this.isSelectEnabled_Est = true;

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
    console.log('Variable seleccionada:', idVariable);
    this.isSelectEnabled_Est = true;

    const conEstSelect = this.estadisticoSelect
      .nativeElement as HTMLSelectElement;
    conEstSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrEstadisticos = []; // Limpiar el array de estadísticos

    if (this.idVariableMDEAPULL == '-') {
      //! Forzar visualmente el cambio en el otro select cuando se selecciona el valor '-' en subcomponente

      console.log('entre a hacer el cambiio');
      this.estadisticoSelect.nativeElement.value = '-';

      this.arrEstadisticos = [];

      return;
    }

    this.getEstadisticos(idVariable);
  }

  onSelectEstadistico(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const idEstadistico = Number(selectElement.value);
    this.idEstadistico = idEstadistico;
    console.log('Estadistico seleccionado:', idEstadistico);
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
      console.log('Objetivos:', data);
      this.arrODS = data;
    });
  }
  getMetas(idObj: number | string) {
    console.log('idObj:', idObj);
    this._odsServices.getMetas(idObj).subscribe((data) => {
      console.log('Metas:', data);
      this.arrMetas = data;
    });
  }
  getIndicadores(idMeta: number | string) {
    this._odsServices
      .getIndicadores(this.idObjetivo, idMeta)
      .subscribe((data) => {
        console.log('Indicadores:', data);
        this.arrIndicadores = data;
      });
  }
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

      this.arrIndicadores = [];

      return;
    }

    this.getIndicadores(idMeta);
  }
  onSelectIndicador(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const idIndicador = selectElement.value;
    this.idIndicador = idIndicador;
    console.log('Indicador seleccionado:', idIndicador);
  }

  // ! Captura variable
  // ! VARIABLE CAMPOS
  idVariable: string = 'ATUS-001';
  nombreVariable: string = 'fake';
  definicionVariable: string = 'fake definicion';
  comentarioVariable: string = 'fake comentario';
  relacion_Mdea: boolean = this.flagMDEArelation;
  relacion_Ods: boolean = this.flagODSrelation;

  consoleLogs() {
    const relajoMdea = this.flagMDEArelation
    const relajoOds = this.flagODSrelation
    console.log('idVariable:', this.idVariable);
    // ! idFuente
    // ! idPp
    console.log('nombreVariable:', this.nombreVariable);
    console.log('definicionVariable:', this.definicionVariable);
    console.log('comentarioVariable:', this.comentarioVariable);
    console.log('relacion_Mdea:', relajoMdea);
    console.log('relacion_Ods:', relajoOds);
    // ! responsableRegister


  }
  // ! Boton guardar
  guardarVariable() {
    this.consoleLogs();
  }
}
