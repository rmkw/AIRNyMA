import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TematicaDTO } from '@/variables/interfaces/tematicas_temas/tematicaDTO.interface';


@Injectable({
  providedIn: 'root'
})
export class TematicasService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/catalog/tematicas`;

  obtenerPorAcronimo(acronimo: string): Observable<TematicaDTO[]> {
    return this.http.get<TematicaDTO[]>(`${this.baseUrl}/proceso/${acronimo}`, {
      withCredentials: true
    });
  }
}