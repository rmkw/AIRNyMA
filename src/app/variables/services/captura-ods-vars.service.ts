import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RelacionODS } from '../interfaces/relationVarWhit_ODS.interface';
import { Observable, retry } from 'rxjs';

const baseUrl = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class relacionODS_Service {
  constructor() {}
  private http = inject(HttpClient);

  registrarRelacion_ods(relacion: RelacionODS): Observable<any> {
    return this.http.post<any>(`${baseUrl}/relacion-ods`, relacion);
  }
  getRelacionesPorVariable_ods(
    idVariableUnique: number
  ): Observable<RelacionODS[]> {
    return this.http.get<RelacionODS[]>(
      `${baseUrl}/relacion-ods/${idVariableUnique}`,
      { withCredentials: true }
    );
  }
  eliminarRelacion_ods(id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/relacion-ods/${id}`, {
      withCredentials: true,
    });
  }
}
