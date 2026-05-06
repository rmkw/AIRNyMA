import { CapturaMdeaVarService } from '@/variables/services/captura-mdea-vars.service';
import { MdeaService } from '@/variables/services/mdea-pull.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
 // ajusta la ruta si tu service está en otra carpeta

@Component({
  selector: 'app-captura-mdea-variable',
  imports: [CommonModule, FormsModule],
  templateUrl: './captura-mdea-variable.component.html',
  styleUrl: './captura-mdea-variable.component.css',
})
export class CapturaMdeaVariableComponent implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idA'] && this.idA) {
      this.cargarRelacionesMdea();
    }
  }
  @Input() idA: string = '';
  @Input() idS: string = '';

  private _mdeaService = inject(MdeaService);

  idComponente = '';
  idSubcomponente = '-';
  idTema = '-';
  idEstadistico1 = '-';
  idEstadistico2 = '-';

  componentes: any[] = [];
  subcomponentes: any[] = [];
  temas: any[] = [];
  estadisticas1: any[] = [];
  estadisticas2: any[] = [];

  contribucion = '';
  comentarioS = '';

  ngOnInit(): void {
    this.cargarComponentes();
  }
  cargarRelacionesMdea() {
    if (!this.idA) return;

    this.loadingRelacionesMdea = true;

    this._capturaMdeaService.getRelacionesPorVariable(this.idA).subscribe({
      next: (data) => {
        this.relacionesMdea = data ?? [];
        this.loadingRelacionesMdea = false;
      },
      error: (err: any) => {
        console.error('Error al cargar relaciones MDEA:', err);
        this.relacionesMdea = [];
        this.loadingRelacionesMdea = false;
      },
    });
  }

  cargarComponentes() {
    this._mdeaService.getComponentes().subscribe({
      next: (data) => {
        this.componentes = data ?? [];
      },
      error: (err: any) => {
        console.error('Error al cargar componentes MDEA:', err);
        this.componentes = [];
      },
    });
  }

  onComponenteChange() {
    this.idSubcomponente = '-';
    this.idTema = '-';
    this.idEstadistico1 = '-';
    this.idEstadistico2 = '-';

    this.subcomponentes = [];
    this.temas = [];
    this.estadisticas1 = [];
    this.estadisticas2 = [];

    this.cargarSubcomponentes();
  }

  cargarSubcomponentes() {
    if (!this.idComponente) return;

    this._mdeaService.getSubcomponentes(this.idComponente).subscribe({
      next: (data) => {
        this.subcomponentes = data ?? [];
      },
      error: (err: any) => {
        console.error('Error al cargar subcomponentes MDEA:', err);
        this.subcomponentes = [];
      },
    });
  }

  onSubcomponenteChange() {
    this.idTema = '-';
    this.idEstadistico1 = '-';
    this.idEstadistico2 = '-';

    this.temas = [];
    this.estadisticas1 = [];
    this.estadisticas2 = [];

    if (this.idSubcomponente === '-') return;

    this.cargarTemas();
  }

  cargarTemas() {
    if (!this.idComponente || this.idSubcomponente === '-') return;

    this._mdeaService
      .getTopicos(this.idComponente, this.idSubcomponente)
      .subscribe({
        next: (data) => {
          this.temas = data ?? [];
        },
        error: (err: any) => {
          console.error('Error al cargar temas MDEA:', err);
          this.temas = [];
        },
      });
  }

  onTemaChange() {
    this.idEstadistico1 = '-';
    this.idEstadistico2 = '-';

    this.estadisticas1 = [];
    this.estadisticas2 = [];

    if (this.idTema === '-') return;

    this.cargarEstadistica1();
  }

  cargarEstadistica1() {
    if (
      !this.idComponente ||
      this.idSubcomponente === '-' ||
      this.idTema === '-'
    ) {
      return;
    }

    this._mdeaService
      .getVariables(this.idComponente, this.idSubcomponente, this.idTema)
      .subscribe({
        next: (data) => {
          this.estadisticas1 = data ?? [];
          console.log('Estadísticas 1 cargadas:', this.estadisticas1);
        },
        error: (err: any) => {
          console.error('Error al cargar estadística 1 MDEA:', err);
          this.estadisticas1 = [];
        },
      });
  }

  onEstadistica1Change() {
    this.idEstadistico2 = '-';
    this.estadisticas2 = [];

    if (this.idEstadistico1 === '-') return;

    this.cargarEstadistica2();
  }

  cargarEstadistica2() {
    if (
      !this.idComponente ||
      this.idSubcomponente === '-' ||
      this.idTema === '-' ||
      this.idEstadistico1 === '-'
    ) {
      return;
    }

    this._mdeaService
      .getEstadisticos(
        this.idComponente,
        this.idSubcomponente,
        this.idTema,
        this.idEstadistico1,
      )
      .subscribe({
        next: (data) => {
          this.estadisticas2 = data ?? [];
          console.log('Estadísticas 2 cargadas:', this.estadisticas2);
        },
        error: (err: any) => {
          console.error('Error al cargar estadística 2 MDEA:', err);
          this.estadisticas2 = [];
        },
      });
  }

  validarJerarquia(): boolean {
    if (!this.idComponente) return false;
    if (this.idSubcomponente === '-' && this.idTema !== '-') return false;
    if (this.idTema === '-' && this.idEstadistico1 !== '-') return false;
    if (this.idEstadistico1 === '-' && this.idEstadistico2 !== '-')
      return false;

    return true;
  }
  relacionesMdea: any[] = [];
  loadingRelacionesMdea = false;
  private _capturaMdeaService = inject(CapturaMdeaVarService);
  guardarMdea() {
    this.camposFaltantes = this.obtenerCamposFaltantes();

    if (this.camposFaltantes.length > 0) {
      this.abrirModalSinDatosMdea();
      return;
    }

    if (!this.idA || !this.idS) {
      console.error('Falta contexto de variable para MDEA');
      return;
    }

    if (!this.validarJerarquia()) {
      console.error('La jerarquía MDEA no es válida');
      return;
    }

    if (!this.idComponente) {
      console.error('Debes seleccionar un componente');
      return;
    }

    const payload = {
      idA: this.idA,
      idS: this.idS,
      componente: this.idComponente,
      subcomponente: this.idSubcomponente,
      tema: this.idTema,
      estadistica1: this.idEstadistico1,
      estadistica2: this.idEstadistico2,
      contribucion: this.contribucion || '-',
      comentarioS: this.comentarioS?.trim() || '-',
    };

    this._capturaMdeaService.registrarRelacion(payload).subscribe({
      next: () => {
        this.limpiarFormularioMdea();
        this.cargarRelacionesMdea();
      },
      error: (err: any) => {
        console.error('Error al guardar relación MDEA:', err);
      },
    });
  }
  eliminarRelacion(idUnique: number) {
    if (!idUnique) return;

    this._capturaMdeaService.eliminarRelacion(idUnique).subscribe({
      next: () => {
        this.cargarRelacionesMdea();
      },
      error: (err: any) => {
        console.error('Error al eliminar relación MDEA:', err);
      },
    });
  }
  limpiarFormularioMdea() {
    this.idComponente = '';
    this.idSubcomponente = '-';
    this.idTema = '-';
    this.idEstadistico1 = '-';
    this.idEstadistico2 = '-';

    this.subcomponentes = [];
    this.temas = [];
    this.estadisticas1 = [];
    this.estadisticas2 = [];

    this.contribucion = '';
    this.comentarioS = '';
  }
  @ViewChild('modalSinDatosMdea')
  modalSinDatosMdea!: ElementRef<HTMLDialogElement>;

  camposFaltantes: string[] = [];

  obtenerCamposFaltantes(): string[] {
    const faltantes: string[] = [];

    if (!this.idComponente?.trim()) faltantes.push('Componente');
    if (!this.contribucion?.trim()) faltantes.push('Contribución');
    if (!this.comentarioS?.trim()) faltantes.push('Comentario');

    return faltantes;
  }

  abrirModalSinDatosMdea() {
    this.modalSinDatosMdea?.nativeElement.showModal();
  }

  cerrarModalSinDatosMdea() {
    this.modalSinDatosMdea?.nativeElement.close();
  }
}
