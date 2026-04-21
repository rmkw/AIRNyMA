import { FiEcoResponce } from '@/fuenteIdentificacion/interfaces/fiEco-responce.interface';
import { FuenteIdentificacionService } from '@/fuenteIdentificacion/services/fuente-identificacion.service';
import { interface_ProcesoP } from '@/procesoProduccion/interfaces/procesos.interface';
import { DireccionesService } from '@/procesoProduccion/services/direcciones.service';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { Direccion } from '@/variables/interfaces/direcciones.interface';
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-fuentes',
  imports: [CommonModule, FormsModule],
  templateUrl: './fuentes.component.html',
})
export class FuentesComponent implements OnInit {
  _serviceDirecciones = inject(DireccionesService);
  _procesoService = inject(ppEcoService);
  _fuenteService = inject(FuenteIdentificacionService);

  arrDirecciones: Direccion[] = [];
  arrProcesosByDir: interface_ProcesoP[] = [];

  procesoSeleccionado = signal<interface_ProcesoP | null>(null);

  idProsesoSelect: any = null;
  direccionName: string | number | undefined = undefined;
  _procesos_isSelectEnabled: boolean = false;

  direccionSeleccionada = '';
  procesoSeleccionadoValue = '';

  fuente = '';
  edicion = '';
  url = '';
  comentarioS = '';
  comentarioA = '';

  fuentes: FiEcoResponce[] = [];
  loading = false;

  fuenteEditando: FiEcoResponce | null = null;
  idFuenteAEliminar: string | null = null;

  @ViewChild('procesoProduccionTag')
  procesoProduccionTag!: ElementRef<HTMLSelectElement>;

  @ViewChild('modalEliminar')
  modalEliminar!: ElementRef<HTMLDialogElement>;

  ngOnInit(): void {
    this.getDirecciones();
  }

  getDirecciones() {
    this._serviceDirecciones.getDirecciones().subscribe({
      next: (data) => {
        this.arrDirecciones = data;
        this.intentarPrecargarDesdeLocalStorage();
      },
      error: (err) => {
        console.error('error al cargar direcciones', err);
      },
    });
  }

  intentarPrecargarDesdeLocalStorage() {
    const data = localStorage.getItem('procesoEditable');
    if (!data) return;

    try {
      const procesoGuardado = JSON.parse(data);

      if (!procesoGuardado?.direccion || !procesoGuardado?.acronimo) {
        localStorage.removeItem('procesoEditable');
        return;
      }

      this.direccionSeleccionada = procesoGuardado.direccion;
      this.direccionName = procesoGuardado.direccion;
      this._procesos_isSelectEnabled = true;

      this._procesoService
        .getPorDireccionGeneral(procesoGuardado.direccion)
        .subscribe({
          next: (data) => {
            this.arrProcesosByDir = data;

            const procesoEncontrado =
              this.arrProcesosByDir.find(
                (procesoItem) =>
                  procesoItem.acronimo === procesoGuardado.acronimo,
              ) || null;

            if (!procesoEncontrado) {
              localStorage.removeItem('procesoEditable');
              this.procesoSeleccionado.set(null);
              this.procesoSeleccionadoValue = '';
              return;
            }

            this.procesoSeleccionado.set(procesoEncontrado);
            this.procesoSeleccionadoValue = procesoEncontrado.acronimo;

            this.cargarFuentesPorProceso(procesoEncontrado.acronimo);
          },
          error: (err) => {
            console.error('Error al precargar procesos por dirección', err);
            localStorage.removeItem('procesoEditable');
          },
        });
    } catch (error) {
      console.error('Error al leer procesoEditable del localStorage', error);
      localStorage.removeItem('procesoEditable');
    }
  }

  selectedDireccion(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const nameDi = selectElement.value;

    this.direccionName = nameDi;
    this.direccionSeleccionada = nameDi;
    this._procesos_isSelectEnabled = true;

    this.procesoSeleccionado.set(null);
    this.procesoSeleccionadoValue = '';

    this.fuentes = [];
    this.limpiarFormularioFuente();

    localStorage.removeItem('procesoEditable');

    this.cargarProcesosProduccionByDireccionGeneral(nameDi);
    this.currentPage = 0;
    this.totalItems = 0;
    this.totalPages = 0;
    this.pageRange = [];
    this.paginatedFuentes = [];
  }

  cargarProcesosProduccionByDireccionGeneral(
    dire: string | number | undefined,
  ) {
    this._procesoService.getPorDireccionGeneral(dire).subscribe({
      next: (data) => {
        this.arrProcesosByDir = data;
      },
      error: (err) => {
        console.error('Error al obtener procesos por DG', err);
      },
    });
  }

  seleccionarProceso(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const proceso = selectElement.value;

    const procesoEncontrado =
      this.arrProcesosByDir.find(
        (procesoItem) => procesoItem.acronimo === proceso,
      ) || null;

    this.procesoSeleccionado.set(procesoEncontrado);
    this.procesoSeleccionadoValue = proceso;

    this.fuentes = [];
    this.limpiarFormularioFuente();

    localStorage.removeItem('procesoEditable');

    if (procesoEncontrado?.acronimo) {
      this.cargarFuentesPorProceso(procesoEncontrado.acronimo);
    }
    this.currentPage = 0;
    this.totalItems = 0;
    this.totalPages = 0;
    this.pageRange = [];
    this.paginatedFuentes = [];
  }

  cargarFuentesPorProceso(acronimo: string) {
    if (!acronimo) {
      console.error('Acrónimo de proceso no definido');
      this.fuentes = [];
      this.paginatedFuentes = [];
      return;
    }

    this.loading = true;
    this.fuentes = [];
    this.paginatedFuentes = [];

    this._fuenteService.getByAcronimo(acronimo).subscribe({
      next: (response) => {
        this.fuentes = response ?? [];
        this.currentPage = 0;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener fuentes:', err);
        this.fuentes = [];
        this.paginatedFuentes = [];
        this.loading = false;
      },
    });
  }

  guardarFuente() {
    const acronimo = this.procesoSeleccionado()?.acronimo;
    const userId = this.obtenerUsuarioId();

    if (!acronimo) {
      console.error('No hay proceso seleccionado');
      return;
    }

    if (!this.formularioFuenteValido()) {
      this.abrirModalSinDatos();
      return;
    }

    if (!userId) {
      console.error('No se pudo obtener el id del usuario logueado');
      return;
    }

    const payload = {
      acronimo,
      fuente: this.fuente.trim(),
      url: this.url?.trim() || null,
      edicion: this.edicion?.toString().trim() || null,
      comentarioS: this.comentarioS?.trim() || '',
      comentarioA: '-',
      idFuenteSeleccion: this.fuenteEditando?.idFuente ?? null,
    };

    if (this.fuenteEditando?.idFuente) {
      this._fuenteService
        .editarFuente(this.fuenteEditando.idFuente, {
          ...payload,
          responsableRegister:
            this.fuenteEditando.responsableRegister ?? userId,
          responsableActualizacion: userId,
        })
        .subscribe({
          next: (resp) => {
            if (!resp) return;
            this.limpiarFormularioFuente();
            this.cargarFuentesPorProceso(acronimo);
          },
          error: (err) => {
            console.error('Error al actualizar fuente:', err);
          },
        });

      return;
    }

    this._fuenteService.registrarFuente(payload).subscribe({
      next: (resp) => {
        if (!resp) return;
        this.limpiarFormularioFuente();
        this.cargarFuentesPorProceso(acronimo);
      },
      error: (err) => {
        console.error('Error al registrar fuente:', err);
      },
    });
  }

  limpiarFormularioFuente() {
    this.fuente = '';
    this.edicion = '';
    this.url = '';
    this.comentarioS = '';
    this.comentarioA = '-';
    this.fuenteEditando = null;
  }

  editarFuente(item: FiEcoResponce) {
    this.fuenteEditando = item;
    this.fuente = item.fuente ?? '';
    this.edicion = item.edicion?.toString() ?? '';
    this.url = item.url ?? '';
    this.comentarioS = item.comentarioS ?? '';
  }

  abrirModalEliminar(idFuente: string) {
    this.idFuenteAEliminar = idFuente;
    this.modalEliminar?.nativeElement.showModal();
  }

  cerrarModalEliminar() {
    this.idFuenteAEliminar = null;
    this.modalEliminar?.nativeElement.close();
  }

  confirmarEliminarFuente() {
    const acronimo = this.procesoSeleccionado()?.acronimo;

    if (!this.idFuenteAEliminar) {
      this.cerrarModalEliminar();
      return;
    }

    this._fuenteService.eliminarFuente(this.idFuenteAEliminar).subscribe({
      next: () => {
        this.cerrarModalEliminar();

        if (this.fuenteEditando?.idFuente === this.idFuenteAEliminar) {
          this.limpiarFormularioFuente();
        }

        if (acronimo) {
          this.cargarFuentesPorProceso(acronimo);
        }
      },
      error: (err) => {
        console.error('Error al eliminar fuente:', err);
        this.cerrarModalEliminar();
      },
    });
  }

  //! helper
  obtenerUsuarioId(): number | null {
    const idDirecto = localStorage.getItem('_id');
    if (idDirecto) {
      const parsed = Number(idDirecto);
      return Number.isNaN(parsed) ? null : parsed;
    }

    const userResponse = localStorage.getItem('useResponce');
    if (userResponse) {
      try {
        const user = JSON.parse(userResponse);
        const parsed = Number(user?.id);
        return Number.isNaN(parsed) ? null : parsed;
      } catch (error) {
        console.error('Error al leer useResponce del localStorage', error);
      }
    }

    return null;
  }
  camposFaltantes: string[] = [];

  @ViewChild('modalSinDatos')
  modalSinDatos!: ElementRef<HTMLDialogElement>;

  formularioFuenteValido(): boolean {
    return !!(
      this.fuente?.trim() &&
      this.edicion?.toString().trim() &&
      this.url?.trim() &&
      this.comentarioS?.trim()
    );
  }

  obtenerCamposFaltantes(): string[] {
    const faltantes: string[] = [];

    if (!this.fuente?.trim()) faltantes.push('Fuente de identificación');
    if (!this.edicion?.toString().trim()) faltantes.push('Año del evento');
    if (!this.url?.trim()) faltantes.push('Liga de acceso');
    if (!this.comentarioS?.trim()) faltantes.push('Comentario');

    return faltantes;
  }

  abrirModalSinDatos() {
    this.camposFaltantes = this.obtenerCamposFaltantes();
    this.modalSinDatos?.nativeElement.showModal();
  }

  cloceModalSinDatos() {
    this.modalSinDatos?.nativeElement.close();
  }

  private _router = inject(Router);
  addVars(fuente: FiEcoResponce) {
    if (!fuente?.idFuente) {
      console.warn('Fuente inválida para asignar variables');
      return;
    }

    localStorage.removeItem('fuenteEditable');

    const fuenteEditable = {
      idFuente: fuente.idFuente,
      acronimo: fuente.acronimo,
      edicion: fuente.edicion,
    };

    localStorage.setItem('fuenteEditable', JSON.stringify(fuenteEditable));

    this._router.navigate(['/nueva-variable']);
  }
  pageSize = 10;
  pageSizes = [10, 20, 50];

  currentPage = 0;
  pagesPerRange = 5;

  totalItems = 0;
  totalPages = 0;

  paginatedFuentes: FiEcoResponce[] = [];
  pageRange: number[] = [];
  get isFirstRange(): boolean {
    return this.pageRange.length === 0 || this.pageRange[0] === 0;
  }

  get isLastRange(): boolean {
    return (
      this.pageRange.length === 0 ||
      this.pageRange[this.pageRange.length - 1] >= this.totalPages - 1
    );
  }
  updatePagination() {
    this.totalItems = this.fuentes.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    if (this.currentPage >= this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages - 1;
    }

    if (this.totalPages === 0) {
      this.currentPage = 0;
    }

    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedFuentes = this.fuentes.slice(start, end);

    this.updatePageRange();
  }

  updatePageRange() {
    const rangeStart =
      Math.floor(this.currentPage / this.pagesPerRange) * this.pagesPerRange;
    const rangeEnd = Math.min(rangeStart + this.pagesPerRange, this.totalPages);

    this.pageRange = Array.from(
      { length: rangeEnd - rangeStart },
      (_, i) => rangeStart + i,
    );
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  goToPrevPageRange() {
    const newPage = Math.max(0, this.pageRange[0] - this.pagesPerRange);
    this.currentPage = newPage;
    this.updatePagination();
  }

  goToNextPageRange() {
    const newPage = Math.min(
      this.totalPages - 1,
      this.pageRange[this.pageRange.length - 1] + 1,
    );
    this.currentPage = newPage;
    this.updatePagination();
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.updatePagination();
  }
}
