import { DatoAbiertoArmo } from '@/variables/interfaces/armonizacion/datos-abiertos-armo.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DatosAbiertosArmoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/armo/datos-abiertos`;

  obtenerPorIdA(idA: string): Observable<DatoAbiertoArmo[]> {
    return this.http.get<DatoAbiertoArmo[]>(`${this.baseUrl}/variable/${idA}`, {
      withCredentials: true,
    });
  }

  guardarDatoAbierto(datoAbierto: DatoAbiertoArmo): Observable<DatoAbiertoArmo> {
    return this.http.post<DatoAbiertoArmo>(this.baseUrl, datoAbierto, {
      withCredentials: true,
    });
  }

  eliminarDatoAbierto(idUnique: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${idUnique}`, {
      responseType: 'text',
      withCredentials: true,
    });
  }
}
