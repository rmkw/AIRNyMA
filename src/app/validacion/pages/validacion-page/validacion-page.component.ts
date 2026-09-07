import { interface_ProcesoP } from '@/procesoProduccion/interfaces/procesos.interface';
import { DireccionesService } from '@/procesoProduccion/services/direcciones.service';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { Direccion } from '@/variables/interfaces/direcciones.interface';
import { FuenteArmonizacionDTO } from '@/variables/interfaces/fuenteArmonizacion.interface';
import { MdeaTraducido, OdsTraducido, VariableDetalleArmo, VariablesArmo } from '@/variables/interfaces/armonizacion/variables-armo.interface';
import { VariablesArmoService } from '@/variables/services/armonizacion/variables-armo.service';
import { VariableService } from '@/variables/services/variables.service';
import { TicketVariable, UsuarioTicket } from '@/tickets/interfaces/ticket-variable.interface';
import { TicketsVariablesService } from '@/tickets/services/tickets-variables.service';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';

@Component({
  selector: 'app-validacion-page',
  templateUrl: './validacion-page.component.html',
})
export class ValidacionPageComponent implements OnInit {
  private direccionesService = inject(DireccionesService);
  private procesosService = inject(ppEcoService);
  private variablesService = inject(VariableService);
  private variablesArmoService = inject(VariablesArmoService);
  private ticketsService = inject(TicketsVariablesService);

  @ViewChild('ticketModal') ticketModal?: ElementRef<HTMLDialogElement>;

  direcciones: Direccion[] = [];
  procesos: interface_ProcesoP[] = [];
  fuentes: FuenteArmonizacionDTO[] = [];
  variables: VariablesArmo[] = [];
  fuenteSeleccionada: FuenteArmonizacionDTO | null = null;
  variableSeleccionada: VariablesArmo | null = null;
  detalleVariable: VariableDetalleArmo | null = null;
  mdeasTraducidos: MdeaTraducido[] = [];
  odsTraducidos: OdsTraducido[] = [];
  direccionSeleccionada = '';
  procesoSeleccionado = '';
  cargandoProcesos = false;
  cargandoFuentes = false;
  cargandoVariables = false;
  cargandoDetalle = false;
  validando = false;
  error = '';
  errorVariables = '';
  errorDetalle = '';
  errorValidacion = '';
  propiedadTicket = '';
  incidenciaTicket = '';
  errorTicket = '';
  guardandoTicket = false;
  usuariosTicket: UsuarioTicket[] = [];
  usuarioAsignadoTicket: number | null = null;
  errorUsuariosTicket = '';
  ticketsVariable: TicketVariable[] = [];
  cargandoTicketsVariable = false;
  errorTicketsVariable = '';

  ngOnInit(): void {
    this.direccionesService.getDirecciones().subscribe({
      next: (direcciones) => (this.direcciones = direcciones),
      error: () => (this.error = 'No fue posible cargar las unidades productoras.'),
    });
  }

  seleccionarDireccion(event: Event) {
    this.direccionSeleccionada = (event.target as HTMLSelectElement).value;
    this.procesoSeleccionado = '';
    this.procesos = [];
    this.fuentes = [];
    this.limpiarVariables();
    this.error = '';

    if (!this.direccionSeleccionada) return;

    this.cargandoProcesos = true;
    this.procesosService.getPorDireccionGeneral(this.direccionSeleccionada).subscribe({
      next: (procesos) => {
        this.procesos = procesos;
        this.cargandoProcesos = false;
      },
      error: () => {
        this.cargandoProcesos = false;
        this.error = 'No fue posible cargar los procesos de producción.';
      },
    });
  }

  seleccionarProceso(event: Event) {
    this.procesoSeleccionado = (event.target as HTMLSelectElement).value;
    this.fuentes = [];
    this.limpiarVariables();
    this.error = '';

    if (!this.procesoSeleccionado) return;

    this.cargandoFuentes = true;
    this.variablesService
      .getFuentesArmonizacionByAcronimo(this.procesoSeleccionado)
      .subscribe({
        next: (fuentes) => {
          this.fuentes = fuentes;
          this.cargandoFuentes = false;
        },
        error: () => {
          this.cargandoFuentes = false;
          this.error = 'No fue posible cargar las fuentes de armonización.';
        },
      });
  }

  seleccionarFuente(fuente: FuenteArmonizacionDTO) {
    this.limpiarVariables();
    this.fuenteSeleccionada = fuente;

    if (!fuente.idFuente) {
      this.errorVariables = 'La fuente seleccionada no tiene un identificador válido.';
      return;
    }

    this.cargandoVariables = true;
    this.variablesArmoService.obtenerPorIdFuente(fuente.idFuente).subscribe({
      next: (variables) => {
        this.variables = variables;
        this.cargandoVariables = false;
      },
      error: () => {
        this.cargandoVariables = false;
        this.errorVariables = 'No fue posible cargar las variables de la fuente seleccionada.';
      },
    });
  }

  private limpiarVariables() {
    this.variables = [];
    this.fuenteSeleccionada = null;
    this.cargandoVariables = false;
    this.errorVariables = '';
    this.variableSeleccionada = null;
    this.detalleVariable = null;
    this.mdeasTraducidos = [];
    this.odsTraducidos = [];
    this.cargandoDetalle = false;
    this.errorDetalle = '';
    this.errorValidacion = '';
    this.validando = false;
    this.ticketsVariable = [];
    this.cargandoTicketsVariable = false;
    this.errorTicketsVariable = '';
  }

  seleccionarVariable(variable: VariablesArmo) {
    this.variableSeleccionada = variable;
    this.detalleVariable = null;
    this.mdeasTraducidos = [];
    this.odsTraducidos = [];
    this.errorDetalle = '';
    this.cargandoDetalle = true;

    this.variablesArmoService.obtenerDetallePorIdA(variable.idA).subscribe({
      next: (detalle) => {
        this.detalleVariable = detalle;
        this.cargandoDetalle = false;
        this.cargarTraducciones(variable.idA);
        this.cargarTicketsVariable(variable.idA);
      },
      error: () => {
        this.cargandoDetalle = false;
        this.errorDetalle = 'No fue posible cargar el detalle de la variable seleccionada.';
      },
    });
  }

  cambiarValidacion(validada: boolean) {
    if (!this.variableSeleccionada || this.validando) return;
    if (validada && (this.cargandoTicketsVariable || this.errorTicketsVariable || this.ticketsSinCompletar > 0)) {
      this.errorValidacion = this.errorTicketsVariable
        ? 'No es posible revisar la variable sin verificar sus tickets.'
        : 'No es posible revisar la variable mientras tenga tickets activos.';
      return;
    }

    this.validando = true;
    this.errorValidacion = '';

    this.variablesArmoService.actualizarValidacion(this.variableSeleccionada.idA, validada).subscribe({
      next: (variableActualizada) => {
        this.variables = this.variables.map((variable) =>
          variable.idA === variableActualizada.idA ? variableActualizada : variable,
        );
        this.variableSeleccionada = variableActualizada;

        if (this.detalleVariable) {
          this.detalleVariable = {
            ...this.detalleVariable,
            variable: variableActualizada,
          };
        }

        this.validando = false;
      },
      error: () => {
        this.validando = false;
        this.errorValidacion = 'No fue posible actualizar el estado de revisión.';
      },
    });
  }

  abrirModalTicket() {
    if (!this.variableSeleccionada || this.variableSeleccionada.validada) return;

    this.propiedadTicket = '';
    this.incidenciaTicket = '';
    this.errorTicket = '';
    this.errorUsuariosTicket = '';
    this.usuarioAsignadoTicket = null;
    this.ticketModal?.nativeElement.showModal();

    if (this.usuariosTicket.length === 0) {
      this.ticketsService.obtenerUsuarios().subscribe({
        next: (usuarios) => (this.usuariosTicket = usuarios),
        error: () => (this.errorUsuariosTicket = 'No fue posible cargar los usuarios para asignar el ticket.'),
      });
    }
  }

  cerrarModalTicket() {
    this.ticketModal?.nativeElement.close();
  }

  guardarTicket() {
    if (!this.variableSeleccionada || this.guardandoTicket) return;

    const idUsuarioReporta = Number(localStorage.getItem('_id'));
    if (!Number.isInteger(idUsuarioReporta) || idUsuarioReporta <= 0) {
      this.errorTicket = 'No fue posible identificar al usuario reportante.';
      return;
    }
    if (!this.propiedadTicket) {
      this.errorTicket = 'Selecciona la propiedad con incidencia.';
      return;
    }
    if (!this.usuarioAsignadoTicket) {
      this.errorTicket = 'Selecciona el usuario que atenderá el ticket.';
      return;
    }
    if (!this.incidenciaTicket.trim()) {
      this.errorTicket = 'Describe la incidencia para crear el ticket.';
      return;
    }

    const ticket: TicketVariable = {
      idA: this.variableSeleccionada.idA,
      idUsuarioReporta,
      idUsuarioAsignado: this.usuarioAsignadoTicket,
      propiedad: this.propiedadTicket,
      incidencia: this.incidenciaTicket.trim(),
    };

    this.guardandoTicket = true;
    this.errorTicket = '';
    this.ticketsService.crear(ticket).subscribe({
      next: () => {
        this.guardandoTicket = false;
        this.cargarTicketsVariable(ticket.idA);
        this.ticketsService.actualizarPendientes();
        this.cerrarModalTicket();
      },
      error: () => {
        this.guardandoTicket = false;
        this.errorTicket = 'No fue posible registrar el ticket.';
      },
    });
  }

  seleccionarUsuarioAsignado(event: Event) {
    const valor = (event.target as HTMLSelectElement).value;
    this.usuarioAsignadoTicket = valor ? Number(valor) : null;
  }

  get ticketsSinCompletar(): number {
    return this.ticketsVariable.filter(
      (ticket) => ticket.estatus === 'pendiente' || ticket.estatus === 'en_proceso',
    ).length;
  }

  private cargarTicketsVariable(idA: string) {
    this.cargandoTicketsVariable = true;
    this.errorTicketsVariable = '';
    this.ticketsService.obtenerPorVariable(idA).subscribe({
      next: (tickets) => {
        this.ticketsVariable = tickets;
        this.cargandoTicketsVariable = false;
      },
      error: () => {
        this.ticketsVariable = [];
        this.cargandoTicketsVariable = false;
        this.errorTicketsVariable = 'No fue posible verificar los tickets de esta variable.';
      },
    });
  }

  private cargarTraducciones(idA: string) {
    this.variablesArmoService.obtenerMdeaTraducido(idA).subscribe({
      next: (mdeas) => (this.mdeasTraducidos = mdeas),
      error: () => (this.mdeasTraducidos = []),
    });

    this.variablesArmoService.obtenerOdsTraducido(idA).subscribe({
      next: (ods) => (this.odsTraducidos = ods),
      error: () => (this.odsTraducidos = []),
    });
  }
}
