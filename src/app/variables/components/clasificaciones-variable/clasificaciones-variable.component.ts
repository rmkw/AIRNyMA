import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClasificadoresVariableComponent } from '../clasificadores-variable/clasificadores-variable.component';
import { ClasificacionArmo } from '@/variables/interfaces/armonizacion/clasificaciones-armo.interface';
import { ClasificacionesArmoService } from '@/variables/services/armonizacion/clasificaciones-armo.service';

export interface ClasificacionVariableForm {
  clase: string;
  comentarioA: string;
}

export const MINIMO_CLASIFICACIONES = 1;

@Component({
  selector: 'app-clasificaciones-variable',
  standalone: true,
  imports: [CommonModule, FormsModule, ClasificadoresVariableComponent],
  templateUrl: './clasificaciones-variable.component.html',
  host: {
    class: 'block',
  },
})
export class ClasificacionesVariableComponent implements OnChanges {
  readonly minimoClasificaciones = MINIMO_CLASIFICACIONES;
  private clasificacionesService = inject(ClasificacionesArmoService);

  @Input() activa = false;
  @Input() form: ClasificacionVariableForm = this.crearFormularioVacio();
  @Input() clasificaciones: ClasificacionArmo[] = [];
  @Input() guardando = false;
  @Input() ticketIdA = '';
  @Input() idA = '';
  usarClasificadores = false;
  cargandoClasificaciones = false;
  errorClasificaciones = '';

  @Output() activaChange = new EventEmitter<boolean>();
  @Output() formChange = new EventEmitter<ClasificacionVariableForm>();
  @Output() cambiarActiva = new EventEmitter<boolean>();
  @Output() agregarClasificacion = new EventEmitter<ClasificacionVariableForm>();
  @Output() eliminarClasificacion = new EventEmitter<ClasificacionArmo>();
  @Output() clasificadoresChange = new EventEmitter<string>();

  get clasificacionesFaltantes(): number {
    return Math.max(this.minimoClasificaciones - this.clasificaciones.length, 0);
  }

  get cumpleMinimoClasificaciones(): boolean {
    return this.clasificaciones.length >= this.minimoClasificaciones;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idA'] || changes['ticketIdA']) this.usarClasificadores = false;
    const idA = changes['ticketIdA']?.currentValue?.trim();
    if (idA) this.cargarClasificacionesTicket(idA);
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
    if (this.ticketIdA) {
      this.agregarDesdeTicket();
      return;
    }
    this.agregarClasificacion.emit(this.form);
  }

  eliminar(clasificacion: ClasificacionArmo) {
    if (this.ticketIdA) {
      this.eliminarDesdeTicket(clasificacion);
      return;
    }
    this.eliminarClasificacion.emit(clasificacion);
  }

  private cargarClasificacionesTicket(idA: string) {
    this.cargandoClasificaciones = true;
    this.errorClasificaciones = '';
    this.clasificacionesService.obtenerPorIdA(idA).subscribe({
      next: (clasificaciones) => {
        this.clasificaciones = clasificaciones ?? [];
        this.activa = true;
        this.cargandoClasificaciones = false;
      },
      error: () => {
        this.clasificaciones = [];
        this.cargandoClasificaciones = false;
        this.errorClasificaciones = 'No fue posible consultar las clasificaciones de esta variable.';
      },
    });
  }

  private agregarDesdeTicket() {
    const clase = this.form.clase.trim();
    const comentarioA = this.form.comentarioA.trim();
    if (!clase || !comentarioA) return;

    this.guardando = true;
    this.clasificacionesService
      .guardarClasificacion({ idA: this.ticketIdA, clase, comentarioA })
      .subscribe({
        next: () => {
          this.form = this.crearFormularioVacio();
          this.formChange.emit(this.form);
          this.guardando = false;
          this.cargarClasificacionesTicket(this.ticketIdA);
        },
        error: () => (this.guardando = false),
      });
  }

  private eliminarDesdeTicket(clasificacion: ClasificacionArmo) {
    if (!clasificacion.idUnique) return;
    this.guardando = true;
    this.clasificacionesService.eliminarClasificacion(clasificacion.idUnique).subscribe({
      next: () => {
        this.guardando = false;
        this.cargarClasificacionesTicket(this.ticketIdA);
      },
      error: () => (this.guardando = false),
    });
  }

  private crearFormularioVacio(): ClasificacionVariableForm {
    return {
      clase: '',
      comentarioA: '',
    };
  }
}
