import { instanceStorage } from '@/shared/instance-storage';
import { Component, OnInit, inject } from '@angular/core';
import { TicketVariable, UsuarioTicket } from '@/tickets/interfaces/ticket-variable.interface';
import { TicketsVariablesService } from '@/tickets/services/tickets-variables.service';
import { ArmonizacionVariablesComponent } from '@/variables/pages/armonizacion-variables/armo-variables.component';
import { ClasificacionesVariableComponent } from '@/variables/components/clasificaciones-variable/clasificaciones-variable.component';
import { MicrodatosVariableComponent } from '@/variables/components/microdatos-variable/microdatos-variable.component';
import { DatosAbiertosVariableComponent } from '@/variables/components/datos-abiertos-variable/datos-abiertos-variable.component';
import { TabuladosPageComponent } from '@/tabulados/pages/tabulados-page/tabulados-page.component';
import { CapturaMdeaVariableComponent } from '@/variables/components/captura-mdea-variable/captura-mdea-variable.component';
import { VariablesArmoService } from '@/variables/services/armonizacion/variables-armo.service';
import { CapturaOdsVariableComponent } from '@/variables/components/captura-ods-variable/captura-ods-variable.component';
import { CapturaPertinenciaVariableComponent } from '@/variables/components/captura-pertinencia-variable/captura-pertinencia-variable.component';

@Component({
  selector: 'app-tickets-page',
  templateUrl: './tickets-page.component.html',
  standalone: true,
  imports: [ArmonizacionVariablesComponent, ClasificacionesVariableComponent, MicrodatosVariableComponent, DatosAbiertosVariableComponent, TabuladosPageComponent, CapturaMdeaVariableComponent, CapturaOdsVariableComponent, CapturaPertinenciaVariableComponent],
})
export class TicketsPageComponent implements OnInit {
  private ticketsService = inject(TicketsVariablesService);
  private variablesArmoService = inject(VariablesArmoService);

  tickets: TicketVariable[] = [];
  usuarios: UsuarioTicket[] = [];
  ticketSeleccionado: TicketVariable | null = null;
  filtroEstatus = '';
  soloMisTickets = false;
  cargando = false;
  guardando = false;
  error = '';
  errorUsuarios = '';
  idSMdeaTicket = '';
  cargandoMdeaTicket = false;
  errorMdeaTicket = '';
  idSOdsTicket = '';
  cargandoOdsTicket = false;
  errorOdsTicket = '';
  idSPertinenciaTicket = '';
  cargandoPertinenciaTicket = false;
  errorPertinenciaTicket = '';

  ngOnInit(): void {
    this.cargarTickets();
    this.ticketsService.actualizarPendientes();
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
    this.idSMdeaTicket = '';
    this.errorMdeaTicket = '';
    this.idSOdsTicket = '';
    this.errorOdsTicket = '';
    this.idSPertinenciaTicket = '';
    this.errorPertinenciaTicket = '';

    if (ticket.propiedad === 'mdea') {
      this.cargarContextoMdea(ticket.idA);
    }
    if (ticket.propiedad === 'ods') {
      this.cargarContextoOds(ticket.idA);
    }
    if (ticket.propiedad === 'pertinencia') {
      this.cargarContextoPertinencia(ticket.idA);
    }
  }

  private cargarContextoMdea(idA: string) {
    this.cargandoMdeaTicket = true;

    this.variablesArmoService.obtenerPorIdA(idA).subscribe({
      next: (variable) => {
        if (this.ticketSeleccionado?.idA !== idA) return;
        this.idSMdeaTicket = variable.idS ?? '';
        this.cargandoMdeaTicket = false;
        if (!this.idSMdeaTicket) {
          this.errorMdeaTicket = 'La variable no tiene un ID_S asociado.';
        }
      },
      error: () => {
        if (this.ticketSeleccionado?.idA !== idA) return;
        this.cargandoMdeaTicket = false;
        this.errorMdeaTicket = 'No fue posible obtener el ID_S de la variable.';
      },
    });
  }

  private cargarContextoOds(idA: string) {
    this.cargandoOdsTicket = true;

    this.variablesArmoService.obtenerPorIdA(idA).subscribe({
      next: (variable) => {
        if (this.ticketSeleccionado?.idA !== idA) return;
        this.idSOdsTicket = variable.idS ?? '';
        this.cargandoOdsTicket = false;
        if (!this.idSOdsTicket) {
          this.errorOdsTicket = 'La variable no tiene un ID_S asociado.';
        }
      },
      error: () => {
        if (this.ticketSeleccionado?.idA !== idA) return;
        this.cargandoOdsTicket = false;
        this.errorOdsTicket = 'No fue posible obtener el ID_S de la variable.';
      },
    });
  }

  private cargarContextoPertinencia(idA: string) {
    this.cargandoPertinenciaTicket = true;

    this.variablesArmoService.obtenerPorIdA(idA).subscribe({
      next: (variable) => {
        if (this.ticketSeleccionado?.idA !== idA) return;
        this.idSPertinenciaTicket = variable.idS ?? '';
        this.cargandoPertinenciaTicket = false;
        if (!this.idSPertinenciaTicket) {
          this.errorPertinenciaTicket = 'La variable no tiene un ID_S asociado.';
        }
      },
      error: () => {
        if (this.ticketSeleccionado?.idA !== idA) return;
        this.cargandoPertinenciaTicket = false;
        this.errorPertinenciaTicket = 'No fue posible obtener el ID_S de la variable.';
      },
    });
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
        this.ticketsService.actualizarPendientes();
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

  etiquetaEstatus(estatus?: TicketVariable['estatus']): string {
    return {
      pendiente: 'Pendiente',
      en_proceso: 'En proceso',
      completado: 'Completado',
      cancelado: 'Cancelado',
    }[estatus ?? 'pendiente'];
  }

  claseEstatus(estatus?: TicketVariable['estatus']): string {
    return {
      pendiente: 'badge-warning',
      en_proceso: 'badge-info',
      completado: 'badge-success',
      cancelado: 'badge-error',
    }[estatus ?? 'pendiente'];
  }

  private idUsuarioSesion(): number | null {
    const idUsuario = Number(instanceStorage.getItem('_id'));
    return Number.isInteger(idUsuario) && idUsuario > 0 ? idUsuario : null;
  }
}
