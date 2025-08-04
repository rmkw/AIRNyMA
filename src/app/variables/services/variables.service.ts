import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { VariableDTO } from '../interfaces/variablesCapDTO.interface';

const baseUrl = environment.baseUrl
@Injectable({ providedIn: 'root' })
export class VariableService {
  constructor() {}
  private http = inject(HttpClient);

  getVars(
    responsableRegister: number,
    idFuente: string,
    page = 0,
    size = 10
  ): Observable<any> {
    return this.http.get<any>(
      `${baseUrl}/variables/filtered?responsableRegister=${responsableRegister}&idFuente=${encodeURIComponent(
        idFuente
      )}&page=${page}&size=${size}`,
      { withCredentials: true }
    );
  }

  crearVar(variable: VariableDTO): Observable<VariableDTO> {
    return this.http.post<VariableDTO>(`${baseUrl}/variables`, variable);
  }

  deleteVariable(idA: string) {
    return this.http.delete(`${baseUrl}/variables/delete-full/${idA}`, {
      withCredentials: true,
    });
  }

  getByVariable(idVariable: string): Observable<any> {
    return this.http.get<any>(`${baseUrl}/variables/por-id/${idVariable}`);
  }

  getVariableByIdA(idA: string): Observable<VariableDTO> {
    return this.http.get<VariableDTO>(`${baseUrl}/variables/por-ida/${idA}`, {
      withCredentials: true,
    });
  }
  updateVariable(idA: string, payload: VariableDTO) {
    return this.http.put<{ message: string }>(
      `${baseUrl}/variables/edit/${idA}`,
      payload,
      {
        withCredentials: true,
      }
    );
  }
}
