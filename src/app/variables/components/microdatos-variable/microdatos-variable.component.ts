import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MicrodatoArmo } from '@/variables/interfaces/armonizacion/microdatos-armo.interface';

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
  readonly estadoLaboratorio = 'Sí (disponibles a través del Laboratorio de Microdatos)';
  readonly estadoSi = 'Sí';

  @Input() activo = false;
  @Input() estado = '';
  @Input() form: MicrodatosVariableForm = this.crearFormularioVacio();
  @Input() microdatos: MicrodatoArmo[] = [];
  @Input() guardando = false;

  @Output() activoChange = new EventEmitter<boolean>();
  @Output() estadoChange = new EventEmitter<string>();
  @Output() formChange = new EventEmitter<MicrodatosVariableForm>();
  @Output() agregarMicrodatos = new EventEmitter<{
    estado: string;
    form: MicrodatosVariableForm;
  }>();
  @Output() eliminarMicrodato = new EventEmitter<MicrodatoArmo>();

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
      this.estado = '';
      this.form = this.crearFormularioVacio();
      this.estadoChange.emit(this.estado);
      this.formChange.emit(this.form);
    }
  }

  seleccionarEstado(estado: string) {
    this.estado = estado;
    this.estadoChange.emit(this.estado);
  }

  cambiarEstadoLaboratorio(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.seleccionarEstado(checked ? this.estadoLaboratorio : this.estadoSi);
  }

  actualizarCampo(campo: keyof MicrodatosVariableForm, valor: string) {
    this.form = {
      ...this.form,
      [campo]: valor,
    };
    this.formChange.emit(this.form);
  }

  agregar() {
    this.agregarMicrodatos.emit({
      estado: this.estado,
      form: this.form,
    });
  }

  eliminar(microdato: MicrodatoArmo) {
    this.eliminarMicrodato.emit(microdato);
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
