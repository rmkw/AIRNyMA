import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Direccion } from '../../variables/interfaces/direcciones.interface';

const baseUrl = environment.baseUrl



@Injectable({ providedIn: 'root' })
export class DireccionesService {
  constructor() {}
  private http = inject(HttpClient);

  getDirecciones(): Observable<Direccion[]> {
    return this.http.get<Direccion[]>(`${baseUrl}/unidad`, {
      withCredentials: true,
    });
  }
}
