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

  getSubcomponentes(idComp: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/mdea/subcomponente/comp/${idComp}`);
  }

  getTopicos(idComp: number | string, idSub: number | string): Observable<any[]> {
    return this.http.get<any[]>(
      `${baseUrl}/mdea/topicos/comp/${idComp}/sub/${idSub}`
    );
  }

  getVariables(
    idComp: number | string,
    idSub: number | string,
    idTop: number | string
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${baseUrl}/mdea/variables/comp/${idComp}/sub/${idSub}/top/${idTop}`
    );
  }

  getEstadisticos(
    idComp: number | string,
    idSub: number | string,
    idTop: number | string,
    idVar: string | number
  ): Observable<any[]> {
    return this.http.get<any[]>(
      `${baseUrl}/mdea/estadisticos/comp/${idComp}/sub/${idSub}/top/${idTop}/var/${idVar}`
    );
  }
}
