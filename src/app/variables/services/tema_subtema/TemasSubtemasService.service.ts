import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TemaSubtemaDTO } from '@/variables/interfaces/armonizacion/tema_subtema/temasubtema.interface';


@Injectable({
  providedIn: 'root'
})
export class TemasSubtemasService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/catalog/temas-subtemas`;

  obtenerTemas(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/temas`, {
      withCredentials: true
    });
  }

  obtenerSubtemasPorTema(tema: string): Observable<TemaSubtemaDTO[]> {
    return this.http.get<TemaSubtemaDTO[]>(`${this.baseUrl}/subtemas/${encodeURIComponent(tema)}`, {
      withCredentials: true
    });
  }
}