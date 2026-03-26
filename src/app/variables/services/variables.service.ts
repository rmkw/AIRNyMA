import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { VariableDTO } from '../interfaces/variablesCapDTO.interface';
import { VariableRevisionPrioridadDTO } from '../interfaces/variableRevisionPrioridad.interface';
import { FuenteArmonizacionDTO, FuenteSaveDTO } from '../interfaces/fuenteArmonizacion.interface';
import { ExistsFuenteArmonizacionResponse } from '../interfaces/ExistsFuenteArmonizacionResponse.interface';

const baseUrl = environment.baseUrl
@Injectable({ providedIn: 'root' })
export class VariableService {
  constructor() {}
  private http = inject(HttpClient);

  getVars(
    responsableRegister: number,
    idFuente: string,
    page = 0,
    size = 10,
  ): Observable<any> {
    return this.http.get<any>(
      `${baseUrl}/variables/filtered?responsableRegister=${responsableRegister}&idFuente=${encodeURIComponent(
        idFuente,
      )}&page=${page}&size=${size}`,
      { withCredentials: true },
    );
  }

  crearVar(variable: VariableDTO): Observable<VariableDTO> {
    return this.http.post<VariableDTO>(`${baseUrl}/variables`, variable);
  }

  deleteVariable(idA: string) {
    return this.http.delete(`${baseUrl}/variables/delete-full/${idA}`, {
      withCredentials: true,
    });
  }

  getByVariable(idVariable: string): Observable<any> {
    return this.http.get<any>(`${baseUrl}/variables/por-id/${idVariable}`);
  }

  getVariableByIdA(idA: string): Observable<VariableDTO> {
    return this.http.get<VariableDTO>(`${baseUrl}/variables/por-ida/${idA}`, {
      withCredentials: true,
    });
  }
  updateVariable(idA: string, payload: VariableDTO) {
    return this.http.put<{ message: string }>(
      `${baseUrl}/variables/edit/${idA}`,
      payload,
      {
        withCredentials: true,
      },
    );
  }

  getVariablesByFuentes(
    idFuentes: string[],
  ): Observable<VariableRevisionPrioridadDTO[]> {
    let params = new HttpParams();

    idFuentes.forEach((idFuente) => {
      params = params.append('idFuentes', idFuente);
    });

    return this.http.get<VariableRevisionPrioridadDTO[]>(
      `${baseUrl}/variables/por-fuentes`,
      {
        params,
        withCredentials: true,
      },
    );
  }

  updateRevisionPrioridad(
    idA: string,
    payload: {
      prioridad: number;
      revisada: boolean;
      responsableRevision: number;
    },
  ) {
    return this.http.put<{ message: string }>(
      `${baseUrl}/variables/revision-prioridad/${idA}`,
      payload,
      {
        withCredentials: true,
      },
    );
  }
  updateRevisionPrioridadMasiva(payload: {
    idsA: string[];
    prioridad: number;
    revisada: boolean;
    responsableRevision: number;
  }) {
    return this.http.put<{
      message: string;
      totalActualizadas: number;
      prioridad: number;
      revisada: boolean;
    }>(`${baseUrl}/variables/revision-prioridad-masiva`, payload, {
      withCredentials: true,
    });
  }

  getVariablesTablaByFuentes(
    idFuentes: string[],
  ): Observable<any[]> {
    let params = new HttpParams();

    idFuentes.forEach((idFuente) => {
      params = params.append('idFuentes', idFuente);
    });

    return this.http.get<any[]>(
      `${baseUrl}/variables/por-fuentes-tabla`,
      {
        params,
        withCredentials: true,
      },
    );
  }






  /* esta parte es de fuentes */



  existsFuenteArmonizacion(idFuente: string): Observable<{ exists: boolean }> {
  return this.http.get<{ exists: boolean }>(
    `${baseUrl}/armo/fuentes/exists/${encodeURIComponent(idFuente)}`,
    {
      withCredentials: true,
    },
  );
}

getFuenteArmonizacionById(idFuente: string): Observable<FuenteArmonizacionDTO> {
  return this.http.get<FuenteArmonizacionDTO>(
    `${baseUrl}/armo/fuentes/${encodeURIComponent(idFuente)}`,
    {
      withCredentials: true,
    },
  );
}

createFuenteArmonizacion(
  payload: FuenteSaveDTO,
): Observable<FuenteArmonizacionDTO> {
  return this.http.post<FuenteArmonizacionDTO>(
    `${baseUrl}/armo/fuentes`,
    payload,
    {
      withCredentials: true,
    },
  );
}

/**
 * Este método lo dejamos listo,
 * pero solo funcionará cuando exista el PUT en backend.
 */
updateFuenteArmonizacion(
  payload: FuenteSaveDTO,
): Observable<FuenteArmonizacionDTO> {
  return this.http.put<FuenteArmonizacionDTO>(
    `${baseUrl}/armo/fuentes`,
    payload,
    {
      withCredentials: true,
    },
  );
}




existsFuenteArmonizacionByData(
  payload: FuenteSaveDTO,
): Observable<ExistsFuenteArmonizacionResponse> {
  return this.http.post<ExistsFuenteArmonizacionResponse>(
    `${baseUrl}/armo/fuentes/exists-by-data`,
    payload,
    {
      withCredentials: true,
    },
  );
}


getFuenteArmonizacionByIdFuenteSeleccion(
  idFuenteSeleccion: string,
): Observable<FuenteArmonizacionDTO> {
  return this.http.get<FuenteArmonizacionDTO>(
    `${baseUrl}/armo/fuentes/by-id-fuente-seleccion`,
    {
      params: { idFuenteSeleccion },
      withCredentials: true,
    },
  );
}
}
