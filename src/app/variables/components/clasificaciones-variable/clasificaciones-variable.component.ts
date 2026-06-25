import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClasificacionArmo } from '@/variables/interfaces/armonizacion/clasificaciones-armo.interface';

export interface ClasificacionVariableForm {
  clase: string;
  comentarioA: string;
}

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
  @Input() activa = false;
  @Input() form: ClasificacionVariableForm = this.crearFormularioVacio();
  @Input() clasificaciones: ClasificacionArmo[] = [];
  @Input() guardando = false;

  @Output() activaChange = new EventEmitter<boolean>();
  @Output() formChange = new EventEmitter<ClasificacionVariableForm>();
  @Output() cambiarActiva = new EventEmitter<boolean>();
  @Output() agregarClasificacion = new EventEmitter<ClasificacionVariableForm>();
  @Output() eliminarClasificacion = new EventEmitter<ClasificacionArmo>();

  toggleClasificacion(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.cambiarActiva.emit(checked);
  }

  actualizarCampo(campo: keyof ClasificacionVariableForm, valor: string) {
    this.form = {
      ...this.form,
      [campo]: valor,
    };
    this.formChange.emit(this.form);
  }

  limpiar() {
    this.form = this.crearFormularioVacio();
    this.formChange.emit(this.form);
  }

  agregar() {
    this.agregarClasificacion.emit(this.form);
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
