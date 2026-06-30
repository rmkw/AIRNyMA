import { MicrodatoArmo } from '@/variables/interfaces/armonizacion/microdatos-armo.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MicrodatosArmoService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/armo/microdatos`;

  obtenerPorIdA(idA: string): Observable<MicrodatoArmo[]> {
    return this.http.get<MicrodatoArmo[]>(`${this.baseUrl}/variable/${idA}`, {
      withCredentials: true,
    });
  }

  guardarMicrodato(microdato: MicrodatoArmo): Observable<MicrodatoArmo> {
    return this.http.post<MicrodatoArmo>(this.baseUrl, microdato, {
      withCredentials: true,
    });
  }

  eliminarMicrodato(idUnique: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${idUnique}`, {
      responseType: 'text',
      withCredentials: true,
    });
  }
}
