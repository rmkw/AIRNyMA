import { CapturaDesagregacionComponent } from '@/tabulados/components/captura-desagregacion/captura-desagregacion.component';
import { CapturaTabuladoComponent } from '@/tabulados/components/captura-tabulado/captura-tabulado.component';
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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tabulados-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CapturaTabuladoComponent,
    CapturaDesagregacionComponent,
  ],
  templateUrl: './tabulados-page.component.html',
})
export class TabuladosPageComponent implements OnDestroy {
  private tabuladosService = inject(TabuladosService);
  private mensajeTimeout?: ReturnType<typeof setTimeout>;
  private busquedaSubscription?: Subscription;
  private ultimoPrefijoConsultado = '';

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

  ngOnDestroy(): void {
    this.busquedaSubscription?.unsubscribe();
    if (this.mensajeTimeout) clearTimeout(this.mensajeTimeout);
  }

  actualizarFiltro(valor: string) {
    this.filtroIdTabulado = valor.toUpperCase();
    this.errorListado = '';

    if (this.filtroIdTabulado.length < 2) {
      this.busquedaSubscription?.unsubscribe();
      this.cargando = false;
      this.tabuladosBase = [];
      this.tabulados = [];
      this.ultimoPrefijoConsultado = '';
      return;
    }

    this.filtrarResultadosLocales();

    if (this.esHitoDeBusqueda(this.filtroIdTabulado)) {
      this.buscarTabulados(this.filtroIdTabulado);
    }
  }

  buscarTabulados(prefijo: string, forzar = false) {
    const prefijoNormalizado = prefijo.trim().toUpperCase();
    if (prefijoNormalizado.length < 2) return;
    if (!forzar && prefijoNormalizado === this.ultimoPrefijoConsultado) return;

    this.busquedaSubscription?.unsubscribe();
    this.cargando = true;
    this.errorListado = '';
    this.ultimoPrefijoConsultado = prefijoNormalizado;

    this.busquedaSubscription = this.tabuladosService
      .buscarPorPrefijo(prefijoNormalizado)
      .subscribe({
      next: (tabulados) => {
        this.tabuladosBase = tabulados;
        this.filtrarResultadosLocales();
        this.cargando = false;
      },
      error: (error: HttpErrorResponse) => {
        this.tabuladosBase = [];
        this.tabulados = [];
        this.cargando = false;
        this.errorListado = this.obtenerMensajeError(error);
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
        this.capturaTabulado?.limpiarFormulario();
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
          this.capturaTabulado?.limpiarFormulario();
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
    if (this.filtroIdTabulado.length < 2) {
      this.tabuladosBase = [];
      this.tabulados = [];
      return;
    }

    this.buscarTabulados(this.filtroIdTabulado, true);
  }

  private filtrarResultadosLocales() {
    this.tabulados = this.tabuladosBase.filter((tabulado) =>
      tabulado.idTabulado.startsWith(this.filtroIdTabulado),
    );
  }

  private esHitoDeBusqueda(filtro: string): boolean {
    if (filtro.length === 2) return true;

    const cantidadGuiones = (filtro.match(/-/g) ?? []).length;
    const esPrimerOSegundoGuion =
      filtro.endsWith('-') && cantidadGuiones <= 2;
    const esIdCompleto = /^.+-\d+-\d{4}-T$/.test(filtro);

    return esPrimerOSegundoGuion || esIdCompleto;
  }

  private mostrarMensaje(mensaje: string, esError = false) {
    this.mensaje = mensaje;
    this.mensajeEsError = esError;

    if (this.mensajeTimeout) clearTimeout(this.mensajeTimeout);
    this.mensajeTimeout = setTimeout(() => {
      this.mensaje = '';
    }, 4000);
  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    return 'Ocurrió un error al procesar la solicitud.';
  }
}
