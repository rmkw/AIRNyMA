import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

const baseUrl = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class MdeaService {
  constructor() {}
  private http = inject(HttpClient);

  getComponentes(): Observable<any[]> {
    return this.http
      .get<any[]>(`${baseUrl}/mdea/componentes`)
      .pipe(catchError(() => of([])));
  }

  getSubcomponentes(idComponente: number | string): Observable<any[]> {
    return this.http.get<any[]>(
      `${baseUrl}/mdea/subcomponente/comp/${idComponente}`
    );
  }

  getTopicos(
    idComponente: number | string,
    idSubcomponente: number | string
  ): Observable<any[]> {
    console.log(idSubcomponente);
    return this.http.get<any[]>(
      `${baseUrl}/mdea/topicos/comp/${idComponente}/sub/${idSubcomponente}`
    );
  }

  getVariables(
    idComponente: number | string,
    idSubcomponente: number | string,
    idTema: number | string
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${baseUrl}/mdea/estadistico1/id_componente/${idComponente}/id_subcomponente/${idSubcomponente}/id_tema/${idTema}`
    );
  }

  getEstadisticos(
    idComponente: number | string,
    idSubcomponente: number | string,
    idTema: number | string,
    idEstadistico1: string | number
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${baseUrl}/mdea/estadistico2/componente/${idComponente}/subcomponente/${idSubcomponente}/tema/${idTema}/estadistico1/${idEstadistico1}`
    );
  }


}
