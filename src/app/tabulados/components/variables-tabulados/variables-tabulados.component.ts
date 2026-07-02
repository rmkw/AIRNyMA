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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-variables-tabulados',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './variables-tabulados.component.html',
})
export class VariablesTabuladosComponent implements OnDestroy {
  private service = inject(VariablesTabuladosService);
  private busquedaSubscription?: Subscription;
  private ultimoTerminoConsultado = '';
  private mensajeTimeout?: ReturnType<typeof setTimeout>;

  @ViewChild('relacionModal')
  relacionModal?: ElementRef<HTMLDialogElement>;

  private _idTabulado: string | null = null;

  @Input()
  set idTabulado(value: string | null) {
    if (value === this._idTabulado) return;
    this._idTabulado = value;
    this.limpiarBusqueda();
    this.variablesRelacionadas = [];
    this.error = '';
    this.mensaje = '';
    if (value) this.cargarRelaciones();
  }

  get idTabulado(): string | null {
    return this._idTabulado;
  }

  filtroIdA = '';
  variablesDisponibles: VariableResumen[] = [];
  variablesBase: VariableResumen[] = [];
  variablesRelacionadas: VariableTabulado[] = [];
  variablePorRelacionar: VariableResumen | null = null;
  comentarioA = '';
  buscando = false;
  cargandoRelaciones = false;
  guardando = false;
  eliminandoId: number | null = null;
  error = '';
  mensaje = '';

  ngOnDestroy(): void {
    this.busquedaSubscription?.unsubscribe();
    if (this.mensajeTimeout) clearTimeout(this.mensajeTimeout);
  }

  actualizarFiltro(valor: string): void {
    this.filtroIdA = valor;
    this.error = '';
    const termino = valor.trim();

    if (termino.length < 2) {
      this.busquedaSubscription?.unsubscribe();
      this.buscando = false;
      this.variablesBase = [];
      this.variablesDisponibles = [];
      this.ultimoTerminoConsultado = '';
      return;
    }

    this.filtrarResultadosLocales();
    const esPrimeraConsulta = !this.ultimoTerminoConsultado;
    const cambioDeBusqueda = !termino
      .toLocaleLowerCase()
      .startsWith(this.ultimoTerminoConsultado.toLocaleLowerCase());
    if (
      esPrimeraConsulta ||
      cambioDeBusqueda ||
      this.esHitoDeBusqueda(termino)
    ) {
      this.buscarVariables(termino);
    }
  }

  nombreVariable(variable: VariableResumen | VariableTabulado): string {
    return variable.variableA || variable.variableS || 'Sin nombre';
  }

  abrirRelacion(variable: VariableResumen): void {
    if (!this.idTabulado) return;
    this.variablePorRelacionar = variable;
    this.comentarioA = '';
    this.relacionModal?.nativeElement.showModal();
  }

  cerrarRelacion(): void {
    this.relacionModal?.nativeElement.close();
    this.variablePorRelacionar = null;
    this.comentarioA = '';
  }

  guardarRelacion(): void {
    if (
      !this.idTabulado ||
      !this.variablePorRelacionar ||
      !this.comentarioA.trim() ||
      this.guardando
    ) {
      return;
    }

    this.guardando = true;
    this.error = '';
    this.service
      .guardar({
        idA: this.variablePorRelacionar.idA,
        idTabulado: this.idTabulado,
        comentarioA: this.comentarioA.trim(),
      })
      .subscribe({
        next: () => {
          this.guardando = false;
          this.cerrarRelacion();
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

  buscarVariables(termino: string, forzar = false): void {
    const normalizado = termino.trim();
    if (!this.idTabulado || normalizado.length < 2) return;
    if (!forzar && normalizado === this.ultimoTerminoConsultado) return;

    this.busquedaSubscription?.unsubscribe();
    this.buscando = true;
    this.ultimoTerminoConsultado = normalizado;
    this.busquedaSubscription = this.service
      .buscarVariables(normalizado)
      .subscribe({
        next: (variables) => {
          this.variablesBase = variables;
          this.filtrarResultadosLocales();
          this.buscando = false;
        },
        error: (error) => {
          this.variablesBase = [];
          this.variablesDisponibles = [];
          this.buscando = false;
          this.error =
            error.error || 'No fue posible consultar las variables.';
        },
      });
  }

  private esHitoDeBusqueda(termino: string): boolean {
    if (termino.length === 2) return true;
    const guiones = (termino.match(/-/g) ?? []).length;
    const terminaEnGuion = termino.endsWith('-') && guiones <= 2;
    const idCompleto = /^[^-]+-\d+-\d{4}$/.test(termino);
    return terminaEnGuion || idCompleto;
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
    this.busquedaSubscription?.unsubscribe();
    this.filtroIdA = '';
    this.variablesBase = [];
    this.variablesDisponibles = [];
    this.ultimoTerminoConsultado = '';
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
