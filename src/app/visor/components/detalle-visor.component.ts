import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { VariableDetalleArmo, MdeaTraducido, OdsTraducido } from '@/variables/interfaces/armonizacion/variables-armo.interface';

@Component({
  selector: 'app-detalle-visor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-visor.component.html',
})
export class DetalleVisorComponent implements OnChanges {
  @Input({ required: true }) detalle!: VariableDetalleArmo;
  @Input() mdeas: MdeaTraducido[] = [];
  @Input() ods: OdsTraducido[] = [];

  apartados: { titulo: string; valor: unknown }[] = [];
  readonly etiquetas: Record<string, string> = {
    idA: 'ID_A', idS: 'ID_S', idUnique: 'ID del registro', idFuente: 'ID de fuente',
    acronimo: 'Acrónimo', variableS: 'Variable en selección', variableA: 'Variable armonizada',
    url: 'URL', pregunta: 'Pregunta', definicion: 'Definición', universo: 'Universo',
    anioReferencia: 'Año de referencia', tematica: 'Temática', tema1: 'Tema 1',
    subtema1: 'Subtema 1', tema2: 'Tema 2', subtema2: 'Subtema 2',
    tabulados: 'Tabulados', clasificacion: 'Clasificación', microdatos: 'Microdatos',
    datosabiertos: 'Datos abiertos', mdea: 'MDEA', ods: 'ODS', validada: 'Revisada',
    comentarioS: 'Comentario de selección', comentarioA: 'Comentario de armonización',
    comentariosA: 'Comentarios', clase: 'Clase', clasificador: 'Clasificador', version: 'Versión',
    urlAcceso: 'URL de acceso', urlDescarga: 'URL de descarga', urlDescriptor: 'URL del descriptor',
    descriptor: 'Descriptor', tabla: 'Tabla', campo: 'Campo', laboratorio: 'Laboratorio de Microdatos',
    idTabulado: 'ID de tabulado', comentarioRelacion: 'Comentario de la relación',
    tabulado: 'Tabulado', tipo: 'Tipo', hoja: 'Hoja', desgloses: 'Desgloses',
    desglose: 'Desglose', desagregaciones: 'Desagregaciones', coberturaDesagregacion: 'Cobertura',
    componente: 'Código de componente', subcomponente: 'Código de subcomponente',
    tema: 'Código de tema', estadistica1: 'Código de estadístico 1', estadistica2: 'Código de estadístico 2',
    componenteNombre: 'Componente', subcomponenteNombre: 'Subcomponente', temaNombre: 'Tema',
    estadistica1Nombre: 'Estadístico 1', estadistica2Nombre: 'Estadístico 2',
    contribucion: 'Contribución', objetivo: 'Código de objetivo', meta: 'Código de meta',
    indicador: 'Código de indicador', objetivoNombre: 'Objetivo', metaNombre: 'Meta',
    indicadorNombre: 'Indicador', pertinencia: 'Pertinencia', viabilidad: 'Viabilidad', propuesta: 'Propuesta',
  };

  ngOnChanges() {
    this.apartados = [
      { titulo: 'Clasificaciones', valor: this.detalle.clasificaciones },
      { titulo: 'Clasificadores', valor: this.detalle.clasificadores ?? [] },
      { titulo: 'Microdatos', valor: this.detalle.microdatos },
      { titulo: 'Datos abiertos', valor: this.detalle.datosAbiertos },
      { titulo: 'Tabulados', valor: this.detalle.tabulados },
      { titulo: 'MDEA', valor: this.detalle.mdeas.map(r => ({ ...r, ...this.mdeas.find(t => t.idUnique === r.idUnique) })) },
      { titulo: 'ODS', valor: this.detalle.odsList.map(r => ({ ...r, ...this.ods.find(t => t.idUnique === r.idUnique) })) },
      { titulo: 'Pertinencia', valor: this.detalle.pertinencia },
    ];
  }

  campos(valor: unknown): [string, unknown][] {
    return valor && typeof valor === 'object' ? Object.entries(valor) : [];
  }

  esObjeto(valor: unknown) { return valor !== null && typeof valor === 'object'; }
  lista(valor: unknown): unknown[] | null { return Array.isArray(valor) ? valor : null; }
  esUrl(valor: unknown) { return typeof valor === 'string' && /^https?:\/\//i.test(valor); }
  texto(valor: unknown): string {
    if (valor === true) return 'Sí';
    if (valor === false) return 'No';
    return valor == null || valor === '' ? 'Sin dato' : String(valor);
  }
}
