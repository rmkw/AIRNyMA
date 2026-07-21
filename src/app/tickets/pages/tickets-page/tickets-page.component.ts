import { Component, OnInit, inject } from '@angular/core';
import { TicketVariable, UsuarioTicket } from '@/tickets/interfaces/ticket-variable.interface';
import { TicketsVariablesService } from '@/tickets/services/tickets-variables.service';

@Component({
  selector: 'app-tickets-page',
  templateUrl: './tickets-page.component.html',
})
export class TicketsPageComponent implements OnInit {
  private ticketsService = inject(TicketsVariablesService);

  tickets: TicketVariable[] = [];
  usuarios: UsuarioTicket[] = [];
  ticketSeleccionado: TicketVariable | null = null;
  filtroEstatus = '';
  soloMisTickets = false;
  cargando = false;
  guardando = false;
  error = '';
  errorUsuarios = '';

  ngOnInit(): void {
    this.cargarTickets();
    this.ticketsService.obtenerUsuarios().subscribe({
      next: (usuarios) => (this.usuarios = usuarios),
      error: () => (this.errorUsuarios = 'No fue posible cargar los usuarios.'),
    });
  }

  cargarTickets() {
    this.cargando = true;
    this.error = '';
    this.ticketSeleccionado = null;

    const procesarTickets = (tickets: TicketVariable[]) => {
      this.tickets = this.filtroEstatus
        ? tickets.filter((ticket) => ticket.estatus === this.filtroEstatus)
        : tickets;
      this.cargando = false;
    };
    const manejarError = () => {
      this.cargando = false;
      this.error = 'No fue posible cargar los tickets.';
    };

    if (this.soloMisTickets) {
      const idUsuario = this.idUsuarioSesion();
      if (!idUsuario) {
        this.cargando = false;
        this.error = 'No fue posible identificar al usuario de la sesión.';
        return;
      }
      this.ticketsService.obtenerAsignadosA(idUsuario).subscribe({
        next: procesarTickets,
        error: manejarError,
      });
      return;
    }

    this.ticketsService.obtenerTodos(this.filtroEstatus || undefined).subscribe({
      next: procesarTickets,
      error: manejarError,
    });
  }

  alternarMisTickets() {
    this.soloMisTickets = !this.soloMisTickets;
    this.cargarTickets();
  }

  seleccionarTicket(ticket: TicketVariable) {
    this.ticketSeleccionado = { ...ticket };
  }

  cambiarEstatus(event: Event) {
    if (!this.ticketSeleccionado) return;
    this.ticketSeleccionado = {
      ...this.ticketSeleccionado,
      estatus: (event.target as HTMLSelectElement).value as TicketVariable['estatus'],
    };
  }

  guardarCambios() {
    if (!this.ticketSeleccionado?.idTicket || this.guardando) return;

    this.guardando = true;
    this.error = '';
    this.ticketsService.actualizar(this.ticketSeleccionado.idTicket, this.ticketSeleccionado).subscribe({
      next: (ticketActualizado) => {
        this.tickets = this.tickets.map((ticket) =>
          ticket.idTicket === ticketActualizado.idTicket ? ticketActualizado : ticket,
        );
        this.ticketSeleccionado = ticketActualizado;
        this.guardando = false;
      },
      error: () => {
        this.guardando = false;
        this.error = 'No fue posible actualizar el ticket.';
      },
    });
  }

  nombreUsuario(idUsuario?: number | null): string {
    if (!idUsuario) return '-';
    const usuario = this.usuarios.find((item) => item.id === idUsuario);
    return usuario ? usuario.aka || usuario.nombre : `Usuario ${idUsuario}`;
  }

  private idUsuarioSesion(): number | null {
    const idUsuario = Number(localStorage.getItem('_id'));
    return Number.isInteger(idUsuario) && idUsuario > 0 ? idUsuario : null;
  }
}
