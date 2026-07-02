import {
  VariableResumen,
  VariableTabulado,
} from '@/tabulados/interfaces/variable-tabulado.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class VariablesTabuladosService {
  private http = inject(HttpClient);
  private variablesUrl = `${environment.baseUrl}/armo/variables`;
  private relacionesUrl = `${environment.baseUrl}/armo/variables-tabulados`;

  buscarVariables(termino: string): Observable<VariableResumen[]> {
    const params = new HttpParams().set('termino', termino);
    return this.http.get<VariableResumen[]>(`${this.variablesUrl}/buscar`, {
      params,
      withCredentials: true,
    });
  }

  obtenerPorTabulado(idTabulado: string): Observable<VariableTabulado[]> {
    return this.http.get<VariableTabulado[]>(
      `${this.relacionesUrl}/tabulado/${encodeURIComponent(idTabulado)}`,
      { withCredentials: true },
    );
  }

  guardar(relacion: VariableTabulado): Observable<VariableTabulado> {
    return this.http.post<VariableTabulado>(this.relacionesUrl, relacion, {
      withCredentials: true,
    });
  }

  eliminar(idUnique: number): Observable<string> {
    return this.http.delete(`${this.relacionesUrl}/${idUnique}`, {
      responseType: 'text',
      withCredentials: true,
    });
  }
}
