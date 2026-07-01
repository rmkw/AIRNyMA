import { Tabulado } from '@/tabulados/interfaces/tabulado.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TabuladosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/armo/tabulados`;

  buscarPorPrefijo(prefijo: string): Observable<Tabulado[]> {
    const params = new HttpParams().set('prefijo', prefijo);

    return this.http.get<Tabulado[]>(`${this.baseUrl}/buscar`, {
      params,
      withCredentials: true,
    });
  }

  obtenerPorId(idTabulado: string): Observable<Tabulado> {
    return this.http.get<Tabulado>(
      `${this.baseUrl}/${encodeURIComponent(idTabulado)}`,
      { withCredentials: true },
    );
  }

  guardar(tabulado: Tabulado): Observable<Tabulado> {
    return this.http.post<Tabulado>(this.baseUrl, tabulado, {
      withCredentials: true,
    });
  }

  actualizar(idTabulado: string, tabulado: Tabulado): Observable<Tabulado> {
    return this.http.put<Tabulado>(
      `${this.baseUrl}/${encodeURIComponent(idTabulado)}`,
      tabulado,
      { withCredentials: true },
    );
  }

  eliminar(idTabulado: string): Observable<string> {
    return this.http.delete(
      `${this.baseUrl}/${encodeURIComponent(idTabulado)}`,
      {
        responseType: 'text',
        withCredentials: true,
      },
    );
  }
}
