import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ClasificacionArmo } from '@/variables/interfaces/armonizacion/clasificaciones-armo.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClasificacionesArmoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/armo/clasificaciones`;

  obtenerPorIdA(idA: string): Observable<ClasificacionArmo[]> {
    return this.http.get<ClasificacionArmo[]>(`${this.baseUrl}/variable/${idA}`, {
      withCredentials: true,
    });
  }

  guardarClasificacion(
    clasificacion: ClasificacionArmo,
  ): Observable<ClasificacionArmo> {
    return this.http.post<ClasificacionArmo>(this.baseUrl, clasificacion, {
      withCredentials: true,
    });
  }

  eliminarClasificacion(idUnique: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${idUnique}`, {
      responseType: 'text',
      withCredentials: true,
    });
  }
}
