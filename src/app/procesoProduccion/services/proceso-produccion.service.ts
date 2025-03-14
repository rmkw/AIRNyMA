import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PpEconomicas } from '../interfaces/ppEco-responce.interface';
import { environment } from 'src/environments/environment';

const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class ppEcoService {
  constructor() {}

  private http = inject(HttpClient);

  getPpEcos(): Observable<PpEconomicas> {
    return this.http.get<PpEconomicas>(`${baseUrl}/ppeco`);

    //.pipe(tap((resp) => console.log(resp)));
  }

  actualizarComentario(
    id: number,
    comentario: string
  ): Observable<PpEconomicas> {
    return this.http.patch<PpEconomicas>(`${baseUrl}/ppeco/${id}/comentario`, {
      comentarioPp: comentario,
    });
  }
}
