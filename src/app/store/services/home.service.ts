import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProcesoCountResponse } from '../interface/ProcesoCountResponse.interface';
import { FuenteCountResponse } from '../interface/FuenteCountResponse.interface';
import { VariableCountResponse } from '../interface/VariableCountResponse.interface';
import { CountResponse } from '../interface/CountResponse';


const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class homeService {
  constructor() {}
  private http = inject(HttpClient);

  getTotalProcesos(): Observable<ProcesoCountResponse> {
    return this.http.get<ProcesoCountResponse>(`${baseUrl}/procesos/count`, {
      withCredentials: true,
    });
  }

  getTotalFuentes(): Observable<FuenteCountResponse> {
    return this.http.get<FuenteCountResponse>(`${baseUrl}/fuentes/count`, {
      withCredentials: true,
    });
  }

  getTotalVariables(): Observable<VariableCountResponse> {
    return this.http.get<VariableCountResponse>(`${baseUrl}/variables/count`, {
      withCredentials: true,
    });
  }

  getTotalVariablesPrioritarias(): Observable<VariableCountResponse> {
    return this.http.get<VariableCountResponse>(
      `${baseUrl}/variables/count-prioridad`,
      {
        withCredentials: true,
      },
    );
  }
  getTotalVariablesArmonizadas(): Observable<CountResponse> {
    return this.http.get<CountResponse>(`${baseUrl}/armo/variables/count`, {
      withCredentials: true,
    });
  }
}
