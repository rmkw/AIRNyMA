import { Desagregacion } from '@/tabulados/interfaces/desagregacion.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DesagregacionesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/armo/desagregaciones`;

  obtenerPorTabulado(idTabulado: string): Observable<Desagregacion[]> {
    return this.http.get<Desagregacion[]>(
      `${this.baseUrl}/tabulado/${encodeURIComponent(idTabulado)}`,
      { withCredentials: true },
    );
  }

  obtenerPorId(idUnique: number): Observable<Desagregacion> {
    return this.http.get<Desagregacion>(`${this.baseUrl}/${idUnique}`, {
      withCredentials: true,
    });
  }

  guardar(desagregacion: Desagregacion): Observable<Desagregacion> {
    return this.http.post<Desagregacion>(this.baseUrl, desagregacion, {
      withCredentials: true,
    });
  }

  actualizar(
    idUnique: number,
    desagregacion: Desagregacion,
  ): Observable<Desagregacion> {
    return this.http.put<Desagregacion>(
      `${this.baseUrl}/${idUnique}`,
      desagregacion,
      { withCredentials: true },
    );
  }

  eliminar(idUnique: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${idUnique}`, {
      responseType: 'text',
      withCredentials: true,
    });
  }
}
