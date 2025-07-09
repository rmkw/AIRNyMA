import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RelationVarWhitMDEA } from '../interfaces/relationVarWhitMdea.interface';
import { Observable } from 'rxjs';

const baseUrl = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class CapturaMdeaVarService {
  constructor() {}

  private http = inject(HttpClient);

  registrarRelacion(relacion: RelationVarWhitMDEA): Observable<any> {
    return this.http.post<any>(`${baseUrl}/mdea`, relacion);
  }
  // GET relaciones por idVariableUnique
  getRelacionesPorVariable(
    idVariableUnique: string
  ): Observable<RelationVarWhitMDEA[]> {
    return this.http.get<RelationVarWhitMDEA[]>(
      `${baseUrl}/mdea/${idVariableUnique}`
    );
  }
  eliminarRelacion(id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/mdea/${id}`);
  }
}
