import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FiEcoResponce } from '../interfaces/fiEco-responce.interface';

const baseUrl = environment.baseUrl;

export interface FuentePayload {
  idFuenteSeleccion?: string | null;
  acronimo: string;
  fuente: string;
  url: string;
  edicion: string;
  comentarioS?: string | null;
  comentarioA?: string | null;
}

@Injectable({ providedIn: 'root' })
export class FuenteIdentificacionService {
  private http = inject(HttpClient);

  //! OBTENER FUENTES POR ACRONIMO
  getByAcronimo(acronimo: string): Observable<FiEcoResponce[]> {
    const params = new HttpParams().set('acronimo', acronimo);

    return this.http
      .get<FiEcoResponce[]>(`${baseUrl}/fuentes/por-acronimo`, {
        params,
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener fuentes por acrónimo:', error);
          return of([]);
        }),
      );
  }

  //! OBTENER FUENTE POR ID FUENTE SELECCION
  getByIdFuenteSeleccion(
    idFuenteSeleccion: string,
  ): Observable<FiEcoResponce | null> {
    const params = new HttpParams().set('idFuenteSeleccion', idFuenteSeleccion);

    return this.http
      .get<FiEcoResponce>(`${baseUrl}/fuentes/by-id-fuente-seleccion`, {
        params,
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          console.error(
            'Error al obtener fuente por idFuenteSeleccion:',
            error,
          );
          return of(null);
        }),
      );
  }

  //! REGISTRAR FUENTE
  registrarFuente(datos: FuentePayload): Observable<FiEcoResponce | null> {
    return this.http
      .post<FiEcoResponce>(`${baseUrl}/fuentes`, datos, {
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          console.error('Error al registrar fuente:', error);
          return throwError(() => error);
        }),
      );
  }

  //! EDITAR FUENTE
  editarFuente(
    idFuenteSeleccion: string,
    datos: FuentePayload,
  ): Observable<FiEcoResponce | null> {
    const params = new HttpParams().set('idFuenteSeleccion', idFuenteSeleccion);

    return this.http
      .put<FiEcoResponce>(`${baseUrl}/fuentes/update`, datos, {
        params,
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          console.error('Error al editar fuente:', error);
          return throwError(() => error);
        }),
      );
  }

  //! ELIMINAR FUENTE
  eliminarFuente(idFuenteSeleccion: string): Observable<any> {
    const params = new HttpParams().set('idFuenteSeleccion', idFuenteSeleccion);

    return this.http.delete(`${baseUrl}/fuentes`, {
      params,
      withCredentials: true,
    });
  }

  //! CONTAR FUENTES
  countFuentes(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${baseUrl}/fuentes/count`, {
      withCredentials: true,
    });
  }
}
