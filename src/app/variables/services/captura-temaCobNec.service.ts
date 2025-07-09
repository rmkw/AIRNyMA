import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { TemaCobNec } from '../interfaces/temaCobNec.interface';
import { Observable } from 'rxjs';

const baseUrl = environment.baseUrl
@Injectable({ providedIn: 'root' })
export class TemaCobNecService {
  constructor() {}
  private http = inject(HttpClient);

  crearTema(data: TemaCobNec): Observable<TemaCobNec> {
    return this.http.post<TemaCobNec>(`${baseUrl}/pertinencia`, data, {
      withCredentials: true,
    });
  }
}
