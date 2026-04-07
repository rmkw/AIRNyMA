import { authService } from '@/auth/services/auth.service';
import { FuenteIdentificacionService } from '@/fuenteIdentificacion/services/fuente-identificacion.service';
import { interface_ProcesoP } from '@/procesoProduccion/interfaces/procesos.interface';
import { DireccionesService } from '@/procesoProduccion/services/direcciones.service';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { TemaSubtemaDTO } from '@/variables/interfaces/armonizacion/tema_subtema/temasubtema.interface';
import { Direccion } from '@/variables/interfaces/direcciones.interface';
import { FuenteSaveDTO } from '@/variables/interfaces/fuenteArmonizacion.interface';
import { TematicaDTO } from '@/variables/interfaces/tematicas_temas/tematicaDTO.interface';
import { VariableTablaDTO } from '@/variables/interfaces/variableTablaDTO';
import { VariablesArmoService } from '@/variables/services/armonizacion/variables-armo.service';
import { TemasSubtemasService } from '@/variables/services/tema_subtema/TemasSubtemasService.service';
import { TematicasService } from '@/variables/services/tematicas_temas/tematicas_temas.service';
import { VariableService } from '@/variables/services/variables.service';
import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-armonizacion-variables',
  templateUrl: './armo-variables.component.html',
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
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

  this.cargarTematicasPorProceso(variable.acronimo);

  const fuenteEncontrada = this.arrFuentesByProceso.find(
    (fuente) => fuente.idFuente === variable.idFuente,
  );

  if (!fuenteEncontrada) {
    console.warn('No se encontró la fuente de la variable seleccionada');
    this.fuenteForm = null;
    return;
  }

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

  this.verificarSiFuenteExisteEnArmonizacionPorDatos();
}
verificarSiFuenteExisteEnArmonizacion(idFuente: string) {
  this.cargandoEstadoFuente = true;

  this._varService.existsFuenteArmonizacion(idFuente).subscribe({
    next: (resp) => {
      this.fuenteExisteEnArmonizacion = resp.exists;
      this.cargandoEstadoFuente = false;

      console.log('¿Fuente existe en armonización?', resp.exists);

      if (resp.exists) {
        this.cargarFuenteArmonizacion(idFuente);
      }

      if (this.variableSeleccionada?.idA) {
      this.verificarSiVariableExiste(this.variableSeleccionada.idA);
      }
    },
    error: (err) => {
      console.error('Error al verificar fuente en armonización:', err);
      this.fuenteExisteEnArmonizacion = false;
      this.cargandoEstadoFuente = false;
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
          idFuenteSeleccion:
            fuenteArm.idFuenteSeleccion ?? idFuenteSeleccion,
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
        this.abrirModalSuccessSave('La fuente se guardó correctamente en armonización.');
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
  
    this._varService.updateFuenteArmonizacion(payload)
    .subscribe({
      next: (resp) => {
        console.log('Fuente actualizada en armonización:', resp);
        this.abrirModalSuccessUpdate('La fuente se actualizó correctamente en armonización.');
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

verificarSiFuenteExisteEnArmonizacionPorDatos(): void {
  if (!this.fuenteForm) return;

  this.cargandoEstadoFuente = true;

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

  this._varService.existsFuenteArmonizacionByData(payload).subscribe({
  next: (resp) => {
    this.fuenteExisteEnArmonizacion = resp.exists;
    this.cargandoEstadoFuente = false;
    

    if (resp.idFuente) {
      this.fuenteForm = {
        ...this.fuenteForm!,
        idFuente: resp.idFuente,
      };
    }

    if (resp.exists) {
      this.cargarFuenteArmonizacion(resp.idFuenteSeleccion);
    }
  },
  error: (err) => {
    console.error('Error al verificar fuente en armonización:', err);
    this.abrirModalError(this.obtenerMensajeError(err));
    this.fuenteExisteEnArmonizacion = false;
    this.cargandoEstadoFuente = false;
  },
});
}
@ViewChild('SuccessSaveModal') SuccessSaveModal!: ElementRef<HTMLDialogElement>;
@ViewChild('SuccessUpdateModal') SuccessUpdateModal!: ElementRef<HTMLDialogElement>;
@ViewChild('ErrorModal') ErrorModal!: ElementRef<HTMLDialogElement>;

mensajeSuccessSave: string = '';
mensajeSuccessUpdate: string = '';
mensajeError: string = '';
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
    }
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
        comentarioA: variable.comentarioA
      });
      if (variable.tema1) {
  this.cargarSubtemasTema1(variable.tema1);
}

if (variable.tema2) {
  this.cargarSubtemasTema2(variable.tema2);
}
    },
    error: (err) => {
      console.error('Error al cargar variable de armonización:', err);
    }
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
    tema2: '-',
    subtema2: '-',
    tabulados: false,
    clasificacion: false,
    microdatos: '',
    datosabiertos: false,
    mdea: variableSeleccionada.mdea ?? false,
    ods: variableSeleccionada.ods ?? false,
    comentarioA: ''
  });
}
guardarOActualizarVariable() {
  if (!this.variableForm.valid) {
    this.variableForm.markAllAsTouched();
    return;
  }

  const payload = this.variableForm.getRawValue();

  if (this.variableExisteEnArmonizacion) {
    this.variablesArmoService.actualizarVariable(payload.idA, payload).subscribe({
      next: (resp) => {
        this.variableExisteEnArmonizacion = true;
        this.modoEdicionVariable = true;
        console.log('Variable actualizada:', resp);
      },
      error: (err) => {
        console.error('Error al actualizar variable:', err);
      }
    });
  } else {
    this.variablesArmoService.guardarVariable(payload).subscribe({
      next: (resp) => {
        this.variableExisteEnArmonizacion = true;
        this.modoEdicionVariable = true;
        this.variableForm.patchValue(resp);
        console.log('Variable guardada:', resp);
      },
      error: (err) => {
        console.error('Error al guardar variable:', err);
      }
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
    variableA: [''],
    url: [''],
    pregunta: [''],
    definicion: [''],
    universo: [''],
    anioReferencia: [null],
    tematica: ['',Validators.required],
    tema1: ['',Validators.required],
    subtema1: ['',Validators.required],
    tema2: [''],
    subtema2: [''],
    tabulados: [false],
    clasificacion: [false],
    microdatos: [''],
    datosabiertos: [false],
    mdea: [false],
    ods: [false],
    comentarioS: [''],
    comentarioA: ['']
  });
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
    comentarioA: ''
  });
  this.limpiarClasificacionLocal();
}

clasificacionActiva: boolean = false;

clasificacionForm = {
  clase: '',
  comentarioA: '',
};

toggleClasificacionLocal(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  this.clasificacionActiva = checked;

  if (!checked) {
    this.limpiarClasificacionLocal();
  }
}
microdatosActivo: boolean = false;

microdatosForm = {
  urlAcceso: '',
  descriptor: '',
  urlDescriptor: '',
  tabla: '',
  campo: '',
  comentarioA: '',
};
datosAbiertosActivo: boolean = false;

datosAbiertosForm = {
  urlAcceso: '',
  urlDescarga: '',
  descriptor: '',
  tabla: '',
  campo: '',
  comentarioA: '',
};
toggleMicrodatosLocal(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  this.microdatosActivo = checked;

  if (!checked) {
    this.limpiarMicrodatosLocal();
  }
}
toggleDatosAbiertosLocal(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  this.datosAbiertosActivo = checked;

  if (!checked) {
    this.limpiarDatosAbiertosLocal();
  }
}
limpiarClasificacionLocal() {
  this.clasificacionActiva = false;
  this.clasificacionForm = {
    clase: '',
    comentarioA: '',
  };
}

limpiarDatosAbiertosLocal() {
  this.datosAbiertosActivo = false;
  this.datosAbiertosForm = {
    urlAcceso: '',
    urlDescarga: '',
    descriptor: '',
    tabla: '',
    campo: '',
    comentarioA: '',
  };
}
microdatosEstado: string = '';
seleccionarEstadoMicrodatos(estado: string) {
  this.microdatosEstado = estado;
}
limpiarMicrodatosLocal() {
  this.microdatosActivo = false;
  this.microdatosEstado = '';
  this.microdatosForm = {
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

  if (!acronimo) return;

  this.tematicasService.obtenerPorAcronimo(acronimo).subscribe({
    next: (resp) => {
      this.arrTematicas = resp;
    },
    error: (err) => {
      console.error('Error al cargar temáticas:', err);
      this.arrTematicas = [];
    }
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
    },
    error: (err) => {
      console.error('Error al cargar temas:', err);
      this.arrTemasCatalogo = [];
    }
  });
}
cargarSubtemasTema1(tema: string) {
  this.arrSubtemasTema1 = [];
  this.variableForm.patchValue({ subtema1: '' });

  if (!tema) return;

  this.temasSubtemasService.obtenerSubtemasPorTema(tema).subscribe({
    next: (resp) => {
      this.arrSubtemasTema1 = resp;
    },
    error: (err) => {
      console.error('Error al cargar subtemas de tema1:', err);
      this.arrSubtemasTema1 = [];
    }
  });
}
cargarSubtemasTema2(tema: string) {
  this.arrSubtemasTema2 = [];
  this.variableForm.patchValue({ subtema2: '' });

  if (!tema) return;

  this.temasSubtemasService.obtenerSubtemasPorTema(tema).subscribe({
    next: (resp) => {
      this.arrSubtemasTema2 = resp;
    },
    error: (err) => {
      console.error('Error al cargar subtemas de tema2:', err);
      this.arrSubtemasTema2 = [];
    }
  });
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
