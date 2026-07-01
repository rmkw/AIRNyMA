import { Desagregacion } from '@/tabulados/interfaces/desagregacion.interface';
import { DesagregacionesService } from '@/tabulados/services/desagregaciones.service';
import { Component, Input, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-captura-desagregacion',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './captura-desagregacion.component.html',
})
export class CapturaDesagregacionComponent implements OnDestroy {
  private desagregacionesService = inject(DesagregacionesService);
  private mensajeTimeout?: ReturnType<typeof setTimeout>;

  desagregacion: Desagregacion = {
    idTabulado: '',
    coberturaDesagregacion: '',
    comentarioA: '',
  };
  desagregaciones: Desagregacion[] = [];
  cargando = false;
  guardando = false;
  eliminandoId: number | null = null;
  mensaje = '';
  error = '';

  ngOnDestroy(): void {
    if (this.mensajeTimeout) {
      clearTimeout(this.mensajeTimeout);
    }
  }

  @Input()
  set idTabulado(value: string | null) {
    const idTabulado = value ?? '';
    if (idTabulado === this.desagregacion.idTabulado) {
      return;
    }

    this.desagregacion = {
      idTabulado,
      coberturaDesagregacion: '',
      comentarioA: '',
    };
    this.desagregaciones = [];
    this.mensaje = '';
    this.error = '';

    if (idTabulado) {
      this.cargarDesagregaciones();
    }
  }

  get formularioValido(): boolean {
    return !!(
      this.desagregacion.idTabulado &&
      this.desagregacion.coberturaDesagregacion.trim() &&
      this.desagregacion.comentarioA.trim()
    );
  }

  actualizarCobertura(valor: string): void {
    this.desagregacion.coberturaDesagregacion =
      this.primeraLetraMayuscula(valor);
  }

  guardar(): void {
    if (!this.formularioValido || this.guardando) {
      return;
    }

    this.guardando = true;
    this.mensaje = '';
    this.error = '';
    this.desagregacionesService
      .guardar({
        ...this.desagregacion,
        coberturaDesagregacion: this.primeraLetraMayuscula(
          this.desagregacion.coberturaDesagregacion.trim(),
        ),
        comentarioA: this.desagregacion.comentarioA.trim(),
      })
      .subscribe({
        next: () => {
          this.guardando = false;
          this.desagregacion.coberturaDesagregacion = '';
          this.desagregacion.comentarioA = '';
          this.mostrarMensaje('Desagregación guardada correctamente.');
          this.cargarDesagregaciones();
        },
        error: (error) => {
          this.guardando = false;
          this.error =
            error.error || 'No fue posible guardar la desagregación.';
        },
      });
  }

  eliminar(desagregacion: Desagregacion): void {
    if (desagregacion.idUnique == null || this.eliminandoId != null) {
      return;
    }

    this.eliminandoId = desagregacion.idUnique;
    this.mensaje = '';
    this.error = '';
    this.desagregacionesService.eliminar(desagregacion.idUnique).subscribe({
      next: () => {
        this.eliminandoId = null;
        this.mostrarMensaje('Desagregación eliminada correctamente.');
        this.cargarDesagregaciones();
      },
      error: (error) => {
        this.eliminandoId = null;
        this.error =
          error.error || 'No fue posible eliminar la desagregación.';
      },
    });
  }

  private cargarDesagregaciones(): void {
    const idTabulado = this.desagregacion.idTabulado;
    if (!idTabulado) {
      return;
    }

    this.cargando = true;
    this.error = '';
    this.desagregacionesService.obtenerPorTabulado(idTabulado).subscribe({
      next: (desagregaciones) => {
        if (idTabulado === this.desagregacion.idTabulado) {
          this.desagregaciones = desagregaciones;
          this.cargando = false;
        }
      },
      error: (error) => {
        if (idTabulado === this.desagregacion.idTabulado) {
          this.desagregaciones = [];
          this.cargando = false;
          this.error =
            error.error || 'No fue posible consultar las desagregaciones.';
        }
      },
    });
  }

  private mostrarMensaje(mensaje: string): void {
    this.mensaje = mensaje;
    if (this.mensajeTimeout) {
      clearTimeout(this.mensajeTimeout);
    }
    this.mensajeTimeout = setTimeout(() => {
      this.mensaje = '';
    }, 2000);
  }

  private primeraLetraMayuscula(valor: string): string {
    return valor
      ? valor.charAt(0).toUpperCase() + valor.slice(1)
      : valor;
  }
}
