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
    return this.http.post<any>(`${baseUrl}/ods`, relacion);
  }
  getRelacionesPorVariable_ods(
    idVariableUnique: string
  ): Observable<RelacionODS[]> {
    return this.http.get<RelacionODS[]>(
      `${baseUrl}/ods/${idVariableUnique}`,
      { withCredentials: true }
    );
  }
  eliminarRelacion_ods(id: string): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/ods/${id}`, {
      withCredentials: true,
    });
  }
}
