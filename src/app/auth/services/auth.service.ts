import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Role, UsersResponce } from '../interfaces/users.interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { catchError, map, Observable, of, tap } from 'rxjs';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
const baseUrl = environment.baseUrl

@Injectable({ providedIn: 'root' })
export class authService {
  constructor() {
    this.checkUsuario().subscribe();
    effect(() => {
      // console.log('effect AuthStatus:', this.authStatus());
    });
  }

  private _authStatus = signal<AuthStatus>('checking');

  private _user = signal<UsersResponce | null>(null);

  private http = inject(HttpClient);

  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking') return 'checking';

    if (this._user()) {
      return 'authenticated';
    }

    return 'not-authenticated';
  });

  user = computed(() => this._user());
  isAdmin = computed(()=> this._user()?.roles.includes(Role.Admin) ?? false)

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<AuthResponse>(
        `${baseUrl}/auth/login`,
        {
          username: username,
          password: password,
        },
        { withCredentials: true }
      )
      .pipe(
        map((resp) => this.handleAuthSuccess(resp)),
        catchError((error: any) => this.handleAuthError(error))
      );
  }

  checkUsuario(): Observable<AuthResponse | null> {
    const AUTHENTICATED = 'authenticated';
    const NOT_AUTHENTICATED = 'not-authenticated';

    return this.http
      .get<AuthResponse>(`${baseUrl}/auth/usuario`, { withCredentials: true })
      .pipe(
        tap((resp) => {
          if (!resp || !resp.authenticated) {
            // console.warn('⚠️:', resp?.message);
            this._user.set(null); // Asegurar que el usuario sea nulo
            this._authStatus.set(NOT_AUTHENTICATED);
          } else {
            console.log('✅ Usuario autenticado:', resp.user);
            this._user.set(resp.user || null); // Asignar null si user no existe
            this._authStatus.set(AUTHENTICATED);
          }
        }),
        catchError((error) => {
          // console.error(
          //   '❌ Error al verificar el usuario:',
          //   error.message || 'Error desconocido'
          // );
          this._user.set(null); // Asegurar que el usuario sea nulo en caso de error
          this._authStatus.set(NOT_AUTHENTICATED);
          return of(null); // Devolver null en caso de error
        })
      );
  }

  logout() {
    this.http
      .post(
        `${baseUrl}/auth/logout`,
        {},
        {
          withCredentials: true,
          responseType: 'text',
        }
      )
      .subscribe({
        next: () => {
          // console.log(' Sesión cerrada en el backend');
        },
        error: (err) => {
          console.error(' Error cerrando sesión en el backend:', err);
          console.log(' Respuesta completa:', err.response || err);
        },
        complete: () => {
          // console.log(' Limpiando sesión en frontend...');
          // document.cookie = 'JSESSIONID=; Path=/; Max-Age=0;';
          this._user.set(null);
          this._authStatus.set('not-authenticated');

          localStorage.removeItem('_id');
          localStorage.removeItem('userName');
          localStorage.removeItem('aka');
          localStorage.removeItem('roles');
          localStorage.removeItem('useResponce');
          localStorage.clear();

          //  Recargar la página para eliminar cualquier sesión en memoria
          window.location.href = '/auth/login';
          // console.log('--------');
          // console.log('this._user:', this._user());
          // console.log('this._authStatus:', this._authStatus());
        },
      });
  }

  private handleAuthSuccess(resp: AuthResponse) {
    this._authStatus.set('authenticated');
    this._user.set(resp.user ?? null);

    if (resp.user) {
      // ✅ Verificamos que resp.user no sea undefined
      localStorage.setItem('_id', resp.user.id.toString());
      localStorage.setItem('userName', resp.user.nombre);
      localStorage.setItem('aka', resp.user.aka);
      localStorage.setItem('roles', JSON.stringify(resp.user.roles));
      localStorage.setItem('useResponce', JSON.stringify(resp.user));


    } else {
      console.warn(
        '⚠️ No hay usuario autenticado, no se guardan datos en localStorage'
      );
      localStorage.removeItem('_id');
      localStorage.removeItem('userName');
      localStorage.removeItem('aka');
      localStorage.removeItem('roles');
      localStorage.removeItem('useResponce');
      localStorage.clear();
    }

    return true;
  }

  private handleAuthError(error: any) {
    this.logout();
    return of(false);
  }
}

