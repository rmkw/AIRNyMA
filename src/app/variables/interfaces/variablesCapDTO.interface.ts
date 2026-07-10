export interface VariableDTO {
  idA: string;
  idS: string;
  idFuente: string;
  acronimo: string;
  nombre: string;
  definicion: string;
  url: string;
  comentarioS?: string;
  mdea: boolean;
  ods: boolean;
  responsableRegister?: number;
  responsableActualizacion?: number;
  prioridad?: number;
  revisada?: boolean;
  fechaRevision?: string;
  responsableRevision?: number;
  mdeas?: MdeaDTO[]; // <-- Agrega esta línea
  odsList?: OdsDTO[]; // <-- Agrega esta línea
  pertinencia?: TemaCobNecDTO;
}

// Define las interfaces para los objetos anidados
export interface MdeaDTO {
  idA: string;
  idS: number;
  componente: string | number;
  componenteNombre?: string | null;
  subcomponente: string | number;
  subcomponenteNombre?: string | null;
  tema: string | number;
  temaNombre?: string | null;
  estadistica1: string | number;
  estadistica1Nombre?: string | null;
  estadistica2: string | number;
  estadistica2Nombre?: string | null;
  contribucion: string;
  comentarioS: string;
}

export interface OdsDTO {
  idA: string | undefined;
  idS: string;
  objetivo: string;
  objetivoNombre?: string | null;
  meta: string;
  metaNombre?: string | null;
  indicador: string;
  indicadorNombre?: string | null;
  contribucion: string;
  comentarioS: string;
}
export interface TemaCobNecDTO {
  idA: string | undefined;
  pertinencia: string;
  contribucion: string;
  viabilidad: string;
  propuesta: string;
  comentarioS: string;
}
