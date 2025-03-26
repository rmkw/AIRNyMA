import { FiEcoResponce } from '@/fuenteIdentificacion/interfaces/fiEco-responce.interface';
import { FuenteIdentificacionService } from '@/fuenteIdentificacion/services/fuente-identificacion.service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-fuentes-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './fuentes-list.component.html',
})
export class FuentesListComponent implements OnInit {
  private _fuentesService = inject(FuenteIdentificacionService);
  private _router = inject(Router);

  fuentes: any[] = [];
  loading = true;

  ngOnInit(): void {
    this._fuentesService.obtenerFuentes().subscribe((data) => {
      if (data.length === 0) {
        console.warn('No hay registros en fuentes:', data);
      }
      this.fuentes = data;
      this.loading = false;
    });
  }

  editarFuente(_fuente: FiEcoResponce) {
    localStorage.removeItem('fuenteEditable');
    const fuenteEditable = {
      idFuente: _fuente.idFuente,
      idPp: _fuente.idPp,
      fuente: _fuente.fuente,
      linkFuente: _fuente.linkFuente,
      anioEvento: _fuente.anioEvento,
      comentario: _fuente.comentario,
      responsableActualizacion: _fuente.responsableActualizacion,
    };
    localStorage.setItem('fuenteEditable', JSON.stringify(fuenteEditable));

    this._router.navigate(['/fuente', _fuente.idFuente]);
  }
}
