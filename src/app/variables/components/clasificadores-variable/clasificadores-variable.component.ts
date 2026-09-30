import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ClasificadorArmo } from '@/variables/interfaces/armonizacion/clasificadores-armo.interface';
import { ClasificadoresArmoService } from '@/variables/services/armonizacion/clasificadores-armo.service';

@Component({
  selector: 'app-clasificadores-variable',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './clasificadores-variable.component.html',
})
export class ClasificadoresVariableComponent implements OnChanges, OnDestroy {
  @Input() idA = '';
  @Output() registrosChange = new EventEmitter<string>();
  private service = inject(ClasificadoresArmoService);
  private solicitudes = new Subscription();
  registros: ClasificadorArmo[] = [];
  form = this.formularioVacio();
  editandoId: number | null = null;
  cargando = false;
  guardando = false;
  error = '';
  mensaje = '';

  ngOnChanges() {
    this.solicitudes.unsubscribe();
    this.solicitudes = new Subscription();
    this.registros = [];
    this.cancelarEdicion();
    this.guardando = false;
    this.cargando = false;
    this.error = '';
    this.mensaje = '';
    if (this.idA) this.cargar();
  }

  ngOnDestroy() {
    this.solicitudes.unsubscribe();
  }

  cargar() {
    this.cargando = true;
    this.error = '';
    this.solicitudes.add(this.service.obtenerPorIdA(this.idA).subscribe({
      next: registros => {
        this.registros = registros ?? [];
        this.cargando = false;
      },
      error: error => {
        this.cargando = false;
        this.mostrarError(error, 'No fue posible consultar los clasificadores.');
      },
    }));
  }

  guardar() {
    if (!this.idA || this.guardando || this.cargando) return;
    const payload: ClasificadorArmo = {
      idA: this.idA,
      clasificador: this.form.clasificador.trim(),
      version: this.form.version.trim(),
      url: this.form.url.trim(),
      comentariosA: this.form.comentariosA.trim() || '-',
    };
    const actualizando = this.editandoId !== null;
    const solicitud = this.editandoId !== null
      ? this.service.actualizarClasificador(this.editandoId, payload)
      : this.service.guardarClasificador(payload);
    this.guardando = true;
    this.error = '';
    this.mensaje = '';
    this.solicitudes.add(solicitud.subscribe({
      next: () => {
        this.guardando = false;
        this.cancelarEdicion();
        this.mensaje = actualizando ? 'Clasificador actualizado correctamente.' : 'Clasificador registrado correctamente.';
        this.registrosChange.emit(this.idA);
        this.cargar();
      },
      error: error => {
        this.guardando = false;
        this.mostrarError(error, 'No fue posible guardar el clasificador.');
      },
    }));
  }

  editar(registro: ClasificadorArmo) {
    this.editandoId = registro.idUnique ?? null;
    this.form = {
      clasificador: registro.clasificador ?? '',
      version: registro.version ?? '',
      url: registro.url ?? '',
      comentariosA: registro.comentariosA ?? '-',
    };
    this.error = '';
    this.mensaje = '';
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.form = this.formularioVacio();
  }

  eliminar(registro: ClasificadorArmo) {
    if (registro.idUnique == null || this.guardando || this.cargando) return;
    if (!window.confirm('¿Eliminar este clasificador de la variable?')) return;
    this.guardando = true;
    this.error = '';
    this.mensaje = '';
    this.solicitudes.add(this.service.eliminarClasificador(registro.idUnique).subscribe({
      next: () => {
        this.guardando = false;
        if (this.editandoId === registro.idUnique) this.cancelarEdicion();
        this.mensaje = 'Clasificador eliminado correctamente.';
        this.registrosChange.emit(this.idA);
        this.cargar();
      },
      error: error => {
        this.guardando = false;
        this.mostrarError(error, 'No fue posible eliminar el clasificador.');
      },
    }));
  }

  private mostrarError(error: HttpErrorResponse, mensaje: string) {
    this.error = typeof error.error === 'string' && !error.error.trim().startsWith('<')
      ? error.error : mensaje;
  }

  private formularioVacio() {
    return { clasificador: '', version: '', url: '', comentariosA: '-' };
  }
}
