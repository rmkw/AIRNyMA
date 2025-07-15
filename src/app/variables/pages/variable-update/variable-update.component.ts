import { RelationVarWhitMDEA } from '@/variables/interfaces/relationVarWhitMdea.interface';
import { VariableDTO } from '@/variables/interfaces/variablesCapDTO.interface';
import { CapturaMdeaVarService } from '@/variables/services/captura-mdea-vars.service';
import { MdeaService } from '@/variables/services/mdea-pull.service';
import { VariableService } from '@/variables/services/variables.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, first, of } from 'rxjs';

@Component({
  selector: 'app-variable-update',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './variable-update.component.html',
})
export class VariableUpdateComponent implements OnInit {
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
    private _variableService: VariableService
  ) {}

  mdea_html_hidden: boolean = true;
  ods_html_hidden: boolean = true;

  ngOnInit(): void {
    this.idA = this.route.snapshot.paramMap.get('idA')!;
    console.log('ID de la variable:', this.idA);
    this.loadVariable();
    this.getComponentes();
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

        this.pertinencia = this.variableData.pertinencia!.pertinencia;
        this.contribucion = this.variableData.pertinencia!.contribucion;
        this.viabilidad = this.variableData.pertinencia!.viabilidad;
        this.propuesta = this.variableData.pertinencia!.propuesta;
        this.comentarioSP = this.variableData.pertinencia!.comentarioS;

        this.get_ArrMdea();

        // Aquí puedes usar patchValue si usas Reactive Forms
      },
      error: (err) => {
        console.error('Error cargando variable', err);
      },
    });
  }

  _mdeaService = inject(MdeaService);
  arrComponentes: any[] = [];
  arrSubcomponente: any[] = [];
  arrTemas: any[] = [];
  arrEstadistica1: any[] = [];
  arrEstadistica2: any[] = [];

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
    this.arrSubcomponente = []; // Limpiar el array de subcomponentes

    this.isSelectEnabled_Top = false;
    const conTopSelect = this.topicoSelect.nativeElement as HTMLSelectElement;
    conTopSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrTemas = []; // Limpiar el array de tópicos

    this.isSelectEnabled_Var = false;
    const conVarSelect = this.variableSelect.nativeElement as HTMLSelectElement;
    conVarSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrEstadistica1 = []; // Limpiar el array de variables

    this.isSelectEnabled_Est = false;
    const conEstSelect = this.estadisticoSelect
      .nativeElement as HTMLSelectElement;
    conEstSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrEstadistica2 = []; // Limpiar el array de estadísticos

    this.getSubcomponentes(_idComponente);
  }
  onSelectSubcomponente(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const idSubcomponente = selectElement.value;
    this.idSubcomponente = idSubcomponente;

    this.isSelectEnabled_Top = true;

    const conTopSelect = this.topicoSelect.nativeElement as HTMLSelectElement;
    conTopSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrTemas = [];

    this.isSelectEnabled_Var = false;
    const conVarSelect = this.variableSelect.nativeElement as HTMLSelectElement;
    conVarSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrEstadistica1 = []; // Limpiar el array de variables

    this.isSelectEnabled_Est = false;
    const conEstSelect = this.estadisticoSelect
      .nativeElement as HTMLSelectElement;
    conEstSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrEstadistica2 = []; // Limpiar el array de estadísticos

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

      this.arrTemas = [];
      this.arrEstadistica1 = [];
      this.arrEstadistica2 = [];

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
    this.arrEstadistica1 = []; // Limpiar el array de variables

    this.isSelectEnabled_Est = false;
    const conEstSelect = this.estadisticoSelect
      .nativeElement as HTMLSelectElement;
    conEstSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrEstadistica2 = []; // Limpiar el array de estadísticos

    if (this.idTopico == '-') {
      //! Forzar visualmente el cambio en el otro select cuando se selecciona el valor '-' en subcomponente

      this.variableSelect.nativeElement.value = '-';
      this.estadisticoSelect.nativeElement.value = '-';

      this.idVariableMDEAPULL = '-';
      this.idEstadistico = '-';

      this.isSelectEnabled_Est = true;
      this.isSelectEnabled_Nivel = true;

      this.arrEstadistica1 = [];
      this.arrEstadistica2 = [];

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
    this.arrEstadistica2 = []; // Limpiar el array de estadísticos

    if (this.idVariableMDEAPULL == '-') {
      //! Forzar visualmente el cambio en el otro select cuando se selecciona el valor '-' en subcomponente

      this.estadisticoSelect.nativeElement.value = '-';
      this.idEstadistico = '-';

      this.arrEstadistica2 = [];

      this.isSelectEnabled_Nivel = true;

      return;
    }

    this.getEstadisticos(idVariable);
  }

  onSelectEstadistico(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const idEstadistico = selectElement.value;
    this.idEstadistico = idEstadistico;
    console.log('Estadistico seleccionado:', idEstadistico);

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
      this.arrSubcomponente = data;
    });
  }
  getTopicos(idSub: number | string) {
    this._mdeaService.getTopicos(this.idComponente, idSub).subscribe((data) => {
      this.arrTemas = data;
    });
  }

  getVariables(idTop: number | string) {
    this._mdeaService
      .getVariables(this.idComponente, this.idSubcomponente, idTop)
      .subscribe((data) => {
        this.arrEstadistica1 = data;
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
        this.arrEstadistica2 = data;
      });
  }

  _relacionService = inject(CapturaMdeaVarService);
  get_ArrMdea() {
    this._relacionService
      .getRelacionesPorVariable(this.idA!)
      .subscribe((response) => {
        console.log('relaciones: ', response);
        this.arrMdea = response;
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
      subcomponente: this.idSubcomponente.toString(),
      tema: this.idTopico.toString(),
      estadistica1: this.idVariableMDEAPULL,
      estadistica2: this.idEstadistico.toString(),
      contribucion: this.nivelContribucionContenidosMdeaRelation,
      comentarioS: this.comentariopullMdea,
    };
    console.log('mandando al back: ', nuevaRelacion);

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

    this.arrSubcomponente = []; // Limpiar el array de subcomponentes
    this.arrTemas = []; // Limpiar el array de tópicos
    this.arrEstadistica1 = []; // Limpiar el array de variables
    this.arrEstadistica2 = []; // Limpiar el array de estadísticos
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
      responsableActualizacion: 1, // O el ID del usuario que edita, si lo tienes

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
        alert('¡Variable actualizada correctamente!');
      },
      error: (err) => {
        console.error('Error actualizando variable:', err);
        alert('Error al guardar los cambios.');
      },
    });
  }
}
