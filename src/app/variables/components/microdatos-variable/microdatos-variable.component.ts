import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface MicrodatosVariableForm {
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
export class MicrodatosVariableComponent {
  @Input() activo = false;
  @Input() estado = '';
  @Input() form: MicrodatosVariableForm = this.crearFormularioVacio();

  @Output() activoChange = new EventEmitter<boolean>();
  @Output() estadoChange = new EventEmitter<string>();
  @Output() formChange = new EventEmitter<MicrodatosVariableForm>();
  @Output() agregarMicrodatos = new EventEmitter<{
    estado: string;
    form: MicrodatosVariableForm;
  }>();

  toggleMicrodatos(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.activo = checked;
    this.activoChange.emit(this.activo);

    if (!checked) {
      this.limpiar();
    }
  }

  seleccionarEstado(estado: string) {
    this.estado = estado;
    this.estadoChange.emit(this.estado);
  }

  actualizarCampo(campo: keyof MicrodatosVariableForm, valor: string) {
    this.form = {
      ...this.form,
      [campo]: valor,
    };
    this.formChange.emit(this.form);
  }

  limpiar() {
    this.activo = false;
    this.estado = '';
    this.form = this.crearFormularioVacio();
    this.activoChange.emit(this.activo);
    this.estadoChange.emit(this.estado);
    this.formChange.emit(this.form);
  }

  agregar() {
    this.agregarMicrodatos.emit({
      estado: this.estado,
      form: this.form,
    });
  }

  private crearFormularioVacio(): MicrodatosVariableForm {
    return {
      urlAcceso: '',
      descriptor: '',
      urlDescriptor: '',
      tabla: '',
      campo: '',
      comentarioA: '',
    };
  }
}
