import {
  VariableResumen,
  VariableTabulado,
} from '@/tabulados/interfaces/variable-tabulado.interface';
import { VariablesTabuladosService } from '@/tabulados/services/variables-tabulados.service';
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-variables-tabulados',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './variables-tabulados.component.html',
})
export class VariablesTabuladosComponent implements OnDestroy {
  private service = inject(VariablesTabuladosService);
  private mensajeTimeout?: ReturnType<typeof setTimeout>;

  @ViewChild('comentarioModal')
  comentarioModal?: ElementRef<HTMLDialogElement>;

  private _idTabulado: string | null = null;
  private _acronimo: string | null = null;

  @Input()
  set acronimo(value: string | null) {
    if (value === this._acronimo) return;
    this._acronimo = value;
    this.cerrarRelacion();
    this.limpiarBusqueda();
    this.variablesRelacionadas = [];
    this.error = '';
    this.mensaje = '';
    if (value) this.cargarVariablesProceso();
  }

  get acronimo(): string | null {
    return this._acronimo;
  }

  @Input()
  set idTabulado(value: string | null) {
    if (value === this._idTabulado) return;
    this._idTabulado = value;
    this.variablesRelacionadas = [];
    this.error = '';
    this.mensaje = '';
    if (value) {
      this.cargarRelaciones();
    } else {
      this.filtrarResultadosLocales();
    }
  }

  get idTabulado(): string | null {
    return this._idTabulado;
  }

  filtroIdA = '';
  variablesDisponibles: VariableResumen[] = [];
  variablesBase: VariableResumen[] = [];
  variablesRelacionadas: VariableTabulado[] = [];
  relacionEditando: VariableTabulado | null = null;
  comentarioA = '';
  buscando = false;
  cargandoRelaciones = false;
  guardando = false;
  eliminandoId: number | null = null;
  error = '';
  mensaje = '';

  ngOnDestroy(): void {
    if (this.mensajeTimeout) clearTimeout(this.mensajeTimeout);
  }

  actualizarFiltro(valor: string): void {
    this.filtroIdA = valor;
    this.error = '';
    this.filtrarResultadosLocales();
  }

  nombreVariable(variable: VariableResumen | VariableTabulado): string {
    return variable.variableA || variable.variableS || 'Sin nombre';
  }

  cerrarRelacion(): void {
    if (this.comentarioModal?.nativeElement.open) {
      this.comentarioModal.nativeElement.close();
    }
    this.relacionEditando = null;
    this.comentarioA = '';
  }

  guardarRelacion(variable: VariableResumen): void {
    if (!this.idTabulado || this.guardando) return;

    this.guardando = true;
    this.error = '';
    this.service
      .guardar({
        idA: variable.idA,
        idTabulado: this.idTabulado,
        comentarioA: '-',
      })
      .subscribe({
        next: () => {
          this.guardando = false;
          this.mostrarMensaje('Variable relacionada correctamente.');
          this.cargarRelaciones();
          this.filtrarResultadosLocales();
        },
        error: (error) => {
          this.guardando = false;
          this.error =
            error.error || 'No fue posible relacionar la variable.';
        },
      });
  }

  abrirEdicionComentario(relacion: VariableTabulado): void {
    this.relacionEditando = relacion;
    this.comentarioA = relacion.comentarioA || '-';
    this.comentarioModal?.nativeElement.showModal();
  }

  actualizarComentario(): void {
    const relacion = this.relacionEditando;
    const comentarioA = this.comentarioA.trim();
    if (relacion?.idUnique == null || !comentarioA || this.guardando) return;

    this.guardando = true;
    this.error = '';
    this.service
      .actualizar(relacion.idUnique, { ...relacion, comentarioA })
      .subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarRelacion();
          this.mostrarMensaje('Comentario actualizado correctamente.');
          this.cargarRelaciones();
        },
        error: (error) => {
          this.guardando = false;
          this.error = error.error || 'No fue posible actualizar el comentario.';
        },
      });
  }

  eliminarRelacion(relacion: VariableTabulado): void {
    if (relacion.idUnique == null || this.eliminandoId != null) return;
    this.eliminandoId = relacion.idUnique;
    this.error = '';
    this.service.eliminar(relacion.idUnique).subscribe({
      next: () => {
        this.eliminandoId = null;
        this.mostrarMensaje('Relación eliminada correctamente.');
        this.cargarRelaciones();
        this.filtrarResultadosLocales();
      },
      error: (error) => {
        this.eliminandoId = null;
        this.error = error.error || 'No fue posible eliminar la relación.';
      },
    });
  }

  private cargarVariablesProceso(): void {
    const acronimo = this.acronimo;
    if (!acronimo) return;
    this.buscando = true;
    this.service.obtenerVariablesPorProceso(acronimo).subscribe({
      next: (variables) => {
        if (acronimo === this.acronimo) {
          this.variablesBase = variables;
          this.filtrarResultadosLocales();
          this.buscando = false;
        }
      },
      error: (error) => {
        if (acronimo === this.acronimo) {
          this.variablesBase = [];
          this.variablesDisponibles = [];
          this.buscando = false;
          this.error =
            error.error ||
            'No fue posible consultar las variables del proceso.';
        }
      },
    });
  }

  private filtrarResultadosLocales(): void {
    const filtro = this.filtroIdA.trim().toLocaleLowerCase();
    const relacionadas = new Set(
      this.variablesRelacionadas.map((relacion) => relacion.idA),
    );
    this.variablesDisponibles = this.variablesBase.filter((variable) => {
      const coincide =
        variable.idA.toLocaleLowerCase().includes(filtro) ||
        (variable.variableA ?? '').toLocaleLowerCase().includes(filtro) ||
        (variable.variableS ?? '').toLocaleLowerCase().includes(filtro);
      return coincide && !relacionadas.has(variable.idA);
    });
  }

  private cargarRelaciones(): void {
    const idTabulado = this.idTabulado;
    if (!idTabulado) return;
    this.cargandoRelaciones = true;
    this.service.obtenerPorTabulado(idTabulado).subscribe({
      next: (relaciones) => {
        if (idTabulado === this.idTabulado) {
          this.variablesRelacionadas = relaciones;
          this.cargandoRelaciones = false;
          this.filtrarResultadosLocales();
        }
      },
      error: (error) => {
        if (idTabulado === this.idTabulado) {
          this.variablesRelacionadas = [];
          this.cargandoRelaciones = false;
          this.error =
            error.error || 'No fue posible consultar las relaciones.';
        }
      },
    });
  }

  private limpiarBusqueda(): void {
    this.filtroIdA = '';
    this.variablesBase = [];
    this.variablesDisponibles = [];
    this.buscando = false;
  }

  private mostrarMensaje(mensaje: string): void {
    this.mensaje = mensaje;
    if (this.mensajeTimeout) clearTimeout(this.mensajeTimeout);
    this.mensajeTimeout = setTimeout(() => {
      this.mensaje = '';
    }, 2000);
  }
}
