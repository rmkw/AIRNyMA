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

  getVars(responsableRegister: number, idFuente: number): Observable<any> {
    return this.http.get<any>(
      `${baseUrl}/variables/filtered/${responsableRegister}/${idFuente}`,
      {
        withCredentials: true,
      }
    );
  }

  crearVar(variable: VariableDTO): Observable<VariableDTO> {
    return this.http.post<VariableDTO>(`${baseUrl}/variables`, variable);
  }

  deleteVariable(idA: string) {
    return this.http.delete(`${baseUrl}/variables/delete/${idA}`, {
      withCredentials: true,
    });
  }

  getByVariable(idVariable: string): Observable<any> {
    return this.http.get<any>(
      `${baseUrl}/variables/por-id/${idVariable}`
    );
  }
}
