import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  @Output() activaChange = new EventEmitter<boolean>();
  @Output() formChange = new EventEmitter<ClasificacionVariableForm>();
  @Output() agregarClasificacion = new EventEmitter<ClasificacionVariableForm>();

  toggleClasificacion(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.activa = checked;
    this.activaChange.emit(this.activa);

    if (!checked) {
      this.limpiar();
    }
  }

  actualizarCampo(campo: keyof ClasificacionVariableForm, valor: string) {
    this.form = {
      ...this.form,
      [campo]: valor,
    };
    this.formChange.emit(this.form);
  }

  limpiar() {
    this.activa = false;
    this.form = this.crearFormularioVacio();
    this.activaChange.emit(this.activa);
    this.formChange.emit(this.form);
  }

  agregar() {
    this.agregarClasificacion.emit(this.form);
  }

  private crearFormularioVacio(): ClasificacionVariableForm {
    return {
      clase: '',
      comentarioA: '',
    };
  }
}
