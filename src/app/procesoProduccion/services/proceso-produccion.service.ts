import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PpEconomicas } from '../interfaces/ppEco-responce.interface';
import { environment } from 'src/environments/environment';
import { interface_ProcesoP } from '../interfaces/procesos.interface';

const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class ppEcoService {
  constructor() {}

  private http = inject(HttpClient);

  getPpEcos(): Observable<PpEconomicas> {
    return this.http.get<PpEconomicas>(`${baseUrl}/ppeco`);
  }

  // actualizarComentario(
  //   id: number,
  //   comentario: string
  // ): Observable<PpEconomicas> {
  //   return this.http.patch<PpEconomicas>(`${baseUrl}/ppeco/${id}/comentario`, {
  //     comentarioPp: comentario,
  //   });
  // }

  getProcesosProduccion(): Observable<interface_ProcesoP[]> {
    return this.http.get<interface_ProcesoP[]>(`${baseUrl}/procesosP`, {
      withCredentials: true,
    });
  }

  getPorDireccionGeneral(direccionGeneral: string | number | undefined): Observable<interface_ProcesoP[]>{
    const params = new HttpParams().set('unidad_administrativa', direccionGeneral!);

    return this.http.get<interface_ProcesoP[]>(`${baseUrl}/procesosP/buscar`, {params, withCredentials: true},)
  }

  obtenerProcesosPorUnidad(idUnidad: number | undefined): Observable<interface_ProcesoP[]> {
    return this.http.get<interface_ProcesoP[]>(
      `${baseUrl}/procesosP/unidad/${idUnidad}`
    );
  }

  actualizarComentario(id: number | string , comentario: string): Observable<any> {
    const body = { comentario };

    return this.http.put(`${baseUrl}/procesosP/comentario/${id}`, body, {
      withCredentials: true,
    });
  }
}
