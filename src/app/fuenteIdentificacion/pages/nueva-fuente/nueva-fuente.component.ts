
import { FuenteIdentificacionService } from '@/fuenteIdentificacion/services/fuente-identificacion.service';
import { MdeaService } from '@/variables/services/mdea-pull.service';
import { PpEconomicas } from '@/procesoProduccion/interfaces/ppEco-responce.interface';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { catchError, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-nueva-fuente',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './nueva-fuente.component.html',
})
export class NuevaFuenteComponent implements OnInit {
  _fuenteIServive = inject(FuenteIdentificacionService);
  _ppEcoService = inject(ppEcoService);
  _mdeaService = inject(MdeaService);

  ppEco = signal<PpEconomicas[]>([]);
  procesoSeleccionado = signal<PpEconomicas | null>(null);

  ppEcoResource = rxResource({
    request: () => ({}),
    loader: ({ request }) => {
      return this._ppEcoService.getPpEcos().pipe(
        tap((data) => {
          this.ppEco.set(Array.isArray(data) ? data : []);
        })
      );
    },
  });

  fuente = '';
  linkFuente = '';
  anioEvento = '';
  comentarioF = '';

  flagVarButton: boolean = true;

  seleccionarProceso(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const procesoId = selectElement.value;

    const procesoEncontrado =
      this.ppEco().find((proceso) => proceso.acronimo === procesoId) || null;
    this.procesoSeleccionado.set(procesoEncontrado);
  }

  nuevaFuente() {
    if (!this.procesoSeleccionado()) {
      console.error('Por favor, selecciona un proceso de producción');
      // alert('Por favor, selecciona un proceso de producción');
      return;
    }

    if (
      !this.fuente ||
      !this.linkFuente ||
      !this.anioEvento ||
      !this.comentarioF
    ) {
      console.error('Todos los campos son obligatorios');
      // alert('Por favor, completa todos los campos');
      return;
    }

    const datosFuente = {
      acronimo: this.procesoSeleccionado()?.acronimo || '',
      fuente: this.fuente,
      url: this.linkFuente,
      edicion: this.anioEvento,
      comentarioS: this.comentarioF,
    };

    console.log('Datos a registrar:', datosFuente);

    this._fuenteIServive.registrarFuente(datosFuente).subscribe(
      (response) => {
        if (response) {
          console.log('Fuente registrada exitosamente', response);
          alert('Fuente registrada exitosamente');
          this.flagVarButton = true;
          // this.limpiarFormulario();
        } else {
          console.error('Hubo un error al registrar la fuente');
          alert('Hubo un error al registrar la fuente');
        }
      },
      (error) => {
        console.error('Error en la solicitud', error);
        alert('Ocurrió un error al intentar registrar la fuente');
      }
    );
  }

  limpiarFormulario() {
    this.fuente = '';
    this.linkFuente = '';
    this.anioEvento = '';
    this.comentarioF = '';
    this.procesoSeleccionado.set(null); // Restablecer el proceso seleccionado
  }

  idVariable: string = '';
  nombreVariable: string = '';
  definicionVariable: string = '';
  comentarioVariable: string = '';
  alinea_MDEA: string = '';
  alinea_ODS: string = '';

  flagMDEArelation: boolean = false;
  showWarning: boolean = false;

  currentDeactivation: { type: 'MDEA' | 'ODS'; name: string } | null = null;

  checkedAliniationMDEA(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const newValue = checkbox.checked;

    // Si está intentando desactivar (de true a false)
    if (this.flagMDEArelation && !newValue) {
      event.preventDefault(); // Prevenir el cambio
      this.currentDeactivation = { type: 'MDEA', name: 'MDEA' };

      this.showWarning = true;
    } else if (!this.flagMDEArelation && newValue) {
      // Activación directa (sin confirmación)
      this.flagMDEArelation = true;
      this.showWarning = false;
    }
  }

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

  flagODSrelation: boolean = false;
  pendingDeactivationODS: boolean = false;

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

  ngOnInit(): void {
    this.getComponentes();
  }

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

  //! funciones control
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

  isSelectEnabled_Subc: boolean = false;
  isSelectEnabled_Top: boolean = false;
  isSelectEnabled_Var: boolean = false;
  isSelectEnabled_Est: boolean = false;

  //! onSelects
  onSelectComponente(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const _idComponente = selectElement.value;
    this.idComponente = _idComponente;
    console.log('Componente seleccionado:', _idComponente);

    //* limpieza de selects
    this.isSelectEnabled_Subc = true;
    const conSubSelect = this.subcomponenteSelect.nativeElement as HTMLSelectElement;
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
    const conEstSelect = this.estadisticoSelect.nativeElement as HTMLSelectElement;
    conEstSelect.selectedIndex = 0; // Resetear el índice seleccionado
    this.arrEstadisticos = []; // Limpiar el array de estadísticos


    this.getSubcomponentes(_idComponente);
  }

  @ViewChild('subcomponenteSelect') subcomponenteSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('topicoSelect') topicoSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('variableSelect') variableSelect!: ElementRef<HTMLSelectElement>;
  @ViewChild('estadisticoSelect') estadisticoSelect!: ElementRef<HTMLSelectElement>;

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
    const conEstSelect = this.estadisticoSelect.nativeElement as HTMLSelectElement;
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
}
