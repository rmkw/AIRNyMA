import { interface_ProcesoP } from '@/procesoProduccion/interfaces/procesos.interface';
import { DireccionesService } from '@/procesoProduccion/services/direcciones.service';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { Tabulado } from '@/tabulados/interfaces/tabulado.interface';
import { Direccion } from '@/variables/interfaces/direcciones.interface';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-captura-tabulado',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './captura-tabulado.component.html',
})
export class CapturaTabuladoComponent implements OnInit, OnChanges {
  private direccionesService = inject(DireccionesService);
  private procesosService = inject(ppEcoService);

  @Input() tabuladoSeleccionado: Tabulado | null = null;
  @Input() guardando = false;
  @Output() guardarTabulado = new EventEmitter<Tabulado>();
  @Output() cancelarEdicion = new EventEmitter<void>();

  arrDirecciones: Direccion[] = [];
  arrProcesosPBydire: interface_ProcesoP[] = [];
  direccionSeleccionada = '';
  procesoSeleccionado = '';
  procesosHabilitados = false;
  prefijoTabulado = '';
  serialTabulado = '';
  edicionTabulado = '';

  tabulado: Tabulado = {
    idTabulado: '',
    tabulado: '',
    tipo: '',
    hoja: '',
    urlAcceso: '',
    urlDescarga: '',
    comentarioA: '',
  };

  ngOnInit(): void {
    this.cargarDirecciones();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tabuladoSeleccionado'] && this.tabuladoSeleccionado) {
      this.cargarTabuladoSeleccionado(this.tabuladoSeleccionado);
    }
  }

  get modoEdicion(): boolean {
    return this.tabuladoSeleccionado !== null;
  }

  get formularioValido(): boolean {
    return (
      /^.+-\d+-\d{4}-T$/.test(this.tabulado.idTabulado) &&
      this.tabulado.tabulado.trim().length > 0 &&
      this.tabulado.tipo.trim().length > 0 &&
      this.tabulado.hoja.trim().length > 0 &&
      this.tabulado.urlAcceso.trim().length > 0 &&
      this.tabulado.urlDescarga.trim().length > 0 &&
      this.tabulado.comentarioA.trim().length > 0
    );
  }

  selectedDireccion(direccion: string) {
    this.procesoSeleccionado = '';
    this.arrProcesosPBydire = [];
    this.procesosHabilitados = true;
    this.limpiarIdTabulado();

    this.procesosService.getPorDireccionGeneral(direccion).subscribe({
      next: (procesos) => {
        this.arrProcesosPBydire = procesos;
      },
      error: (err) => {
        console.error('Error al cargar los procesos de producción:', err);
        this.arrProcesosPBydire = [];
      },
    });
  }

  seleccionarProceso(acronimo: string) {
    this.prefijoTabulado = `${acronimo}-`;
    this.serialTabulado = '';
    this.edicionTabulado = '';
    this.sincronizarIdTabulado();
  }

  actualizarSerial(valor: string) {
    this.serialTabulado = valor.replace(/\D/g, '');
    this.sincronizarIdTabulado();
  }

  actualizarEdicion(valor: string) {
    this.edicionTabulado = valor.replace(/\D/g, '').slice(0, 4);
    this.sincronizarIdTabulado();
  }

  guardar() {
    if (!this.formularioValido || this.guardando) return;
    this.guardarTabulado.emit({ ...this.tabulado });
  }

  cancelar() {
    this.limpiarFormulario();
    this.cancelarEdicion.emit();
  }

  limpiarFormulario() {
    this.direccionSeleccionada = '';
    this.procesoSeleccionado = '';
    this.arrProcesosPBydire = [];
    this.procesosHabilitados = false;
    this.prefijoTabulado = '';
    this.serialTabulado = '';
    this.edicionTabulado = '';
    this.tabulado = this.crearTabuladoVacio();
  }

  private cargarDirecciones() {
    this.direccionesService.getDirecciones().subscribe({
      next: (direcciones) => {
        this.arrDirecciones = direcciones;
      },
      error: (err) => {
        console.error('Error al cargar las unidades productoras:', err);
        this.arrDirecciones = [];
      },
    });
  }

  private limpiarIdTabulado() {
    this.prefijoTabulado = '';
    this.serialTabulado = '';
    this.edicionTabulado = '';
    this.tabulado.idTabulado = '';
  }

  private sincronizarIdTabulado() {
    const idBase = `${this.prefijoTabulado}${this.serialTabulado}`;

    this.tabulado.idTabulado =
      this.serialTabulado && this.edicionTabulado.length === 4
        ? `${idBase}-${this.edicionTabulado}-T`
        : idBase;
  }

  private cargarTabuladoSeleccionado(tabulado: Tabulado) {
    this.tabulado = { ...tabulado };

    const partesId = tabulado.idTabulado.match(/^(.+)-(\d+)-(\d{4})-T$/);
    if (!partesId) {
      this.prefijoTabulado = '';
      this.serialTabulado = '';
      this.edicionTabulado = '';
      return;
    }

    const acronimo = partesId[1];
    this.prefijoTabulado = `${acronimo}-`;
    this.serialTabulado = partesId[2];
    this.edicionTabulado = partesId[3];
    this.procesoSeleccionado = acronimo;
    this.procesosHabilitados = true;
    this.cargarContextoProceso(acronimo);
  }

  private cargarContextoProceso(acronimo: string) {
    this.procesosService.getProcesosProduccion().subscribe({
      next: (procesos) => {
        const proceso = procesos.find(
          (item) => item.acronimo === acronimo,
        );

        if (!proceso) return;

        this.direccionSeleccionada = proceso.unidad;
        this.arrProcesosPBydire = procesos.filter(
          (item) => item.unidad === proceso.unidad,
        );
      },
      error: (err) => {
        console.error('Error al cargar el contexto del proceso:', err);
        this.arrProcesosPBydire = [];
      },
    });
  }

  private crearTabuladoVacio(): Tabulado {
    return {
      idTabulado: '',
      tabulado: '',
      tipo: '',
      hoja: '',
      urlAcceso: '',
      urlDescarga: '',
      comentarioA: '',
    };
  }
}
