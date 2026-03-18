export interface MdeaTraduccionDTO {
  idUnique: number;
  idA: string;
  idS: string;

  componente: string;
  componenteNombre: string | null;

  subcomponente: string;
  subcomponenteNombre: string | null;

  tema: string;
  temaNombre: string | null;

  estadistica1: string;
  estadistica1Nombre: string | null;

  estadistica2: string;
  estadistica2Nombre: string | null;

  contribucion: string | null;
  comentarioS: string | null;
}

export interface OdsTraduccionDTO {
  idUnique: number;
  idA: string;
  idS: string;

  objetivo: string;
  objetivoNombre: string | null;

  meta: string;
  metaNombre: string | null;

  indicador: string;
  indicadorNombre: string | null;

  contribucion: string | null;
  comentarioS: string | null;
}

export interface PertinenciaDTO {
  idUnique: number;
  idA: string;
  idS: string;
  pertinencia: string;
  contribucion: string | null;
  viabilidad: string | null;
  propuesta: string | null;
  comentarioS: string | null;
}

export interface VariableRevisionPrioridadDTO {
  idA: string;
  idS: string;
  idFuente: string;
  acronimo: string;
  nombre: string;
  url: string | null;
  definicion: string | null;

  prioridad: number | null;
  revisada: boolean;
  fechaRevision: string | null;
  responsableRevision: number | null;

  mdea: boolean | null;
  ods: boolean | null;

  mdeas: MdeaTraduccionDTO[];
  odsList: OdsTraduccionDTO[];
  pertinencia: PertinenciaDTO | null;
}
