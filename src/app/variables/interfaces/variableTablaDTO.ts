export interface VariableTablaDTO {
  idA: string;
  idS: string;
  idFuente: string;
  acronimo: string;
  nombre: string;

  definicion?: string | null;
  url?: string | null;
  comentarioS?: string | null;

  mdea?: boolean | null;
  ods?: boolean | null;

  responsableRegister: number;
  responsableActualizacion?: number | null;

  prioridad?: number | null;
  revisada?: boolean | null;
  fechaRevision?: string | null;
  responsableRevision?: number | null;
}
