import { Desglose } from '@/tabulados/interfaces/desglose.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DesglosesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/armo/desgloses`;

  obtenerPorTabulado(idTabulado: string): Observable<Desglose[]> {
    return this.http.get<Desglose[]>(
      `${this.baseUrl}/tabulado/${encodeURIComponent(idTabulado)}`,
      { withCredentials: true },
    );
  }

  guardar(desglose: Desglose): Observable<Desglose> {
    return this.http.post<Desglose>(this.baseUrl, desglose, {
      withCredentials: true,
    });
  }

  eliminar(idUnique: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${idUnique}`, {
      responseType: 'text',
      withCredentials: true,
    });
  }
}
