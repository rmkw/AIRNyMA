export interface FuenteArmonizacionDTO {
  idFuente?: string;
  idFuenteSeleccion?: string;
  reutilizada?: boolean;
  acronimo: string;
  fuente: string;
  url?: string | null;
  edicion?: string | null;
  comentarioS?: string | null;
  comentarioA?: string | null;
}

export interface FuenteSaveDTO {
  acronimo: string;
  fuente: string;
  url: string | null;
  edicion: string | null;
  comentarioS: string | null;
  comentarioA: string | null;
  idFuenteSeleccion: string;
  idFuenteSeleccionOrigen?: string;
}
