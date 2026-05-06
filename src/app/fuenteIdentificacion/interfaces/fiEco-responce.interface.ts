export interface FiEcoResponce {
  idFuenteSeleccion: string;
  idFuente: string;

  acronimo: string;
  fuente: string;
  url: string;
  edicion: string;

  comentarioS?: string | null;
  comentarioA?: string | null;

  totalVariables?: number;
}
