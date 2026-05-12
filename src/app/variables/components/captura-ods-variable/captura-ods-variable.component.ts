import { relacionODS_Service } from '@/variables/services/captura-ods-vars.service';
import { OdsService } from '@/variables/services/ods-pull.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-captura-ods-variable',
  imports: [CommonModule, FormsModule],
  templateUrl: './captura-ods-variable.component.html',
  styleUrl: './captura-ods-variable.component.css',
})
export class CapturaOdsVariableComponent implements OnInit, OnChanges {
  @Input() idA = '';
  @Input() idS = '';

  private _odsService = inject(OdsService);
  private _relacionODSService = inject(relacionODS_Service);

  idObjetivo = '';
  idMeta = '-';
  idIndicador = '-';

  objetivos: any[] = [];
  metas: any[] = [];
  indicadores: any[] = [];

  contribucion = '';
  comentarioS = '-';

  relacionesOds: any[] = [];

  ngOnInit(): void {
    this.cargarObjetivos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idA'] && this.idA) {
      this.cargarRelacionesOds();
    }
  }

  onObjetivoChange() {
    this.idMeta = '-';
    this.idIndicador = '-';

    this.metas = [];
    this.indicadores = [];

    this.cargarMetas();
  }

  onMetaChange() {
    this.idIndicador = '-';
    this.indicadores = [];

    if (this.idMeta === '-') return;

    this.cargarIndicadores();
  }

  cargarObjetivos() {
    this._odsService.getObjetivos().subscribe({
      next: (data) => {
        this.objetivos = data ?? [];
      },
      error: (err: any) => {
        console.error('Error al cargar objetivos ODS:', err);
        this.objetivos = [];
      },
    });
  }

  cargarMetas() {
    if (!this.idObjetivo) return;

    this._odsService.getMetas(this.idObjetivo).subscribe({
      next: (data) => {
        this.metas = data ?? [];
      },
      error: (err: any) => {
        console.error('Error al cargar metas ODS:', err);
        this.metas = [];
      },
    });
  }

  cargarIndicadores() {
    if (!this.idObjetivo || this.idMeta === '-') return;

    this._odsService.getIndicadores(this.idObjetivo, this.idMeta).subscribe({
      next: (data) => {
        this.indicadores = data ?? [];
      },
      error: (err: any) => {
        console.error('Error al cargar indicadores ODS:', err);
        this.indicadores = [];
      },
    });
  }
  guardarOds() {
    this.camposFaltantes = this.obtenerCamposFaltantes();

    if (this.camposFaltantes.length > 0) {
      this.modalSinDatosOds?.nativeElement.showModal();
      return;
    }

    if (!this.idA || !this.idS) {
      console.error('Falta contexto de variable para ODS');
      return;
    }

    if (!this.idObjetivo) {
      console.error('Faltan campos obligatorios de ODS');
      return;
    }

    const metaSeleccionada = this.metas.find(
      (meta) => String(meta.idMeta) === String(this.idMeta),
    );

    const indicadorSeleccionado = this.indicadores.find(
      (ind) => String(ind.idIndicador) === String(this.idIndicador),
    );

    const payload = {
      idA: this.idA,
      idS: this.idS,
      objetivo: this.idObjetivo,
      meta:
        metaSeleccionada?.uniqueId ?? metaSeleccionada?.idUnique ?? this.idMeta,
      indicador:
        indicadorSeleccionado?.uniqueId ??
        indicadorSeleccionado?.idUnique ??
        this.idIndicador,
      contribucion: this.contribucion || '-',
      comentarioS: this.comentarioS?.trim() || '-',
    };

    console.log('Payload ODS:', payload);

    this._relacionODSService.registrarRelacion_ods(payload).subscribe({
      next: () => {
        this.limpiarFormularioOds();
        this.cargarRelacionesOds();
      },
      error: (err: any) => {
        console.error('Error al guardar relación ODS:', err);
      },
    });
  }

  cargarRelacionesOds() {
    if (!this.idA) return;

    this._relacionODSService
      .getRelacionesTablaPorVariable_ods(this.idA)
      .subscribe({
        next: (data) => {
          this.relacionesOds = data ?? [];
        },
        error: (err: any) => {
          console.error('Error al cargar relaciones ODS:', err);
          this.relacionesOds = [];
        },
      });
  }
  eliminarRelacionOds(idUnique: number) {
    if (!idUnique) return;

    this._relacionODSService.eliminarRelacion_ods(idUnique).subscribe({
      next: () => {
        this.cargarRelacionesOds();
      },
      error: (err: any) => {
        console.error('Error al eliminar relación ODS:', err);
      },
    });
  }
  limpiarFormularioOds() {
    this.idObjetivo = '';
    this.idMeta = '-';
    this.idIndicador = '-';

    this.metas = [];
    this.indicadores = [];

    this.contribucion = '';
    this.comentarioS = '';
  }

  @ViewChild('modalSinDatosOds')
  modalSinDatosOds!: ElementRef<HTMLDialogElement>;

  camposFaltantes: string[] = [];

  obtenerCamposFaltantes(): string[] {
    const faltantes: string[] = [];

    if (!this.idObjetivo?.trim()) faltantes.push('Objetivo');
    if (!this.contribucion?.trim()) faltantes.push('Contribución');
    if (!this.comentarioS?.trim()) faltantes.push('Comentario');

    return faltantes;
  }
  abrirModalSinDatosOds() {
    this.modalSinDatosOds?.nativeElement.showModal();
  }

  cerrarModalSinDatosOds() {
    this.modalSinDatosOds?.nativeElement.close();
  }
  mostrarCatalogo(id: any, nombre: any): string {
    if (!id || id === '-') return '-';
    if (!nombre || nombre === '-') return id;

    return `${id} - ${nombre}`;
  }
}
