import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const baseUrl = environment.baseUrl;

export interface PertinenciaDTO {
  idUnique?: number;
  idA: string;
  idS: string;
  pertinencia: string;
  contribucion?: string;
  viabilidad?: string;
  propuesta?: string;
  comentarioS?: string;
}

@Injectable({ providedIn: 'root' })
export class PertinenciaService {
  private http = inject(HttpClient);

  crearPertinencia(payload: PertinenciaDTO): Observable<PertinenciaDTO> {
    return this.http.post<PertinenciaDTO>(`${baseUrl}/pertinencia`, payload, {
      withCredentials: true,
    });
  }

  obtenerPorIdA(idA: string): Observable<PertinenciaDTO> {
    return this.http.get<PertinenciaDTO>(
      `${baseUrl}/pertinencia/${encodeURIComponent(idA)}`,
      {
        withCredentials: true,
      },
    );
  }

  editarPertinencia(idA: string, payload: PertinenciaDTO): Observable<any> {
    return this.http.put(
      `${baseUrl}/pertinencia/edit/${encodeURIComponent(idA)}`,
      payload,
      {
        withCredentials: true,
      },
    );
  }
}
