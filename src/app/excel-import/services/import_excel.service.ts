import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ImportExcelValidacionDto } from '../interfaces/import-excel.models';


const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class ImportExcelService {
  constructor() {}

  private http = inject(HttpClient);

  validarArchivo(file: File) {
    const formData = new FormData();
    formData.append('file', file); // IMPORTANTE: key = "file" (igual que @RequestPart("file"))

    return this.http.post<ImportExcelValidacionDto>(
      `${baseUrl}/import-excel/validar`,
      formData,
      {
        withCredentials: true, // usa true si tu login es por cookie/sesión
      }
    );
  }
  importarArchivo(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(
      `${baseUrl}/import-excel/importar`,
      formData,
      { withCredentials: true }
    );
  }
}
