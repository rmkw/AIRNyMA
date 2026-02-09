import { Component } from '@angular/core';

import { ImportExcelService } from '../services/import_excel.service';
import { CommonModule } from '@angular/common';
import { ImportExcelValidacionDto } from '../interfaces/import-excel.models';

@Component({
  selector: 'app-modulo-import',
  imports: [CommonModule],
  templateUrl: './modulo-import.component.html',
})
export class ModuloExcelImport {
  archivo: File | null = null;

  validacion: ImportExcelValidacionDto | null = null;
  validando = false;

  constructor(private importExcelService: ImportExcelService) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.archivo = input.files?.[0] ?? null;
    this.validacion = null; // reset al cambiar archivo
  }

  validar() {
    if (!this.archivo) return;

    this.validando = true;
    this.importExcelService.validarArchivo(this.archivo).subscribe({
      next: (res) => {
        this.validacion = res;
        this.validando = false;
      },
      error: (err) => {
        this.validacion = {
          ok: false,
          message: 'Error conectando con el servidor.',
          errors: [
            {
              fila: 0,
              columna: '-',
              detalle: err?.message ?? 'Error desconocido',
            },
          ],
        };
        this.validando = false;
      },
    });
  }
  importar() {
    if (!this.archivo || !this.validacion?.ok) return;

    this.importExcelService.importarArchivo(this.archivo).subscribe({
      next: (res) => {
        console.log('IMPORT RESULT', res);
        // aquí muestras mensaje y resumen
      },
      error: () => {
        // muestra alerta roja
      },
    });
  }
}
