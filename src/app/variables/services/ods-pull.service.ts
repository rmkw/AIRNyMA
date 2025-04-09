import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';

const baseUrl = environment.baseUrl

@Injectable({providedIn: 'root'})
export class ServiceNameService {
  constructor() { }
  private http = inject(HttpClient);

  getObjetivos(): Observable<any[]> {
    return this.http
      .get<any[]>(`${baseUrl}/ods/objetivos`)
      .pipe(catchError(() => of([])));
  }
  getMetas(idObj: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/ods/metas/${idObj}`);
  }
  getIndicadores(idObj: number | string, idMeta: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${baseUrl}/ods/indicadores/${idObj}/${idMeta}`);
  }

}
