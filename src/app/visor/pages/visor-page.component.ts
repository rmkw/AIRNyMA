import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EMPTY, Subject, Subscription, catchError, forkJoin, of, switchMap, timer } from 'rxjs';
import { VisorService } from '../services/visor.service';
import { FiltrosVisor, OpcionesVisor, PaginaVisor } from '../interfaces/visor.interface';
import { VariablesArmoService } from '@/variables/services/armonizacion/variables-armo.service';
import { MdeaTraducido, OdsTraducido, VariableDetalleArmo } from '@/variables/interfaces/armonizacion/variables-armo.interface';
import { DetalleVisorComponent } from '../components/detalle-visor.component';

@Component({
  selector: 'app-visor-page',
  standalone: true,
  imports: [FormsModule, DetalleVisorComponent],
  templateUrl: './visor-page.component.html',
})
export class VisorPageComponent implements OnInit, OnDestroy {
  private service = inject(VisorService);
  private variablesService = inject(VariablesArmoService);
  private cambios = new Subject<{ opciones: boolean; espera: number }>();
  private consulta = new Subscription();
  private consultaDetalle = new Subscription();
  @ViewChild('detalleModal') detalleModal!: ElementRef<HTMLDialogElement>;
  filtros = this.vacios();
  opciones: OpcionesVisor = { unidades: [], procesos: [], fuentes: [], anios: [],
    tematica: [], tema1: [], subtema1: [], tema2: [], subtema2: [] };
  pagina: PaginaVisor = { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 };
  page = 0;
  size = 20;
  cargando = false;
  cargandoOpciones = false;
  error = '';
  detalle: VariableDetalleArmo | null = null;
  idDetalle = '';
  cargandoDetalle = false;
  errorDetalle = '';
  avisosDetalle: string[] = [];
  mdeas: MdeaTraducido[] = [];
  ods: OdsTraducido[] = [];
  readonly temas = [
    { campo: 'tematica', label: 'Temática' }, { campo: 'tema1', label: 'Tema 1' },
    { campo: 'subtema1', label: 'Subtema 1' }, { campo: 'tema2', label: 'Tema 2' },
    { campo: 'subtema2', label: 'Subtema 2' },
  ] as const;
  readonly banderas = [
    { campo: 'clasificacion', label: 'Clasificación' }, { campo: 'tabulados', label: 'Tabulados' },
    { campo: 'datosabiertos', label: 'Datos abiertos' }, { campo: 'mdea', label: 'MDEA' },
    { campo: 'ods', label: 'ODS' }, { campo: 'validada', label: 'Revisada' },
    { campo: 'microdatos', label: 'Microdatos' },
  ] as const;

  ngOnInit() {
    this.consulta = this.cambios.pipe(
      switchMap(cambio => {
        this.cargando = true;
        this.error = '';
        const necesitaOpciones = cambio.opciones || this.cargandoOpciones;
        this.cargandoOpciones = necesitaOpciones;
        return timer(cambio.espera).pipe(
          switchMap(() => necesitaOpciones ? this.service.opciones(this.filtros) : of(null)),
          switchMap(opciones => {
            if (!opciones) return of(null);
            this.opciones = opciones;
            const cambiaronTemas = this.limpiarInvalidos();
            return cambiaronTemas ? this.service.opciones(this.filtros) : of(null);
          }),
          switchMap(opciones => {
            if (opciones) { this.opciones = opciones; this.limpiarInvalidos(); }
            this.cargandoOpciones = false;
            return this.service.listar(this.filtros, this.page, this.size);
          }),
          catchError(() => {
            this.cargando = false;
            this.cargandoOpciones = false;
            this.pagina = { content: [], page: this.page, size: this.size, totalElements: 0, totalPages: 0 };
            this.error = 'No fue posible consultar el Visor. Comprueba la conexión e intenta nuevamente.';
            return EMPTY;
          }),
        );
      }),
    ).subscribe(pagina => { this.pagina = pagina; this.cargando = false; });
    this.cambios.next({ opciones: true, espera: 0 });
  }

  cambiar(campo: keyof FiltrosVisor, valor: string) {
    this.filtros = { ...this.filtros, [campo]: valor };
    if (campo === 'unidad') { this.filtros.acronimo = ''; this.filtros.idFuente = ''; }
    if (campo === 'acronimo') this.filtros.idFuente = '';
    if (campo === 'tema1') this.filtros.subtema1 = '';
    if (campo === 'tema2') this.filtros.subtema2 = '';
    this.page = 0;
    this.cambios.next({
      opciones: ['unidad', 'acronimo', 'idFuente', 'tema1', 'tema2'].includes(campo),
      espera: campo === 'variableA' ? 400 : 0,
    });
  }

  private limpiarInvalidos() {
    const temaAnterior = this.filtros.tema1 + '|' + this.filtros.tema2;
    for (const { campo } of this.temas) {
      if (!this.opciones[campo].includes(this.filtros[campo])) this.filtros[campo] = '';
    }
    if (!this.opciones.anios.map(String).includes(this.filtros.anioReferencia)) this.filtros.anioReferencia = '';
    if (!this.opciones.procesos.some(p => p.acronimo === this.filtros.acronimo)) {
      this.filtros.acronimo = ''; this.filtros.idFuente = '';
    }
    if (!this.opciones.fuentes.some(f => f.idFuente === this.filtros.idFuente)) this.filtros.idFuente = '';
    return temaAnterior !== this.filtros.tema1 + '|' + this.filtros.tema2;
  }

  limpiar() {
    this.filtros = this.vacios();
    this.page = 0;
    this.size = 20;
    this.cambios.next({ opciones: true, espera: 0 });
  }

  cambiarTamano(size: string) {
    this.size = Number(size);
    this.page = 0;
    this.cambios.next({ opciones: false, espera: 0 });
  }

  irPagina(page: number) {
    if (this.cargando || page < 0 || page >= this.pagina.totalPages) return;
    this.page = page;
    this.cambios.next({ opciones: false, espera: 0 });
  }

  reintentar() { this.cambios.next({ opciones: true, espera: 0 }); }

  abrirDetalle(idA: string) {
    this.consultaDetalle.unsubscribe();
    this.idDetalle = idA;
    this.detalle = null;
    this.mdeas = [];
    this.ods = [];
    this.avisosDetalle = [];
    this.errorDetalle = '';
    this.cargandoDetalle = true;
    if (!this.detalleModal.nativeElement.open) this.detalleModal.nativeElement.showModal();
    this.consultaDetalle = this.variablesService.obtenerDetallePorIdA(idA).pipe(
      switchMap(detalle => {
        this.detalle = detalle;
        this.cargandoDetalle = false;
        return forkJoin({
          mdeas: this.variablesService.obtenerMdeaTraducido(idA).pipe(catchError(() => {
            this.avisosDetalle.push('No se pudieron consultar los nombres de MDEA. Se muestran sus códigos.');
            return of([]);
          })),
          ods: this.variablesService.obtenerOdsTraducido(idA).pipe(catchError(() => {
            this.avisosDetalle.push('No se pudieron consultar los nombres de ODS. Se muestran sus códigos.');
            return of([]);
          })),
        });
      }),
    ).subscribe({
      next: traducciones => { this.mdeas = traducciones.mdeas; this.ods = traducciones.ods; },
      error: () => {
        this.cargandoDetalle = false;
        this.errorDetalle = 'No fue posible cargar el detalle de esta variable.';
      },
    });
  }

  cerrarDetalle() { this.detalleModal.nativeElement.close(); this.limpiarDetalle(); }
  limpiarDetalle() {
    this.consultaDetalle.unsubscribe();
    this.detalle = null;
    this.cargandoDetalle = false;
  }

  ngOnDestroy() { this.consulta.unsubscribe(); this.consultaDetalle.unsubscribe(); }

  private vacios(): FiltrosVisor {
    return { unidad: '', acronimo: '', idFuente: '', variableA: '', anioReferencia: '',
      tematica: '', tema1: '', subtema1: '', tema2: '', subtema2: '',
      clasificacion: '', tabulados: '', datosabiertos: '', mdea: '', ods: '', validada: '', microdatos: '' };
  }
}
