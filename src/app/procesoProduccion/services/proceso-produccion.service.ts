import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PpEconomicas } from '../interfaces/ppEco-responce.interface';
import { environment } from 'src/environments/environment';
import { interface_ProcesoP } from '../interfaces/procesos.interface';
import { ProcesoLocal } from '../interfaces/procesos_locales.interface';

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
    return this.http.get<interface_ProcesoP[]>(`${baseUrl}/procesos`, {
      withCredentials: true,
    });
  }

  getPorDireccionGeneral(
    direccionGeneral: string | number | undefined,
  ): Observable<interface_ProcesoP[]> {
    const params = new HttpParams().set(
      'unidad_administrativa',
      direccionGeneral!,
    );

    return this.http.get<interface_ProcesoP[]>(`${baseUrl}/procesos/buscar`, {
      params,
      withCredentials: true,
    });
  }

  obtenerProcesosPorUnidad(
    idUnidad: number | undefined,
  ): Observable<interface_ProcesoP[]> {
    return this.http.get<interface_ProcesoP[]>(
      `${baseUrl}/procesos/unidad/${idUnidad}`,
    );
  }

  actualizarComentario(
    id: number | string,
    comentario: string,
  ): Observable<any> {
    const body = { comentario };

    return this.http.put(`${baseUrl}/procesos/comentario/${id}`, body, {
      withCredentials: true,
    });
  }

  registrarProcesoLocal(proceso: ProcesoLocal): Observable<any> {
    return this.http.post(`${baseUrl}/procesos/registrar`, proceso, {
      withCredentials: true,
    });
  }

  getComentarioSeleccionPorAcronimo(acronimo: string) {
    return this.http.get<any>(`${baseUrl}/sele/comentarios-pp/buscar`, {
      params: { acronimo },
      withCredentials: true,
    });
  }

  getComentarioArmonizacionPorAcronimo(acronimo: string) {
    return this.http.get<any>(`${baseUrl}/armo/comentarios-pp/buscar`, {
      params: { acronimo },
      withCredentials: true,
    });
  }

  guardarOActualizarComentarioSeleccion(payload: {
    acronimo: string;
    comentarioS: string;
  }) {
    return this.http.post<any>(
      `${baseUrl}/sele/comentarios-pp/guardar-o-actualizar`,
      payload,
      {
        withCredentials: true,
      },
    );
  }

  guardarOActualizarComentarioArmonizacion(payload: {
    acronimo: string;
    comentarioS: string;
  }) {
    return this.http.post<any>(
      `${baseUrl}/armo/comentarios-pp/guardar-o-actualizar`,
      payload,
      {
        withCredentials: true,
      },
    );
  }
}
