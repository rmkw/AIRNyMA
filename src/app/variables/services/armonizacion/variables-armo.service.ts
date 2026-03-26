import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VariablesArmo } from '@/variables/interfaces/armonizacion/variables-armo.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VariablesArmoService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/armo/variables`;

  existePorIdA(idA: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/existe/${idA}`, {
      withCredentials: true
    });
  }

  obtenerPorIdA(idA: string): Observable<VariablesArmo> {
    return this.http.get<VariablesArmo>(`${this.baseUrl}/${idA}`, {
      withCredentials: true
    });
  }

  guardarVariable(variable: VariablesArmo): Observable<VariablesArmo> {
    return this.http.post<VariablesArmo>(this.baseUrl, variable, {
      withCredentials: true
    });
  }

  actualizarVariable(idA: string, variable: VariablesArmo): Observable<VariablesArmo> {
    return this.http.put<VariablesArmo>(`${this.baseUrl}/${idA}`, variable, {
      withCredentials: true
    });
  }

  eliminarVariable(idA: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${idA}`, {
      responseType: 'text',
      withCredentials: true
    });
  }
}