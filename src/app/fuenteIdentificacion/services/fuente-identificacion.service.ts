import { authService } from '@/auth/services/auth.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FiEcoResponce } from '../interfaces/fiEco-responce.interface';

const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class FuenteIdentificacionService {
  constructor() {}

  private _authService = inject(authService);
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

  //! OBTENER FUENTE POR ID
  getByIdFuente(idFuente: string): Observable<FiEcoResponce | null> {
    const params = new HttpParams().set('idFuente', idFuente);

    return this.http
      .get<FiEcoResponce>(`${baseUrl}/fuentes/by-id`, {
        params,
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener fuente por id:', error);
          return of(null);
        }),
      );
  }

  //! REGISTRAR FUENTE
  registrarFuente(datos: {
    acronimo: string;
    fuente: string;
    url: string | null;
    edicion: string | number | null;
    comentarioS: string;
    comentarioA?: string | null;
    idFuenteSeleccion?: string | null;
  }): Observable<FiEcoResponce | null> {
    const userId = this._authService.user()?.id;

    if (!userId) {
      console.log('No hay usuario autenticado');
      return of(null);
    }

    const datosConResponsable = {
      ...datos,
      responsableRegister: userId,
    };

    return this.http
      .post<FiEcoResponce>(`${baseUrl}/fuentes`, datosConResponsable, {
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
    idFuente: string,
    datos: {
      acronimo: string;
      fuente: string;
      url: string | null;
      edicion: string | number | null;
      comentarioS: string;
      comentarioA?: string | null;
      responsableRegister: number;
      responsableActualizacion: number | null;
      idFuenteSeleccion?: string | null;
    },
  ): Observable<FiEcoResponce | null> {
    const params = new HttpParams().set('idFuente', idFuente);

    return this.http
      .put<FiEcoResponce>(`${baseUrl}/fuentes/update`, datos, {
        params,
        withCredentials: true,
      })
      .pipe(
        catchError((error) => {
          console.error('Error al editar fuente:', error);
          return of(null);
        }),
      );
  }

  //! ELIMINAR FUENTE
  eliminarFuente(idFuente: string): Observable<any> {
    const params = new HttpParams().set('idFuente', idFuente);

    return this.http.delete(`${baseUrl}/fuentes/delete`, {
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
