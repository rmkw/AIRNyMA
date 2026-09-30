export interface FiltrosVisor {
  unidad: string;
  acronimo: string;
  idFuente: string;
  variableA: string;
  anioReferencia: string;
  tematica: string;
  tema1: string;
  subtema1: string;
  tema2: string;
  subtema2: string;
  clasificacion: string;
  tabulados: string;
  datosabiertos: string;
  mdea: string;
  ods: string;
  validada: string;
  microdatos: string;
}

export interface OpcionesVisor {
  unidades: string[];
  procesos: { acronimo: string; proceso: string }[];
  fuentes: { idFuente: string; fuente: string; edicion: string }[];
  anios: number[];
  tematica: string[];
  tema1: string[];
  subtema1: string[];
  tema2: string[];
  subtema2: string[];
}

export interface FilaVisor {
  idA: string;
  variableA: string | null;
  acronimo: string;
  idFuente: string;
  fuente: string | null;
  edicion: string | null;
  anioReferencia: number | null;
  validada: boolean | null;
}

export interface PaginaVisor {
  content: FilaVisor[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
