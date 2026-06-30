import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatoAbiertoArmo } from '@/variables/interfaces/armonizacion/datos-abiertos-armo.interface';

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
  @Input() datosAbiertos: DatoAbiertoArmo[] = [];
  @Input() guardando = false;

  @Output() activoChange = new EventEmitter<boolean>();
  @Output() formChange = new EventEmitter<DatosAbiertosVariableForm>();
  @Output() agregarDatosAbiertos = new EventEmitter<DatosAbiertosVariableForm>();
  @Output() eliminarDatoAbierto = new EventEmitter<DatoAbiertoArmo>();

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
    this.agregarDatosAbiertos.emit(this.form);
  }

  eliminar(datoAbierto: DatoAbiertoArmo) {
    this.eliminarDatoAbierto.emit(datoAbierto);
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
