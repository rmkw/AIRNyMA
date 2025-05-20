export interface VariableDTO {
  idUnique?: number;
  idVariable: string;
  idFuente: number;
  idPp: string;
  nombreVariable: string;
  definicionVar?: string;
  linkVar?: string;
  comentarioVar?: string;
  varSerieAnio?: string;
  alineacionMdea: boolean;
  alineacionOds: boolean;
  responsableRegister: number;
  responsableActualizacion?: number;
  mdeas?: MdeaDTO[]; // <-- Agrega esta línea
  ods?: OdsDTO[]; // <-- Agrega esta línea
  pertinencia?: TemaCobNecDTO[];
}

// Define las interfaces para los objetos anidados
export interface MdeaDTO {
  id: number;
  idVarCaracterizada: string;
  idVariableUnique: number;
  idVariable: string;
  idComponente: string;
  idSubcomponente: string;
  idTopico: string;
  idVariableMdeaPull: string;
  idEstadistico: string;
  nivelContribucion: string;
  comentarioRelacionMdea: string;
}

export interface OdsDTO {
  idUnique: number;
  idVariableUnique: number;
  idVariable: string;
  idVarCaracterizada: string;
  idObj: string;
  idMeta: string;
  idIndicador: string;
  nivelContribucion: string;
  comentarioRelacionODS: string;
}
export interface TemaCobNecDTO {
  id: number;
  temaCobNec: string;
  nivelContribucion: string;
  viabEstDer: string;
  propEstDer: string;
  comentarioPertinencia: string;
  idVariableUnique: number;
}
