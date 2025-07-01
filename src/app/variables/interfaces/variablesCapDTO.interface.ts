export interface VariableDTO {
  idA: string;
  idS: string;
  idFuente: number;
  acronimo: string;
  nombre: string;
  definicion: string;
  url: string;
  comentarioS?: string;
  mdea: boolean;
  ods: boolean;
  responsableRegister: number;
  responsableActualizacion?: number;
  alineacionMdea?: MdeaDTO[]; // <-- Agrega esta línea
  alineacionOds?: OdsDTO[]; // <-- Agrega esta línea
  pertinencia?: TemaCobNecDTO[];
}

// Define las interfaces para los objetos anidados
export interface MdeaDTO {
  idA: string;
  idS: number;
  componente: string | number;
  subcomponente: string | number;
  tema: string | number;
  estadistica1: string | number;
  estadistica2: string | number;
  contribucion: string;
  comentarioS: string;
}

export interface OdsDTO {
  idA: string | undefined;
  idS: string;
  objetivo: string;
  meta: string;
  indicador: string;
  contribucion: string;
  comentarioS: string;
}
export interface TemaCobNecDTO {
  idA: string | undefined;
  pertinencia: string;
  contribucion?: string;
  viabilidad?: string;
  propuesta?: string;
  comentarioS?: string;
}
