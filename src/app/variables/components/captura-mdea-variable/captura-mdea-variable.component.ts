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
  comentarioS = '-';

  ngOnInit(): void {
    this.cargarComponentes();
  }

  cargarRelacionesMdea() {
    if (!this.idA) return;

    this.loadingRelacionesMdea = true;

    this._capturaMdeaService.getRelacionesTablaPorVariable(this.idA).subscribe({
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

    const subcomponenteSeleccionado = this.subcomponentes.find(
      (sub) => String(sub.idSubcomponente) === String(this.idSubcomponente),
    );

    const temaSeleccionado = this.temas.find(
      (tema) => String(tema.idTema) === String(this.idTema),
    );

    const estadistico1Seleccionado = this.estadisticas1.find(
      (est) => String(est.idEstadistico1) === String(this.idEstadistico1),
    );

    const estadistico2Seleccionado = this.estadisticas2.find(
      (est) => String(est.idEstadistico2) === String(this.idEstadistico2),
    );

    const payload = {
      idA: this.idA,
      idS: this.idS,
      componente: this.idComponente,
      subcomponente:
        subcomponenteSeleccionado?.uniqueId ??
        subcomponenteSeleccionado?.idUnique ??
        this.idSubcomponente,
      tema:
        temaSeleccionado?.uniqueId ?? temaSeleccionado?.idUnique ?? this.idTema,
      estadistica1:
        estadistico1Seleccionado?.uniqueId ??
        estadistico1Seleccionado?.idUnique ??
        this.idEstadistico1,
      estadistica2:
        estadistico2Seleccionado?.uniqueId ??
        estadistico2Seleccionado?.idUnique ??
        this.idEstadistico2,
      contribucion: this.contribucion || '-',
      comentarioS: this.comentarioS?.trim() || '-',
    };

    console.log('Payload MDEA:', payload);

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
    this.comentarioS = '-';
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

  obtenerTextoComponente(idComponente: any): string {
    if (!idComponente || idComponente === '-') return '-';

    const componente = this.componentes.find(
      (comp) => String(comp.idComponente) === String(idComponente),
    );

    return componente
      ? `${componente.idComponente} - ${componente.nombre}`
      : idComponente;
  }
  catalogoSubcomponentesTabla: any[] = [];
  catalogoTemasTabla: any[] = [];
  catalogoEstadisticas1Tabla: any[] = [];
  catalogoEstadisticas2Tabla: any[] = [];
  cargarCatalogosTablaMdea() {
    this.catalogoSubcomponentesTabla = [];
    this.catalogoTemasTabla = [];
    this.catalogoEstadisticas1Tabla = [];
    this.catalogoEstadisticas2Tabla = [];

    this.relacionesMdea.forEach((rel) => {
      if (!rel.componente || rel.componente === '-') return;

      this._mdeaService.getSubcomponentes(rel.componente).subscribe({
        next: (subcomponentes) => {
          this.catalogoSubcomponentesTabla = [
            ...this.catalogoSubcomponentesTabla,
            ...(subcomponentes ?? []),
          ];

          const subcomponente = subcomponentes?.find(
            (sub: any) =>
              String(sub.idSubcomponente) === String(rel.subcomponente) ||
              String(sub.uniqueId) === String(rel.subcomponente) ||
              String(sub.idUnique) === String(rel.subcomponente),
          );

          const idSubcomponenteParaApi =
            subcomponente?.uniqueId ??
            subcomponente?.idUnique ??
            rel.subcomponente;

          if (!idSubcomponenteParaApi || rel.subcomponente === '-') return;

          this._mdeaService
            .getTopicos(rel.componente, idSubcomponenteParaApi)
            .subscribe({
              next: (temas) => {
                this.catalogoTemasTabla = [
                  ...this.catalogoTemasTabla,
                  ...(temas ?? []),
                ];

                const tema = temas?.find(
                  (item: any) =>
                    String(item.idTema) === String(rel.tema) ||
                    String(item.uniqueId) === String(rel.tema) ||
                    String(item.idUnique) === String(rel.tema),
                );

                const idTemaParaApi =
                  tema?.uniqueId ?? tema?.idUnique ?? rel.tema;

                if (!idTemaParaApi || rel.tema === '-') return;

                this._mdeaService
                  .getVariables(
                    rel.componente,
                    idSubcomponenteParaApi,
                    idTemaParaApi,
                  )
                  .subscribe({
                    next: (estadisticas1) => {
                      this.catalogoEstadisticas1Tabla = [
                        ...this.catalogoEstadisticas1Tabla,
                        ...(estadisticas1 ?? []),
                      ];

                      const estadistica1 = estadisticas1?.find(
                        (item: any) =>
                          String(item.idEstadistico1) ===
                            String(rel.estadistica1) ||
                          String(item.uniqueId) === String(rel.estadistica1) ||
                          String(item.idUnique) === String(rel.estadistica1),
                      );

                      const idEstadistica1ParaApi =
                        estadistica1?.uniqueId ??
                        estadistica1?.idUnique ??
                        rel.estadistica1;

                      if (!idEstadistica1ParaApi || rel.estadistica1 === '-')
                        return;

                      this._mdeaService
                        .getEstadisticos(
                          rel.componente,
                          idSubcomponenteParaApi,
                          idTemaParaApi,
                          idEstadistica1ParaApi,
                        )
                        .subscribe({
                          next: (estadisticas2) => {
                            this.catalogoEstadisticas2Tabla = [
                              ...this.catalogoEstadisticas2Tabla,
                              ...(estadisticas2 ?? []),
                            ];
                          },
                        });
                    },
                  });
              },
            });
        },
      });
    });
  }
  obtenerTextoSubcomponente(idSubcomponente: any): string {
    if (!idSubcomponente || idSubcomponente === '-') return '-';

    const sub = this.catalogoSubcomponentesTabla.find(
      (item) =>
        String(item.idSubcomponente) === String(idSubcomponente) ||
        String(item.uniqueId) === String(idSubcomponente) ||
        String(item.idUnique) === String(idSubcomponente),
    );

    return sub ? `${sub.idSubcomponente} - ${sub.nombre}` : idSubcomponente;
  }

  obtenerTextoTema(idTema: any): string {
    if (!idTema || idTema === '-') return '-';

    const tema = this.catalogoTemasTabla.find(
      (item) =>
        String(item.idTema) === String(idTema) ||
        String(item.uniqueId) === String(idTema) ||
        String(item.idUnique) === String(idTema),
    );

    return tema ? `${tema.idTema} - ${tema.nombre}` : idTema;
  }

  obtenerTextoEstadistica1(idEstadistico1: any): string {
    if (!idEstadistico1 || idEstadistico1 === '-') return '-';

    const est = this.catalogoEstadisticas1Tabla.find(
      (item) =>
        String(item.idEstadistico1) === String(idEstadistico1) ||
        String(item.uniqueId) === String(idEstadistico1) ||
        String(item.idUnique) === String(idEstadistico1),
    );

    return est ? `${est.idEstadistico1} - ${est.nombre}` : idEstadistico1;
  }

  obtenerTextoEstadistica2(idEstadistico2: any): string {
    if (!idEstadistico2 || idEstadistico2 === '-') return '-';

    const est = this.catalogoEstadisticas2Tabla.find(
      (item) =>
        String(item.idEstadistico2) === String(idEstadistico2) ||
        String(item.uniqueId) === String(idEstadistico2) ||
        String(item.idUnique) === String(idEstadistico2),
    );

    return est ? `${est.idEstadistico2} - ${est.nombre}` : idEstadistico2;
  }
}
