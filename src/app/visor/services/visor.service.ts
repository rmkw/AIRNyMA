import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FiltrosVisor, OpcionesVisor, PaginaVisor } from '../interfaces/visor.interface';

@Injectable({ providedIn: 'root' })
export class VisorService {
  private http = inject(HttpClient);
  private url = `${environment.baseUrl}/armo/variables/visor`;

  private parametros(filtros: FiltrosVisor) {
    let params = new HttpParams();
    for (const [campo, valor] of Object.entries(filtros)) {
      if (valor !== '') params = params.set(campo, valor);
    }
    return params;
  }

  listar(filtros: FiltrosVisor, page: number, size: number) {
    return this.http.get<PaginaVisor>(this.url, {
      params: this.parametros(filtros).set('page', page).set('size', size),
      withCredentials: true,
    });
  }

  opciones(filtros: FiltrosVisor) {
    return this.http.get<OpcionesVisor>(`${this.url}/filtros`, {
      params: this.parametros(filtros), withCredentials: true,
    });
  }
}
