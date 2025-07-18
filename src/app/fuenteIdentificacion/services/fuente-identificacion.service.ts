import { authService } from '@/auth/services/auth.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FiEcoResponce } from '../interfaces/fiEco-responce.interface';

const baseUrl = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class FuenteIdentificacionService {
  constructor() {}

  private _authService = inject(authService);
  private http = inject(HttpClient);

  //!OBTENER FUENTES
  obtenerFuentes(): Observable<FiEcoResponce[]> {
    const userId = this._authService.user()?.id;
    if (!userId) {
      console.log('No hay usuario autenticado');
      return of([]);
    }

    return this.http.get<FiEcoResponce[]>(`${baseUrl}/fuentes/${userId}`).pipe(
      catchError((error) => {
        console.error('Error al obtener fuentes:', error);
        return of([]);
      })
    );
  }

  getByIdPpAndResponsable(
    acronimo: string,
    responsableRegister: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('acronimo', acronimo)
      .set('responsableRegister', responsableRegister.toString());

    return this.http.get(`${baseUrl}/fuentes/byResponsable`, { params });
  }

  //!REGISTRAR FUENTE
  registrarFuente(datos: {
    acronimo: string;
    fuente: string;
    url: string;
    edicion: string | number;
    comentarioS: string;
  }): Observable<FiEcoResponce | null> {
    const userId = this._authService.user()?.id;
    // console.log('Usuario autenticado en servicio fuente:', userId);

    // Si no hay usuario logeado, no se puede registrar
    if (!userId) {
      console.log('No hay usuario autenticado');
      return of(null); // O puedes lanzar un error, dependiendo de cómo lo manejes
    }

    // Se agrega responsableRegister con el userId
    const datosConResponsable = {
      ...datos,
      responsableRegister: userId,
    };
    // console.log('Datos enviados al backend:', datosConResponsable);

    return this.http
      .post<FiEcoResponce>(`${baseUrl}/fuentes`, datosConResponsable)
      .pipe(
        catchError((error) => {
          console.error('Error al registrar fuente:', error);
          return of(null); // O cualquier otro valor que indique error
        })
      );
  }

  editarFuente(
    idFuente: number,
    datos: Omit<FiEcoResponce, 'idFuente' | 'responsableActualizacion'>
  ): Observable<FiEcoResponce | null> {
    const userId = this._authService.user()?.id;
    if (!userId) {
      console.log('No hay usuario autenticado');
      return of(null);
    }
    console.log('Usuario autenticado en servicio fuente:', userId);
    const payload = { ...datos, idFuente, responsableActualizacion: userId };
    console.log('Enviando datos al backend:', payload);

    return this.http
      .put<FiEcoResponce>(`${baseUrl}/fuentes/${idFuente}`, payload)
      .pipe(
        catchError((error) => {
          console.error('Error al editar fuente:', error);
          return of(null);
        })
      );
  }

  deactivateRecord(id: number): Observable<any> {
    return this.http.delete(
      `${baseUrl}/fuentes/${id}/delete-full`,

      { withCredentials: true }
    );
  }
}
