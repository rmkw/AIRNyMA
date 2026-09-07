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
import { MicrodatoArmo } from '@/variables/interfaces/armonizacion/microdatos-armo.interface';
import { MicrodatosArmoService } from '@/variables/services/armonizacion/microdatos-armo.service';

export interface MicrodatosVariableForm {
  laboratorio: boolean;
  urlAcceso: string;
  descriptor: string;
  urlDescriptor: string;
  tabla: string;
  campo: string;
  comentarioA: string;
}

@Component({
  selector: 'app-microdatos-variable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './microdatos-variable.component.html',
  host: {
    class: 'block',
  },
})
export class MicrodatosVariableComponent implements OnChanges {
  private microdatosService = inject(MicrodatosArmoService);

  @ViewChild('detalleMicrodatoModal')
  detalleMicrodatoModal?: ElementRef<HTMLDialogElement>;
  @ViewChild('exitoMicrodatoModal')
  exitoMicrodatoModal?: ElementRef<HTMLDialogElement>;

  @Input() activo = false;
  @Input() form: MicrodatosVariableForm = this.crearFormularioVacio();
  @Input() microdatos: MicrodatoArmo[] = [];
  @Input() guardando = false;
  @Input() editando = false;
  @Input() ticketIdA = '';

  @Output() activoChange = new EventEmitter<boolean>();
  @Output() formChange = new EventEmitter<MicrodatosVariableForm>();
  @Output() agregarMicrodatos = new EventEmitter<{
    form: MicrodatosVariableForm;
  }>();
  @Output() eliminarMicrodato = new EventEmitter<MicrodatoArmo>();
  @Output() editarMicrodato = new EventEmitter<MicrodatoArmo>();

  microdatoSeleccionado: MicrodatoArmo | null = null;
  cargandoMicrodatos = false;
  errorMicrodatos = '';
  private ticketMicrodatoEditandoId: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    const idA = changes['ticketIdA']?.currentValue?.trim();
    if (idA) this.cargarMicrodatosTicket(idA);
  }

  toggleMicrodatos(event: Event) {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;

    if (!checked && this.microdatos.length > 0) {
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

  actualizarCampo(campo: keyof MicrodatosVariableForm, valor: string | boolean) {
    this.form = {
      ...this.form,
      [campo]: valor,
    };
    this.formChange.emit(this.form);
  }

  agregar() {
    if (this.ticketIdA) {
      this.guardarMicrodatoTicket();
      return;
    }
    this.agregarMicrodatos.emit({
      form: this.form,
    });
  }

  cancelarEdicionTicket() {
    this.ticketMicrodatoEditandoId = null;
    this.editando = false;
    this.form = this.crearFormularioVacio();
    this.formChange.emit(this.form);
  }

  cerrarExitoMicrodato() {
    this.exitoMicrodatoModal?.nativeElement.close();
  }

  editar(microdato: MicrodatoArmo) {
    if (this.ticketIdA) {
      this.ticketMicrodatoEditandoId = microdato.idUnique ?? null;
      this.editando = true;
      this.activo = true;
      this.form = {
        laboratorio: microdato.laboratorio,
        urlAcceso: microdato.urlAcceso,
        descriptor: microdato.descriptor,
        urlDescriptor: microdato.urlDescriptor,
        tabla: microdato.tabla,
        campo: microdato.campo,
        comentarioA: microdato.comentarioA,
      };
      this.formChange.emit(this.form);
      return;
    }
    this.editarMicrodato.emit(microdato);
  }

  cerrarDetalle() {
    this.detalleMicrodatoModal?.nativeElement.close();
  }

  limpiarDetalle() {
    this.microdatoSeleccionado = null;
  }

  eliminar(microdato: MicrodatoArmo) {
    if (this.ticketIdA) {
      this.eliminarMicrodatoTicket(microdato);
      return;
    }
    this.eliminarMicrodato.emit(microdato);
  }

  private cargarMicrodatosTicket(idA: string) {
    this.cargandoMicrodatos = true;
    this.errorMicrodatos = '';
    this.microdatosService.obtenerPorIdA(idA).subscribe({
      next: (microdatos) => {
        this.microdatos = microdatos ?? [];
        this.activo = true;
        this.cargandoMicrodatos = false;
      },
      error: () => {
        this.microdatos = [];
        this.cargandoMicrodatos = false;
        this.errorMicrodatos = 'No fue posible consultar los microdatos de esta variable.';
      },
    });
  }

  private guardarMicrodatoTicket() {
    const form = this.form;
    if (!form.urlAcceso.trim() || !form.descriptor.trim() || !form.urlDescriptor.trim() ||
      !form.tabla.trim() || !form.campo.trim() || !form.comentarioA.trim()) return;

    const payload: MicrodatoArmo = {
      idA: this.ticketIdA,
      laboratorio: form.laboratorio,
      urlAcceso: form.urlAcceso.trim(),
      descriptor: form.descriptor.trim(),
      urlDescriptor: form.urlDescriptor.trim(),
      tabla: form.tabla.trim(),
      campo: form.campo.trim(),
      comentarioA: form.comentarioA.trim(),
    };
    this.guardando = true;
    const idMicrodato = this.ticketMicrodatoEditandoId;
    const actualizando = idMicrodato !== null;
    const request = actualizando
      ? this.microdatosService.actualizarMicrodato(idMicrodato, payload)
      : this.microdatosService.guardarMicrodato(payload);
    request.subscribe({
      next: () => {
        this.ticketMicrodatoEditandoId = null;
        this.editando = false;
        this.form = this.crearFormularioVacio();
        this.formChange.emit(this.form);
        this.guardando = false;
        this.cargarMicrodatosTicket(this.ticketIdA);
        this.mensajeExitoMicrodato = actualizando
          ? 'El microdato se actualizó correctamente.'
          : 'El microdato se registró correctamente.';
        this.exitoMicrodatoModal?.nativeElement.showModal();
      },
      error: () => (this.guardando = false),
    });
  }

  mensajeExitoMicrodato = '';

  private eliminarMicrodatoTicket(microdato: MicrodatoArmo) {
    if (!microdato.idUnique) return;
    this.guardando = true;
    this.microdatosService.eliminarMicrodato(microdato.idUnique).subscribe({
      next: () => {
        this.guardando = false;
        this.cargarMicrodatosTicket(this.ticketIdA);
      },
      error: () => (this.guardando = false),
    });
  }

  private crearFormularioVacio(): MicrodatosVariableForm {
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
}
