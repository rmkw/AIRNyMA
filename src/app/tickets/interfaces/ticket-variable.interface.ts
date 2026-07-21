export interface TicketVariable {
  idTicket?: number;
  idA: string;
  idUsuarioReporta: number;
  idUsuarioAsignado?: number | null;
  incidencia: string;
  propiedad?: string | null;
  estatus?: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  fechaCreacion?: string;
  fechaActualizacion?: string;
  fechaResolucion?: string | null;
}

export interface UsuarioTicket {
  id: number;
  nombre: string;
  aka: string;
}
