import { Desglose } from '@/tabulados/interfaces/desglose.interface';
import { DesglosesService } from '@/tabulados/services/desgloses.service';
import { Component, Input, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-captura-desglose',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './captura-desglose.component.html',
})
export class CapturaDesgloseComponent implements OnDestroy {
  private desglosesService = inject(DesglosesService);
  private mensajeTimeout?: ReturnType<typeof setTimeout>;

  desglose: Desglose = {
    idTabulado: '',
    desglose: '',
    comentarioA: '',
  };
  desgloses: Desglose[] = [];
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
    if (idTabulado === this.desglose.idTabulado) {
      return;
    }

    this.desglose = {
      idTabulado,
      desglose: '',
      comentarioA: '',
    };
    this.desgloses = [];
    this.mensaje = '';
    this.error = '';

    if (idTabulado) {
      this.cargarDesgloses();
    }
  }

  get formularioValido(): boolean {
    return !!(
      this.desglose.idTabulado &&
      this.desglose.desglose.trim() &&
      this.desglose.comentarioA.trim()
    );
  }

  actualizarDesglose(valor: string): void {
    this.desglose.desglose = this.primeraLetraMayuscula(valor);
  }

  guardar(): void {
    if (!this.formularioValido || this.guardando) {
      return;
    }

    this.guardando = true;
    this.mensaje = '';
    this.error = '';
    this.desglosesService
      .guardar({
        ...this.desglose,
        desglose: this.primeraLetraMayuscula(
          this.desglose.desglose.trim(),
        ),
        comentarioA: this.desglose.comentarioA.trim(),
      })
      .subscribe({
        next: () => {
          this.guardando = false;
          this.desglose.desglose = '';
          this.desglose.comentarioA = '';
          this.mostrarMensaje('Desglose guardado correctamente.');
          this.cargarDesgloses();
        },
        error: (error) => {
          this.guardando = false;
          this.error = error.error || 'No fue posible guardar el desglose.';
        },
      });
  }

  eliminar(desglose: Desglose): void {
    if (desglose.idUnique == null || this.eliminandoId != null) {
      return;
    }

    this.eliminandoId = desglose.idUnique;
    this.mensaje = '';
    this.error = '';
    this.desglosesService.eliminar(desglose.idUnique).subscribe({
      next: () => {
        this.eliminandoId = null;
        this.mostrarMensaje('Desglose eliminado correctamente.');
        this.cargarDesgloses();
      },
      error: (error) => {
        this.eliminandoId = null;
        this.error = error.error || 'No fue posible eliminar el desglose.';
      },
    });
  }

  private cargarDesgloses(): void {
    const idTabulado = this.desglose.idTabulado;
    if (!idTabulado) {
      return;
    }

    this.cargando = true;
    this.error = '';
    this.desglosesService.obtenerPorTabulado(idTabulado).subscribe({
      next: (desgloses) => {
        if (idTabulado === this.desglose.idTabulado) {
          this.desgloses = desgloses;
          this.cargando = false;
        }
      },
      error: (error) => {
        if (idTabulado === this.desglose.idTabulado) {
          this.desgloses = [];
          this.cargando = false;
          this.error =
            error.error || 'No fue posible consultar los desgloses.';
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
