import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClasificacionArmo } from '@/variables/interfaces/armonizacion/clasificaciones-armo.interface';

export interface ClasificacionVariableForm {
  clase: string;
  comentarioA: string;
}

export const MINIMO_CLASIFICACIONES = 2;

@Component({
  selector: 'app-clasificaciones-variable',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clasificaciones-variable.component.html',
  host: {
    class: 'block',
  },
})
export class ClasificacionesVariableComponent {
  readonly minimoClasificaciones = MINIMO_CLASIFICACIONES;

  @ViewChild('detalleClasificacionModal')
  detalleClasificacionModal?: ElementRef<HTMLDialogElement>;

  @Input() activa = false;
  @Input() form: ClasificacionVariableForm = this.crearFormularioVacio();
  @Input() clasificaciones: ClasificacionArmo[] = [];
  @Input() guardando = false;

  @Output() activaChange = new EventEmitter<boolean>();
  @Output() formChange = new EventEmitter<ClasificacionVariableForm>();
  @Output() cambiarActiva = new EventEmitter<boolean>();
  @Output() agregarClasificacion = new EventEmitter<ClasificacionVariableForm>();
  @Output() eliminarClasificacion = new EventEmitter<ClasificacionArmo>();

  clasificacionSeleccionada: ClasificacionArmo | null = null;

  get clasificacionesFaltantes(): number {
    return Math.max(this.minimoClasificaciones - this.clasificaciones.length, 0);
  }

  get cumpleMinimoClasificaciones(): boolean {
    return this.clasificaciones.length >= this.minimoClasificaciones;
  }

  toggleClasificacion(event: Event) {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;

    if (!checked && this.clasificaciones.length > 0) {
      input.checked = true;
    }

    this.cambiarActiva.emit(checked);
  }

  actualizarCampo(campo: keyof ClasificacionVariableForm, valor: string) {
    this.form = {
      ...this.form,
      [campo]: valor,
    };
    this.formChange.emit(this.form);
  }

  agregar() {
    this.agregarClasificacion.emit(this.form);
  }

  verDetalle(clasificacion: ClasificacionArmo) {
    this.clasificacionSeleccionada = clasificacion;
    this.detalleClasificacionModal?.nativeElement.showModal();
  }

  cerrarDetalle() {
    this.detalleClasificacionModal?.nativeElement.close();
  }

  limpiarDetalle() {
    this.clasificacionSeleccionada = null;
  }

  eliminar(clasificacion: ClasificacionArmo) {
    this.eliminarClasificacion.emit(clasificacion);
  }

  private crearFormularioVacio(): ClasificacionVariableForm {
    return {
      clase: '',
      comentarioA: '',
    };
  }
}
