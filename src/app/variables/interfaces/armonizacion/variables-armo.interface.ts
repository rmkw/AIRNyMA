import { ClasificadorArmo } from './clasificadores-armo.interface';

export interface VariablesArmo {
  idA: string;
  idFuente: string;
  acronimo: string;
  idS?: string;
  variableS?: string;
  variableA?: string;
  url?: string;
  pregunta?: string;
  definicion?: string;
  universo?: string;
  anioReferencia?: number | null;
  tematica?: string;
  tema1?: string;
  subtema1?: string;
  tema2?: string;
  subtema2?: string;
  tabulados?: boolean;
  clasificacion?: boolean;
  microdatos?: boolean;
  datosabiertos?: boolean;
  mdea?: boolean;
  ods?: boolean;
  comentarioS?: string;
  comentarioA?: string;
  validada?: boolean;
}

export interface ClasificacionArmoDetalle {
  idUnique: number;
  idA: string;
  clase: string;
  comentarioA: string;
}

export interface MicrodatoArmoDetalle {
  idUnique: number;
  idA: string;
  urlAcceso: string;
  descriptor: string;
  urlDescriptor: string;
  tabla: string;
  campo: string;
  comentarioA: string;
  laboratorio: boolean;
}

export interface DatoAbiertoArmoDetalle {
  idUnique: number;
  idA: string;
  urlAcceso: string;
  urlDescarga: string;
  descriptor: string;
  tabla: string;
  campo: string;
  comentarioA: string;
}

export interface VariableTabuladoArmoDetalle {
  idUnique: number;
  idA: string;
  idTabulado: string;
  comentarioRelacion: string;
  tabulado: TabuladoArmoDetalle | null;
  desgloses: DesgloseArmoDetalle[];
  desagregaciones: DesagregacionArmoDetalle[];
}

export interface TabuladoArmoDetalle {
  idTabulado: string;
  tabulado: string;
  tipo: string;
  hoja: string;
  urlAcceso: string;
  urlDescarga: string;
  comentarioA: string;
}

export interface DesgloseArmoDetalle {
  idUnique: number;
  idTabulado: string;
  desglose: string;
  comentarioA: string;
}

export interface DesagregacionArmoDetalle {
  idUnique: number;
  idTabulado: string;
  coberturaDesagregacion: string;
  comentarioA: string;
}

export interface MdeaDetalle {
  idUnique: number;
  idA: string;
  idS: string;
  componente: string;
  subcomponente: string;
  tema: string;
  estadistica1: string;
  estadistica2: string;
  contribucion: string;
  comentarioS: string;
}

export interface OdsDetalle {
  idUnique: number;
  idA: string;
  idS: string;
  objetivo: string;
  meta: string;
  indicador: string;
  contribucion: string;
  comentarioS: string;
}

export interface PertinenciaDetalle {
  idUnique: number;
  idA: string;
  idS: string;
  pertinencia: string;
  contribucion: string;
  viabilidad: string;
  propuesta: string;
  comentarioS: string;
}

export interface MdeaTraducido extends MdeaDetalle {
  componenteNombre?: string;
  subcomponenteNombre?: string;
  temaNombre?: string;
  estadistica1Nombre?: string;
  estadistica2Nombre?: string;
}

export interface OdsTraducido extends OdsDetalle {
  objetivoNombre?: string;
  metaNombre?: string;
  indicadorNombre?: string;
}

export interface VariableDetalleArmo {
  clasificadores: ClasificadorArmo[];
  variable: VariablesArmo;
  clasificaciones: ClasificacionArmoDetalle[];
  microdatos: MicrodatoArmoDetalle[];
  datosAbiertos: DatoAbiertoArmoDetalle[];
  tabulados: VariableTabuladoArmoDetalle[];
  mdeas: MdeaDetalle[];
  odsList: OdsDetalle[];
  pertinencia: PertinenciaDetalle | null;
}
