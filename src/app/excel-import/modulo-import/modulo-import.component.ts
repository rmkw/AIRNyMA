import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportExcelService } from '../services/import_excel.service';
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

  resultado: any | null = null;
  importando = false;

  constructor(private importExcelService: ImportExcelService) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.archivo = input.files?.[0] ?? null;

    this.validacion = null;
    this.resultado = null;
  }

  validar() {
    if (!this.archivo) return;

    this.validando = true;
    this.validacion = null;
    this.resultado = null;

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

    this.importando = true;
    this.resultado = null;

    this.importExcelService.importarArchivo(this.archivo).subscribe({
      next: (res) => {
        this.resultado = res;
        this.importando = false;
      },
      error: (err) => {
        this.resultado = {
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
        this.importando = false;
      },
    });
  }

  reiniciar() {
    this.archivo = null;
    this.validacion = null;
    this.resultado = null;
    this.validando = false;
    this.importando = false;

    const input = document.getElementById(
      'excelFile',
    ) as HTMLInputElement | null;
    if (input) input.value = '';
  }
}
