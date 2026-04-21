export interface VariableTablaDTO {
  idA: string;
  idS: string;
  idFuente: string;
  acronimo: string;
  nombre: string;
  definicion: string;
  url: string;
  comentarioS: string;
  mdea: boolean;
  ods: boolean;
  responsableRegister: number;
  responsableActualizacion?: number;
  prioridad?: number;
  revisada: boolean;
  fechaRevision?: string;
  responsableRevision?: number;
}
