export interface FiEcoResponce {
  idFuente: string;
  acronimo: string;
  fuente: string;
  url?: string | null;
  edicion?: string | number | null;
  comentarioS?: string | null;
  responsableRegister?: number;
  responsableActualizacion: number | null;
  totalVariables?: number;

}
