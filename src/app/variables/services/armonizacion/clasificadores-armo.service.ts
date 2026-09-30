import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ClasificadorArmo } from '@/variables/interfaces/armonizacion/clasificadores-armo.interface';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ClasificadoresArmoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/armo/clasificadores`;

  obtenerPorIdA(idA: string) {
    return this.http.get<ClasificadorArmo[]>(`${this.baseUrl}/variable/${encodeURIComponent(idA)}`, {
      withCredentials: true,
    });
  }

  guardarClasificador(payload: ClasificadorArmo) {
    return this.http.post<ClasificadorArmo>(this.baseUrl, payload, { withCredentials: true });
  }

  actualizarClasificador(idUnique: number, payload: ClasificadorArmo) {
    return this.http.put<ClasificadorArmo>(`${this.baseUrl}/${idUnique}`, payload, {
      withCredentials: true,
    });
  }

  eliminarClasificador(idUnique: number) {
    return this.http.delete(`${this.baseUrl}/${idUnique}`, {
      responseType: 'text',
      withCredentials: true,
    });
  }
}
