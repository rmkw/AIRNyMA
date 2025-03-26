import { FiEcoResponce } from '@/fuenteIdentificacion/interfaces/fiEco-responce.interface';
import { FuenteIdentificacionService } from '@/fuenteIdentificacion/services/fuente-identificacion.service';
import { PpEconomicas } from '@/procesoProduccion/interfaces/ppEco-responce.interface';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


import { catchError, of, tap } from 'rxjs';




@Component({
  selector: 'app-fuente-identificacion',
  imports: [FormsModule, CommonModule],
  templateUrl: './fuente-identificacion.component.html',
})
export class FuenteIdentificacionComponent implements OnInit {
  _router = inject(Router);
  _ppEcoService = inject(ppEcoService);
  _fuenteService = inject(FuenteIdentificacionService);

  fuenteState: FiEcoResponce | null = null;

  // Variables para ngModel
  idFuente: number = NaN;
  idPp: string = '';
  responsableActualizacion: string = '';
  fuente: string = '';
  linkFuente: string = '';
  anioEvento: string = '';
  comentario: string = '';

  procesoSeleccionadoId: number | null = null;

  constructor() {}

  ngOnInit(): void {
    this._ppEcoService
      .getPpEcos()
      .pipe(
        tap((data) => {
          this.ppEco.set(Array.isArray(data) ? data : []);
          this.obtenerFuente();
        }),
        catchError((error) => {
          console.error('Error al cargar datos:', error);
          return of([]); // Retorna un arreglo vacío en caso de error
        })
      )
      .subscribe();
  }

  ppEco = signal<PpEconomicas[]>([]);
  procesoSeleccionado = signal<PpEconomicas | null>(null);

  // ppEcoResource = rxResource({
  //   request: () => ({}),
  //   loader: ({ request }) => {
  //     return this._ppEcoService.getPpEcos().pipe(
  //       tap((data) => {
  //         this.ppEco.set(Array.isArray(data) ? data : []);
  //         console.log(this.ppEco(),'ppEco');
  //       })
  //     );
  //   },
  // });

  seleccionarProceso(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const procesoId = Number(selectElement.value);

    const procesoEncontrado =
      this.ppEco().find((proceso) => proceso.id === procesoId) || null;

    if (procesoEncontrado) {
      this.procesoSeleccionado.set(procesoEncontrado);
      this.idPp = procesoEncontrado.acronimoProceso;
    }
  }

  obtenerFuente() {
    const fuenteData = localStorage.getItem('fuenteEditable');
    if (fuenteData) {
      const fuente = JSON.parse(fuenteData);
      this.fuenteState = fuente;

      this.idFuente = fuente.idFuente;
      this.idPp = fuente.idPp;
      this.responsableActualizacion = fuente.responsableActualizacion;
      this.fuente = fuente.fuente;
      this.linkFuente = fuente.linkFuente;
      this.anioEvento = fuente.anioEvento;
      this.comentario = fuente.comentario;

      console.log(this.idPp, 'idPp');

      const procesoEncontrado =
        this.ppEco().find((proceso) => proceso.acronimoProceso === this.idPp) ||
        null;

      console.log(procesoEncontrado, 'mirame');

      if (procesoEncontrado) {
        console.log(procesoEncontrado.procesoProduccion, 'procesoEncontrado');
        this.procesoSeleccionado.set(procesoEncontrado);

        this.procesoSeleccionadoId = procesoEncontrado.id;
        console.log(this.procesoSeleccionado(), 'procesoSeleccionado');
      }
    }
    console.log('fuenteeditable', this.fuenteState);
  }

  getAcronimo(): string {
    return (
      this.procesoSeleccionado()?.acronimoProceso || this.idPp || 'Acrónimo'
    );
  }

  actualizarFuente() {}
}
