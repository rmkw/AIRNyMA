import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TicketVariable, UsuarioTicket } from '@/tickets/interfaces/ticket-variable.interface';

@Injectable({ providedIn: 'root' })
export class TicketsVariablesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.baseUrl}/armo/tickets-variables`;
  pendientes = signal(0);

  actualizarPendientes(): void {
    this.obtenerTodos('pendiente').subscribe({
      next: (tickets) => this.pendientes.set(tickets.length),
      error: () => this.pendientes.set(0),
    });
  }

  crear(ticket: TicketVariable): Observable<TicketVariable> {
    return this.http.post<TicketVariable>(this.baseUrl, ticket, {
      withCredentials: true,
    });
  }

  obtenerTodos(estatus?: string): Observable<TicketVariable[]> {
    const params = estatus ? new HttpParams().set('estatus', estatus) : undefined;
    return this.http.get<TicketVariable[]>(this.baseUrl, {
      params,
      withCredentials: true,
    });
  }

  obtenerAsignadosA(idUsuario: number): Observable<TicketVariable[]> {
    return this.http.get<TicketVariable[]>(`${this.baseUrl}/asignado/${idUsuario}`, {
      withCredentials: true,
    });
  }

  obtenerPorVariable(idA: string): Observable<TicketVariable[]> {
    return this.http.get<TicketVariable[]>(`${this.baseUrl}/variable/${idA}`, {
      withCredentials: true,
    });
  }

  actualizar(idTicket: number, ticket: TicketVariable): Observable<TicketVariable> {
    return this.http.put<TicketVariable>(`${this.baseUrl}/${idTicket}`, ticket, {
      withCredentials: true,
    });
  }

  obtenerUsuarios(): Observable<UsuarioTicket[]> {
    return this.http.get<UsuarioTicket[]>(`${environment.baseUrl}/usuarios`, {
      withCredentials: true,
    });
  }
}
