import { CapturaMdeaVarService } from './../../services/captura-mdea-vars.service';
import { RelacionODS } from '@/variables/interfaces/relationVarWhit_ODS.interface';
import { RelationVarWhitMDEA } from '@/variables/interfaces/relationVarWhitMdea.interface';
import { TemaCobNec } from '@/variables/interfaces/temaCobNec.interface';
import { VariableDTO } from '@/variables/interfaces/variablesCapDTO.interface';

import { relacionODS_Service } from '@/variables/services/captura-ods-vars.service';
import { TemaCobNecService } from '@/variables/services/captura-temaCobNec.service';
import { MdeaService } from '@/variables/services/mdea-pull.service';
import { OdsService } from '@/variables/services/ods-pull.service';
import { VariableService } from '@/variables/services/variables.service';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, first, of } from 'rxjs';

@Component({
  selector: 'app-variable-update',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './variable-update.component.html',
})
export class VariableUpdateComponent implements OnInit, AfterViewInit {
  idA!: string;
  idS: string = '';

  variableData!: VariableDTO;

  nombre: string = '';
  definicion: string = '';
  url: string = '';
  comentarioS: string = '';
  mdea: boolean | undefined = undefined;
  ods: boolean | undefined = undefined;

  pertinencia: string = '';
  contribucion: string = '';
  viabilidad: string = '';
  propuesta: string = '';
  comentarioSP: string = '';

  arrMdea: any[] = [];
  arrOds: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _variableService: VariableService
  ) {}

  mdea_html_hidden: boolean = true;
  ods_html_hidden: boolean = true;

  uniqueSubcomponente: any;
  uniqueTopico: any;
  uniqueEst1: any;
  uniqueEst2: any;
  uniqueIdMeta: any;
  uniqueidIndicador: any;

  ngOnInit(): void {
    this.idA = this.route.snapshot.paramMap.get('idA')!;
    console.log('ID de la variable:', this.idA);
    this.loadVariable();
    this.getComponentes();
    this.getObjetivos();
    this.getPropetiesLocalStorage();
  }
  ngAfterViewInit() {
    // Esto se ejecuta después de que el DOM ya está cargado
    setTimeout(() => {
      this.validacion(); // aquí aseguras evaluar campos autocompletados
    });
  }

  loadVariable() {
    this._variableService.getVariableByIdA(this.idA).subscribe({
      next: (data) => {
        this.variableData = data;
        console.log('Variable cargada:', this.variableData);
        this.idS = this.variableData.idS;
        this.nombre = this.variableData.nombre;
        this.definicion = this.variableData.definicion;
        this.url = this.variableData.url;
        this.comentarioS = this.variableData.comentarioS!;
        this.mdea = this.variableData.mdea;
        this.ods = this.variableData.ods;

        this.mdea_html_hidden = this.variableData.mdea;
        this.ods_html_hidden = this.variableData.ods;

        this.pertinencia = this.variableData.pertinencia!.pertinencia;
        this.contribucion = this.variableData.pertinencia!.contribucion;
        this.viabilidad = this.variableData.pertinencia!.viabilidad;
        this.propuesta = this.variableData.pertinencia!.propuesta;
        this.comentarioSP = this.variableData.pertinencia!.comentarioS;

        this.get_ArrMdea();
        this.get_ArrOds();
        this.validacion();

        // Aquí puedes usar patchValue si usas Reactive Forms
      },
      error: (err) => {
        console.error('Error cargando variable', err);
      },
    });
  }

  _mdeaService = inject(MdeaService);
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

  onSelectComponente(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const _idComponente = selectElement.value;
    this.idComponente = _idComponente;

    console.log('componente', this.idComponente);

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
    const value = selectElement.value; // string

    // Limpieza de niveles dependientes
    this.isSelectEnabled_Top = true;
    this.arrTopicos = [];
    this.topicoSelect.nativeElement.selectedIndex = 0;
    this.idTopico = '';
    this.uniqueTopico = '';

    this.isSelectEnabled_Var = false;
    this.arrVariables = [];
    this.variableSelect.nativeElement.selectedIndex = 0;
    this.idVariableMDEAPULL = '';
    this.uniqueEst1 = '';

    this.isSelectEnabled_Est = false;
    this.arrEstadisticos = [];
    this.estadisticoSelect.nativeElement.selectedIndex = 0;
    this.uniqueEst2 = '';
    this.idEstadistico = '';

    // Caso especial '-'
    if (value === '-') {
      this.uniqueSubcomponente = '-';
      this.idSubcomponente = '-';

      // Forzar visualmente los otros selects
      this.topicoSelect.nativeElement.value = '-';
      this.variableSelect.nativeElement.value = '-';
      this.estadisticoSelect.nativeElement.value = '-';

      this.idTopico = '-';
      this.uniqueTopico = '-';

      this.idVariableMDEAPULL = '-';
      this.uniqueEst1 = '-';

      this.idEstadistico = '-';
      this.uniqueEst2 = '-';

      this.isSelectEnabled_Var = true;
      this.isSelectEnabled_Est = true;
      this.isSelectEnabled_Nivel = true;

      return; // NO llames getTopicos en este caso
    }

    // Si no es '-', debe ser un ID válido
    const id = +value; // a número
    const subcompSeleccionado = this.arrSubcompo.find(
      (s) => s.idSubcomponente === id
    );
    if (!subcompSeleccionado) {
      // Nada que hacer si no lo encontramos
      return;
    }

    this.idSubcomponente = subcompSeleccionado.idSubcomponente;
    this.uniqueSubcomponente = subcompSeleccionado.uniqueId;

    // Carga dependientes
    this.getTopicos(this.idSubcomponente);
  }
  onSelectTopico(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;

    this.isSelectEnabled_Var = true;
    this.arrVariables = [];
    this.variableSelect.nativeElement.selectedIndex = 0;

    this.isSelectEnabled_Est = false;
    this.arrEstadisticos = [];
    this.estadisticoSelect.nativeElement.selectedIndex = 0;

    // Caso especial '-'
    if (value === '-') {
      this.idTopico = '-';
      this.uniqueTopico = '-';

      // Forzar visualmente los otros selects a '-'
      this.variableSelect.nativeElement.value = '-';
      this.estadisticoSelect.nativeElement.value = '-';

      this.idVariableMDEAPULL = '-';
      this.idEstadistico = '-';

      this.isSelectEnabled_Est = true;
      this.isSelectEnabled_Nivel = true;

      // No cargar variables
      return;
    }
    // Parsear ID y validar
    const id = +value; // convierte a número
    if (Number.isNaN(id)) {
      this.idTopico = null as any;
      this.uniqueTopico = null as any;
      return;
    }

    // Buscar el objeto (si necesitas uniqueId)
    const topicoSeleccionado = this.arrTopicos.find((t) => t.idTema === id);
    if (!topicoSeleccionado) {
      this.idTopico = null as any;
      this.uniqueTopico = null as any;
      return;
    }

    this.idTopico = topicoSeleccionado.idTema;
    this.uniqueTopico = topicoSeleccionado.uniqueId;

    // Cargar variables del tema seleccionado
    this.getVariables(this.idTopico);


  }

  onSelectVariable(event: Event) {
    const el = event?.target as HTMLSelectElement | null;
    const value = el?.value ?? null;

    // Habilitar/resetear Estadístico
    this.isSelectEnabled_Est = true;
    this.arrEstadisticos = [];
    this.estadisticoSelect.nativeElement.selectedIndex = 0;

    // Placeholder
    if (value === '__placeholder__' || value === null) {
      // No hacemos nada si elige la opción placeholder
      return;
    }

    // Caso '-'
    if (value === '-') {
      this.idVariableMDEAPULL = '-';
      this.uniqueEst1 = '-';
      this.estadisticoSelect.nativeElement.value = '-';
      this.idEstadistico = '-';
      this.isSelectEnabled_Nivel = true;
      return;
    }


    this.idVariableMDEAPULL = value;

    // (Opcional) obtener uniqueId del objeto si lo necesitas:
    const varSel = (this.arrVariables || []).find((v) => {
      const idA = String((v as any).idEstadistico1 ?? (v as any).idVariable);
      return idA === String(value);
    });
    this.uniqueEst1 = varSel?.uniqueId ?? varSel?.uniqueID ?? null;

    console.log(
      '[onSelectVariable] idVariableMDEAPULL =',
      this.idVariableMDEAPULL,
      ' uniqueEst1 =',
      this.uniqueEst1
    );

    // Llamada final
    this.getEstadisticos(this.idVariableMDEAPULL);
  }

  onSelectEstadistico(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value; // <- obtiene el value directamente

    console.log('[onSelectEstadistico] value:', value);

    // Caso especial: '-'
    if (value === '-') {
      this.idEstadistico = '-';
      this.uniqueEst2 = '-';
      this.isSelectEnabled_Nivel = true; // ⚡️ ahora sí se activa
      return;
    }

    // Parsear ID
    const id = +value; // convierte a número
    if (Number.isNaN(id)) {
      this.idEstadistico = null as any;
      this.uniqueEst2 = null as any;
      return;
    }

    // Buscar el objeto (por si necesitas el uniqueId)
    const est2Seleccionado = this.arrEstadisticos.find(
      (e) => +e.idEstadistico2 === id
    );
    if (!est2Seleccionado) {
      this.idEstadistico = null as any;
      this.uniqueEst2 = null as any;
      return;
    }

    // Asignar valores
    this.idEstadistico = est2Seleccionado.idEstadistico2;
    this.uniqueEst2 = est2Seleccionado.uniqueId;

    console.log('[onSelectEstadistico] idEstadistico:', this.idEstadistico);
    console.log('[onSelectEstadistico] uniqueEst2:', this.uniqueEst2);

    // Habilitar el siguiente nivel
    this.isSelectEnabled_Nivel = true;
  }
  nivelContribucionContenidosMdeaRelation: string = '';

  onSelectNivel(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const nivel = selectElement.value;
    this.nivelContribucionContenidosMdeaRelation = nivel;
    console.log('nivel: ', this.nivelContribucionContenidosMdeaRelation);
    this.isSelectEnabled_Comentario = true;
  }

  getComponentes() {
    this._mdeaService.getComponentes().subscribe((data) => {
      this.arrComponentes = data;
      console.log(data);
    });
  }
  getSubcomponentes(idComponente: number | string) {
    console.log('idComp: ', idComponente);
    this._mdeaService.getSubcomponentes(idComponente).subscribe((data) => {
      console.log(data);
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
        console.log(data);
        this.arrEstadisticos = data;
      });
  }

  _relacionService = inject(CapturaMdeaVarService);
  get_ArrMdea() {
    this._relacionService
      .getRelacionesPorVariable(this.idA!)
      .subscribe((response) => {
        console.log('relaciones: ', response);
        this.arrMdea = response;
        this.validacion();
      });
  }

  delete_relationArrMdea(idRelacion: number) {
    this._relacionService.eliminarRelacion(idRelacion).subscribe({
      next: () => {
        console.log('Relación eliminada con éxito');
        this.get_ArrMdea();
        // Puedes actualizar tu lista aquí
      },
      error: (err) => {
        console.error('Error al eliminar relación:', err);
      },
    });
  }
  comentariopullMdea: string = '';
  registrarRelacion() {
    if (!this.comentariopullMdea) {
      alert('Por favor, selecciona');
      return;
    }
    const nuevaRelacion: RelationVarWhitMDEA = {
      idA: this.idA,
      idS: this.idS,

      componente: this.idComponente.toString(),
      subcomponente: this.uniqueSubcomponente.toString(),
      tema: this.uniqueTopico.toString(),
      estadistica1: this.uniqueEst1,
      estadistica2: this.uniqueEst2.toString(),
      contribucion: this.nivelContribucionContenidosMdeaRelation,
      comentarioS: this.comentariopullMdea,
    };
    console.log('mandando al back: ', nuevaRelacion);

    this._relacionService
      .registrarRelacion(nuevaRelacion)
      .pipe(
        catchError((error) => {
          const mensaje =
            error?.error?.error ||
            'Ocurrió un error inesperado al registrar la relación.';
          console.error('❌ Error al registrar la relación:', mensaje);
          this.mostrarError(mensaje);
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

    this.get_ArrMdea();
  }
  responsableActualizacion: number | undefined = undefined;

  actualizarVariable() {
    const payload: VariableDTO = {
      idA: this.idA,
      idS: this.idS, // Si lo editas, inclúyelo; si no, igual
      idFuente: this.variableData.idFuente,
      acronimo: this.variableData.acronimo,
      nombre: this.nombre,
      definicion: this.definicion,
      url: this.url,
      comentarioS: this.comentarioS,
      mdea: this.mdea!,
      ods: this.ods!,
      // responsableRegister: this.variableData.responsableRegister,
      responsableActualizacion: this.responsableActualizacion, // O el ID del usuario que edita, si lo tienes

      // Estos campos no los usas en backend al editar pero igual los puedes mandar
      // mdeas: this.variableData.mdeas,
      // odsList: this.variableData.odsList,
      // pertinencia: [
      //   // Aquí lo metes como arreglo aunque el backend espera solo uno
      //   {
      //     idA: this.idA,
      //     pertinencia: this.pertinencia,
      //     contribucion: this.contribucion,
      //     viabilidad: this.viabilidad,
      //     propuesta: this.propuesta,
      //     comentarioS: this.comentarioSP,
      //   },
      // ],
    };

    this._variableService.updateVariable(this.idA, payload).subscribe({
      next: (res) => {
        console.log(res.message);
        this.get_ArrMdea();
        this.get_ArrOds();
        this.loadVariable();
        // alert('¡Variable actualizada correctamente!');
      },
      error: (err) => {
        console.error('Error actualizando variable:', err);
        alert('Error al guardar los cambios.');
      },
    });
  }

  _service_relation_ODS_VAR = inject(relacionODS_Service);
  get_ArrOds() {
    this._service_relation_ODS_VAR
      .getRelacionesPorVariable_ods(this.idA!)
      .subscribe({
        next: (res) => {
          console.log('Datos recibidos en obtenerRelaciones_ods():', res);
          this.arrOds = res;
          this.validacion();
        },
        error: (err) => console.error('Error obteniendo relaciones:', err),
      });
  }
  delete_relationArrOds(id: number) {
    this._service_relation_ODS_VAR.eliminarRelacion_ods(id).subscribe({
      next: () => {
        console.log(`Relación con id ${id} eliminada correctamente`);
        this.get_ArrOds(); // Refresca la lista automáticamente
      },
      error: (err) => console.error('Error eliminando relación:', err),
    });
  }
  _odsServices = inject(OdsService);
  arrObjetivo: any[] = [];
  arrMetas: any[] = [];
  arrIndicadores: any[] = [];

  idObjetivo: number | string = '';
  idMeta: number | string = '';
  idIndicador: number | string = '';
  getObjetivos() {
    this._odsServices.getObjetivos().subscribe((data) => {
      this.arrObjetivo = data;
      console.log(data);
    });
  }
  getMetas(idObj: number | string) {
    this._odsServices.getMetas(idObj).subscribe((data) => {
      this.arrMetas = data.sort((a, b) => {
        const isANumber = !isNaN(Number(a.idMeta));
        const isBNumber = !isNaN(Number(b.idMeta));

        if (isANumber && isBNumber) {
          // Ambos son números
          return Number(a.idMeta) - Number(b.idMeta);
        } else if (isANumber) {
          // a es número, b es letra -> a va antes
          return -1;
        } else if (isBNumber) {
          // b es número, a es letra -> b va antes
          return 1;
        } else {
          // Ambos son letras -> orden alfabético
          return a.idMeta.localeCompare(b.idMeta);
        }
      });
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
  @ViewChild('indicadorSelect') indicadorSelect!: ElementRef<HTMLSelectElement>;

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
    const el = event.target as HTMLSelectElement;
    const value = el.value;
    this.isSelectEnabled_Ind = true;
    this.arrIndicadores = [];
    this.indicadorSelect.nativeElement.selectedIndex = 0;
    this.idIndicador = '';
    this.uniqueidIndicador = '';


    if (value === '__placeholder__') {
      return;
    }

    if (value === '-') {
      this.idMeta = '-';
      this.uniqueIdMeta = '-';


      this.indicadorSelect.nativeElement.value = '-';
      this.idIndicador = '-';
      this.uniqueidIndicador = '-';

      this.arrIndicadores = [];
      this.isSelectEnabled_Ind = true;
      this._ods_isSelectEnabled_Nivel = true;

      return;
    }

    this.idMeta = value;

    const metaSeleccionado = (this.arrMetas || []).find(
      (m) => String(m.idMeta) === String(value)
    );
    this.uniqueIdMeta = metaSeleccionado?.uniqueId ?? null;

    console.log(
      '[onSelectMeta] idMeta=',
      this.idMeta,
      ' uniqueIdMeta=',
      this.uniqueIdMeta
    );

    this.getIndicadores(this.idMeta);
  }
  onSelectIndicador(event: Event) {
    const el = event.target as HTMLSelectElement;
    const value = el.value;

    console.log('[onSelectIndicador] value=', value);

    if (value === '__placeholder__') {
      return;
    }

    if (value === '-') {
      this.idIndicador = '-';
      this.uniqueidIndicador = '-';
      this._ods_isSelectEnabled_Nivel = true;
      return;
    }

    this.idIndicador = value;

    const indSel = (this.arrIndicadores || []).find(
      (i) => String(i.idIndicador) === String(value)
    );
    this.uniqueidIndicador = indSel?.uniqueId ?? null;

    console.log(
      '[onSelectIndicador] idIndicador=',
      this.idIndicador,
      ' uniqueidIndicador=',
      this.uniqueidIndicador
    );


    this._ods_isSelectEnabled_Nivel = true;
  }
  _ods_nivelContribucion: string = '';
  _ods_onSelectNivel(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const nivel = selectElement.value;
    this._ods_nivelContribucion = nivel;
    console.log('nivel: ', this._ods_nivelContribucion);

    this._ods_isSelectEnabled_Comentario = true;
  }

  getPropetiesLocalStorage() {
    const storeFuente = localStorage.getItem('fuenteEditable');
    const _responsableRegister = localStorage.getItem('_id');

    if (storeFuente) {
      const fuente = JSON.parse(storeFuente);

      this.responsableActualizacion = Number(_responsableRegister!);
      console.log(
        'Responsable de actualización:',
        this.responsableActualizacion
      );
    } else {
      console.error('No se encontró el elemento en localStorage');
    }
  }

  _ods_comentarioRelacionODS: string = '';
  registrarNuevaRelacion() {
    if (!this._ods_comentarioRelacionODS) {
      alert('Por favor, selecciona');
      return;
    }
    const nuevaRelacion: RelacionODS = {
      idA: this.idA,
      idS: this.idS,

      objetivo: this.idObjetivo.toString(),
      meta: this.uniqueIdMeta,
      indicador: this.uniqueidIndicador,
      contribucion: this._ods_nivelContribucion,
      comentarioS: this._ods_comentarioRelacionODS,
    };

    this._service_relation_ODS_VAR
      .registrarRelacion_ods(nuevaRelacion)
      .subscribe({
        next: (res) => {
          console.log('Relacion creada:', res);
          this.resetRelationODS_SELECTS();
        },
        error: (err) => {
          const mensaje =
            err?.error?.error ||
            'Ocurrió un error al registrar la relación ODS.';
          console.error('❌ Error al registrar la relación ODS:', mensaje);
          this.mostrarError(mensaje);
        },
      });
  }
  resetRelationODS_SELECTS() {
    this.arrObjetivo = [];
    this.getObjetivos();

    this.arrMetas = []; // Limpiar el array de metas
    this.arrIndicadores = []; // Limpiar el array de indicadores
    this._ods_nivelContribucion = '';
    this._ods_comentarioRelacionODS = '';

    this.isSelectEnabled_Meta = false;
    this.isSelectEnabled_Ind = false;
    this._ods_isSelectEnabled_Nivel = false;
    this._ods_isSelectEnabled_Comentario = false;
    this.get_ArrOds();
  }

  _pertinenciaService = inject(TemaCobNecService);

  actualizarPertinencia() {
    const data: TemaCobNec = {
      idA: this.idA,
      pertinencia: this.pertinencia,
      contribucion: this.contribucion,
      viabilidad: this.viabilidad,
      propuesta: this.propuesta,
      comentarioS: this.comentarioSP,
    };
    console.log('Pertinencia que se enviará:', data);

    if (!this.idA) {
      console.error('No hay ID de variable definido');
      return;
    }

    this._pertinenciaService.editarPertinencia(this.idA, data).subscribe({
      next: (res) => {
        console.log('Pertinencia actualizada con éxito:', res);
        // alert('Pertinencia actualizada con éxito');
        // Aquí puedes mostrar un toast, alert o redirigir si quieres
      },
      error: (err) => {
        console.error('Error al actualizar pertinencia:', err);
      },
    });
  }

  actualizarRegistro: boolean = true;
  validacion(): void {
    this.mdea = this.mdea_html_hidden;
    this.ods = this.ods_html_hidden;

    const varNombre = this.nombre.trim();
    const varDefinicion = this.definicion.trim();
    const varUrl = this.url.trim();
    const varComentarioS = this.comentarioS.trim();

    const perPertinencia = this.pertinencia.trim();
    const perContribucion = this.contribucion.trim();
    const perViabilidad = this.viabilidad.trim();
    const perPropuesta = this.propuesta.trim();
    const perComentarioSP = this.comentarioSP.trim();

    const mdeaValido =
      !this.mdea_html_hidden ||
      (Array.isArray(this.arrMdea) && this.arrMdea.length > 0);
    const odsValido =
      !this.ods_html_hidden ||
      (Array.isArray(this.arrOds) && this.arrOds.length > 0);

    this.actualizarRegistro = !(
      varNombre &&
      varDefinicion &&
      varUrl &&
      varComentarioS &&
      perPertinencia &&
      perContribucion &&
      perViabilidad &&
      perPropuesta &&
      perComentarioSP &&
      mdeaValido &&
      odsValido
    );
  }

  @ViewChild('modalGuardado') modalGuardado!: ElementRef<HTMLDialogElement>;
  actualizarTodo() {
    this.actualizarVariable();
    this.actualizarPertinencia();
    console.log('entre');

    this.modalGuardado.nativeElement.showModal();

    // alert('¡Todos los cambios han sido guardados correctamente!');
    // this.router.navigate(['/nueva-variable']);
  }
  checkedMDEA(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.mdea = checkbox.checked;
    this.mdea_html_hidden = this.mdea;

    this.validacion();
  }
  checkedODS(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.ods = checkbox.checked;
    this.ods_html_hidden = this.ods;

    this.validacion();
  }

  irANuevaVariable() {
    this.router.navigate(['/nueva-variable']);
  }
  @ViewChild('modalError') modalError!: ElementRef<HTMLDialogElement>;
  mensajeError: string = '';

  mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    this.modalError.nativeElement.showModal();
  }

  cerrarModalError(): void {
    this.modalError.nativeElement.close();
  }
}
