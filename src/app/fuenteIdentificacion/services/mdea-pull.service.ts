import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

const baseUrl = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class MdeaService {
  constructor() {}
  private http = inject(HttpClient);

  getComponentes(): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/mdea/componentes`).pipe(
      map((componentes) =>
        componentes.filter((comp) => !comp.nombre.includes('-'))
      ), // Filtra elementos con guion
      catchError(() => of([])) // Maneja errores devolviendo un arreglo vacío
    );
  }

  getSubcomponentes(idComp: number): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/mdea/subcomponente/comp/${idComp}`);
  }

  getTopicos(idComp: number, idSub: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${baseUrl}/mdea/topicos/comp/${idComp}/sub/${idSub}`
    );
  }

  getVariables(
    idComp: number,
    idSub: number | string,
    idTop: number
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${baseUrl}/mdea/variables/comp/${idComp}/sub/${idSub}/top/${idTop}`
    );
  }

  getEstadisticos(
    idComp: number,
    idSub: number | string,
    idTop: number | string,
    idVar: string | number
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${baseUrl}/mdea/estadisticos/comp/${idComp}/sub/${idSub}/top/${idTop}/var/${idVar}`
    );
  }
}
