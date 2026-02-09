export interface ImportExcelErrorFilaDto {
  fila: number;
  columna: string;
  detalle: string;
}

export interface ImportExcelValidacionDto {
  ok: boolean;
  message: string;
  errors: ImportExcelErrorFilaDto[];
}
