export interface VariableDTO {
  id?: number;
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
}
