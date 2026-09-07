import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatoAbiertoArmo } from '@/variables/interfaces/armonizacion/datos-abiertos-armo.interface';
import { DatosAbiertosArmoService } from '@/variables/services/armonizacion/datos-abiertos-armo.service';

export interface DatosAbiertosVariableForm {
  urlAcceso: string;
  urlDescarga: string;
  descriptor: string;
  tabla: string;
  campo: string;
  comentarioA: string;
}

@Component({
  selector: 'app-datos-abiertos-variable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './datos-abiertos-variable.component.html',
  host: {
    class: 'block xl:col-span-2 2xl:col-span-1',
  },
})
export class DatosAbiertosVariableComponent implements OnChanges {
  private datosAbiertosService = inject(DatosAbiertosArmoService);
  @ViewChild('detalleDatoAbiertoModal')
  detalleDatoAbiertoModal?: ElementRef<HTMLDialogElement>;
  @ViewChild('exitoDatoAbiertoModal')
  exitoDatoAbiertoModal?: ElementRef<HTMLDialogElement>;

  @Input() activo = false;
  @Input() form: DatosAbiertosVariableForm = this.crearFormularioVacio();
  @Input() datosAbiertos: DatoAbiertoArmo[] = [];
  @Input() guardando = false;
  @Input() editando = false;
  @Input() ticketIdA = '';

  @Output() activoChange = new EventEmitter<boolean>();
  @Output() formChange = new EventEmitter<DatosAbiertosVariableForm>();
  @Output() agregarDatosAbiertos = new EventEmitter<DatosAbiertosVariableForm>();
  @Output() eliminarDatoAbierto = new EventEmitter<DatoAbiertoArmo>();
  @Output() editarDatoAbierto = new EventEmitter<DatoAbiertoArmo>();

  datoAbiertoSeleccionado: DatoAbiertoArmo | null = null;
  cargandoDatosAbiertos = false;
  errorDatosAbiertos = '';
  private ticketDatoAbiertoEditandoId: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    const idA = changes['ticketIdA']?.currentValue?.trim();
    if (idA) this.cargarDatosAbiertosTicket(idA);
  }

  toggleDatosAbiertos(event: Event) {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;

    if (!checked && this.datosAbiertos.length > 0) {
      input.checked = true;
      this.activoChange.emit(false);
      return;
    }

    this.activo = checked;
    this.activoChange.emit(this.activo);

    if (!checked) {
      this.form = this.crearFormularioVacio();
      this.formChange.emit(this.form);
    }
  }

  actualizarCampo(campo: keyof DatosAbiertosVariableForm, valor: string) {
    this.form = {
      ...this.form,
      [campo]: valor,
    };
    this.formChange.emit(this.form);
  }

  agregar() {
    if (this.ticketIdA) {
      this.guardarDatoAbiertoTicket();
      return;
    }
    this.agregarDatosAbiertos.emit(this.form);
  }

  cancelarEdicionTicket() {
    this.ticketDatoAbiertoEditandoId = null;
    this.editando = false;
    this.form = this.crearFormularioVacio();
    this.formChange.emit(this.form);
  }

  cerrarExitoDatoAbierto() {
    this.exitoDatoAbiertoModal?.nativeElement.close();
  }

  editar(datoAbierto: DatoAbiertoArmo) {
    if (this.ticketIdA) {
      this.ticketDatoAbiertoEditandoId = datoAbierto.idUnique ?? null;
      this.editando = true;
      this.activo = true;
      this.form = {
        urlAcceso: datoAbierto.urlAcceso,
        urlDescarga: datoAbierto.urlDescarga,
        descriptor: datoAbierto.descriptor,
        tabla: datoAbierto.tabla,
        campo: datoAbierto.campo,
        comentarioA: datoAbierto.comentarioA,
      };
      this.formChange.emit(this.form);
      return;
    }
    this.editarDatoAbierto.emit(datoAbierto);
  }

  cerrarDetalle() {
    this.detalleDatoAbiertoModal?.nativeElement.close();
  }

  limpiarDetalle() {
    this.datoAbiertoSeleccionado = null;
  }

  eliminar(datoAbierto: DatoAbiertoArmo) {
    if (this.ticketIdA) {
      this.eliminarDatoAbiertoTicket(datoAbierto);
      return;
    }
    this.eliminarDatoAbierto.emit(datoAbierto);
  }

  private cargarDatosAbiertosTicket(idA: string) {
    this.cargandoDatosAbiertos = true;
    this.errorDatosAbiertos = '';
    this.datosAbiertosService.obtenerPorIdA(idA).subscribe({
      next: (datosAbiertos) => {
        this.datosAbiertos = datosAbiertos ?? [];
        this.activo = true;
        this.cargandoDatosAbiertos = false;
      },
      error: () => {
        this.datosAbiertos = [];
        this.cargandoDatosAbiertos = false;
        this.errorDatosAbiertos = 'No fue posible consultar los datos abiertos de esta variable.';
      },
    });
  }

  private guardarDatoAbiertoTicket() {
    const form = this.form;
    if (!form.urlAcceso.trim() || !form.urlDescarga.trim() || !form.descriptor.trim() ||
      !form.tabla.trim() || !form.campo.trim() || !form.comentarioA.trim()) return;

    const payload: DatoAbiertoArmo = {
      idA: this.ticketIdA,
      urlAcceso: form.urlAcceso.trim(),
      urlDescarga: form.urlDescarga.trim(),
      descriptor: form.descriptor.trim(),
      tabla: form.tabla.trim(),
      campo: form.campo.trim(),
      comentarioA: form.comentarioA.trim(),
    };
    this.guardando = true;
    const idDatoAbierto = this.ticketDatoAbiertoEditandoId;
    const actualizando = idDatoAbierto !== null;
    const request = actualizando
      ? this.datosAbiertosService.actualizarDatoAbierto(idDatoAbierto, payload)
      : this.datosAbiertosService.guardarDatoAbierto(payload);
    request.subscribe({
      next: () => {
        this.ticketDatoAbiertoEditandoId = null;
        this.editando = false;
        this.form = this.crearFormularioVacio();
        this.formChange.emit(this.form);
        this.guardando = false;
        this.cargarDatosAbiertosTicket(this.ticketIdA);
        this.mensajeExitoDatoAbierto = actualizando
          ? 'El dato abierto se actualizó correctamente.'
          : 'El dato abierto se registró correctamente.';
        this.exitoDatoAbiertoModal?.nativeElement.showModal();
      },
      error: () => (this.guardando = false),
    });
  }

  mensajeExitoDatoAbierto = '';

  private eliminarDatoAbiertoTicket(datoAbierto: DatoAbiertoArmo) {
    if (!datoAbierto.idUnique) return;
    this.guardando = true;
    this.datosAbiertosService.eliminarDatoAbierto(datoAbierto.idUnique).subscribe({
      next: () => {
        this.guardando = false;
        this.cargarDatosAbiertosTicket(this.ticketIdA);
      },
      error: () => (this.guardando = false),
    });
  }

  private crearFormularioVacio(): DatosAbiertosVariableForm {
    return {
      urlAcceso: '',
      urlDescarga: '',
      descriptor: '',
      tabla: '',
      campo: '',
      comentarioA: '',
    };
  }
}
