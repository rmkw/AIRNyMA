import { CapturaDesagregacionComponent } from '@/tabulados/components/captura-desagregacion/captura-desagregacion.component';
import { CapturaDesgloseComponent } from '@/tabulados/components/captura-desglose/captura-desglose.component';
import { CapturaTabuladoComponent } from '@/tabulados/components/captura-tabulado/captura-tabulado.component';
import { VariablesTabuladosComponent } from '@/tabulados/components/variables-tabulados/variables-tabulados.component';
import { Tabulado } from '@/tabulados/interfaces/tabulado.interface';
import { TabuladosService } from '@/tabulados/services/tabulados.service';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tabulados-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CapturaTabuladoComponent,
    CapturaDesagregacionComponent,
    CapturaDesgloseComponent,
    VariablesTabuladosComponent,
  ],
  templateUrl: './tabulados-page.component.html',
})
export class TabuladosPageComponent implements OnDestroy {
  private tabuladosService = inject(TabuladosService);
  private mensajeTimeout?: ReturnType<typeof setTimeout>;

  @ViewChild(CapturaTabuladoComponent)
  capturaTabulado?: CapturaTabuladoComponent;

  @ViewChild('eliminarTabuladoModal')
  eliminarTabuladoModal?: ElementRef<HTMLDialogElement>;

  tabulados: Tabulado[] = [];
  tabuladosBase: Tabulado[] = [];
  tabuladoSeleccionado: Tabulado | null = null;
  tabuladoPorEliminar: Tabulado | null = null;
  cargando = false;
  guardando = false;
  eliminando = false;
  seleccionandoId = '';
  errorListado = '';
  mensaje = '';
  mensajeEsError = false;
  filtroIdTabulado = '';
  procesoSeleccionado = '';

  ngOnDestroy(): void {
    if (this.mensajeTimeout) clearTimeout(this.mensajeTimeout);
  }

  actualizarFiltro(valor: string) {
    this.filtroIdTabulado = valor;
    this.errorListado = '';
    this.filtrarResultadosLocales();
  }

  cambiarProceso(acronimo: string | null) {
    this.procesoSeleccionado = acronimo ?? '';
    this.tabuladoSeleccionado = null;
    this.tabuladoPorEliminar = null;
    this.filtroIdTabulado = '';
    this.tabuladosBase = [];
    this.tabulados = [];
    this.errorListado = '';

    if (!acronimo) {
      this.cargando = false;
      return;
    }

    this.cargarTabuladosProceso();
  }

  cargarTabuladosProceso() {
    if (!this.procesoSeleccionado) return;
    const proceso = this.procesoSeleccionado;
    this.cargando = true;
    this.errorListado = '';

    this.tabuladosService
      .obtenerPorProceso(proceso)
      .subscribe({
      next: (tabulados) => {
        if (proceso === this.procesoSeleccionado) {
          this.tabuladosBase = tabulados;
          this.filtrarResultadosLocales();
          this.cargando = false;
        }
      },
      error: (error: HttpErrorResponse) => {
        if (proceso === this.procesoSeleccionado) {
          this.tabuladosBase = [];
          this.tabulados = [];
          this.cargando = false;
          this.errorListado = this.obtenerMensajeError(error);
        }
      },
    });
  }

  guardarTabulado(tabulado: Tabulado) {
    this.guardando = true;
    const operacion = this.tabuladoSeleccionado
      ? this.tabuladosService.actualizar(
          this.tabuladoSeleccionado.idTabulado,
          tabulado,
        )
      : this.tabuladosService.guardar(tabulado);
    const mensajeExito = this.tabuladoSeleccionado
      ? 'Tabulado actualizado correctamente.'
      : 'Tabulado registrado correctamente.';

    operacion.subscribe({
      next: () => {
        this.guardando = false;
        this.tabuladoSeleccionado = null;
        this.capturaTabulado?.limpiarDatosTabulado();
        this.mostrarMensaje(mensajeExito);
        this.refrescarBusquedaActual();
      },
      error: (error: HttpErrorResponse) => {
        this.guardando = false;
        this.mostrarMensaje(this.obtenerMensajeError(error), true);
      },
    });
  }

  seleccionarTabulado(idTabulado: string) {
    this.seleccionandoId = idTabulado;

    this.tabuladosService.obtenerPorId(idTabulado).subscribe({
      next: (tabulado) => {
        this.tabuladoSeleccionado = tabulado;
        this.seleccionandoId = '';
      },
      error: (error: HttpErrorResponse) => {
        this.seleccionandoId = '';
        this.mostrarMensaje(this.obtenerMensajeError(error), true);
      },
    });
  }

  cancelarEdicion() {
    this.tabuladoSeleccionado = null;
  }

  solicitarEliminar(tabulado: Tabulado) {
    this.tabuladoPorEliminar = tabulado;
    this.eliminarTabuladoModal?.nativeElement.showModal();
  }

  cancelarEliminar() {
    this.eliminarTabuladoModal?.nativeElement.close();
    this.tabuladoPorEliminar = null;
  }

  confirmarEliminar() {
    if (!this.tabuladoPorEliminar || this.eliminando) return;

    const idTabulado = this.tabuladoPorEliminar.idTabulado;
    this.eliminando = true;

    this.tabuladosService.eliminar(idTabulado).subscribe({
      next: () => {
        this.eliminando = false;
        this.eliminarTabuladoModal?.nativeElement.close();
        this.tabuladoPorEliminar = null;

        if (this.tabuladoSeleccionado?.idTabulado === idTabulado) {
          this.tabuladoSeleccionado = null;
          this.capturaTabulado?.limpiarDatosTabulado();
        }

        this.mostrarMensaje('Tabulado eliminado correctamente.');
        this.refrescarBusquedaActual();
      },
      error: (error: HttpErrorResponse) => {
        this.eliminando = false;
        this.mostrarMensaje(this.obtenerMensajeError(error), true);
      },
    });
  }

  private refrescarBusquedaActual() {
    if (!this.procesoSeleccionado) {
      this.tabuladosBase = [];
      this.tabulados = [];
      return;
    }
    this.cargarTabuladosProceso();
  }

  private filtrarResultadosLocales() {
    const filtro = this.filtroIdTabulado.trim().toLocaleLowerCase();
    this.tabulados = this.tabuladosBase.filter(
      (tabulado) =>
        tabulado.idTabulado.toLocaleLowerCase().includes(filtro) ||
        tabulado.tabulado.toLocaleLowerCase().includes(filtro),
    );
  }

  private mostrarMensaje(mensaje: string, esError = false) {
    this.mensaje = mensaje;
    this.mensajeEsError = esError;

    if (this.mensajeTimeout) clearTimeout(this.mensajeTimeout);
    this.mensajeTimeout = setTimeout(() => {
      this.mensaje = '';
    }, 2000);
  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    return 'Ocurrió un error al procesar la solicitud.';
  }
}
