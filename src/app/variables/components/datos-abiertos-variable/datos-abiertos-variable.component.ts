import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
export class DatosAbiertosVariableComponent {
  @Input() activo = false;
  @Input() form: DatosAbiertosVariableForm = this.crearFormularioVacio();

  @Output() activoChange = new EventEmitter<boolean>();
  @Output() formChange = new EventEmitter<DatosAbiertosVariableForm>();
  @Output() agregarDatosAbiertos = new EventEmitter<DatosAbiertosVariableForm>();

  toggleDatosAbiertos(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.activo = checked;
    this.activoChange.emit(this.activo);

    if (!checked) {
      this.limpiar();
    }
  }

  actualizarCampo(campo: keyof DatosAbiertosVariableForm, valor: string) {
    this.form = {
      ...this.form,
      [campo]: valor,
    };
    this.formChange.emit(this.form);
  }

  limpiar() {
    this.activo = false;
    this.form = this.crearFormularioVacio();
    this.activoChange.emit(this.activo);
    this.formChange.emit(this.form);
  }

  agregar() {
    this.agregarDatosAbiertos.emit(this.form);
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
