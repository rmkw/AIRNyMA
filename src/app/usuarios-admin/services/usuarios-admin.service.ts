import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UsuarioAdmin, UsuarioAdminRequest } from '../interfaces/usuario-admin.interface';

@Injectable({ providedIn: 'root' })
export class UsuariosAdminService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/admin-usuarios`;

  estado(): Observable<{ desbloqueado: boolean }> {
    return this.http.get<{ desbloqueado: boolean }>(`${this.baseUrl}/estado`, {
      withCredentials: true,
    });
  }

  desbloquear(clave: string): Observable<{ desbloqueado: boolean }> {
    return this.http.post<{ desbloqueado: boolean }>(
      `${this.baseUrl}/desbloquear`,
      { clave },
      { withCredentials: true },
    );
  }

  bloquear(): Observable<{ desbloqueado: boolean }> {
    return this.http.post<{ desbloqueado: boolean }>(
      `${this.baseUrl}/bloquear`,
      {},
      { withCredentials: true },
    );
  }

  listar(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(this.baseUrl, { withCredentials: true });
  }

  crear(payload: UsuarioAdminRequest): Observable<UsuarioAdmin> {
    return this.http.post<UsuarioAdmin>(this.baseUrl, payload, { withCredentials: true });
  }

  actualizar(id: number, payload: UsuarioAdminRequest): Observable<UsuarioAdmin> {
    return this.http.put<UsuarioAdmin>(`${this.baseUrl}/${id}`, payload, {
      withCredentials: true,
    });
  }

  cambiarContrasena(id: number, clave: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.baseUrl}/${id}/contrasena`,
      { clave },
      { withCredentials: true },
    );
  }

  eliminar(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
