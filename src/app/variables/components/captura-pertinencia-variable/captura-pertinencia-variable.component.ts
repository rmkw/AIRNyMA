import { PertinenciaDTO, PertinenciaService } from '@/variables/services/pertinencia/pertinencia.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-captura-pertinencia-variable',
  imports: [CommonModule, FormsModule],
  templateUrl: './captura-pertinencia-variable.component.html',
  styleUrl: './captura-pertinencia-variable.component.css',
})
export class CapturaPertinenciaVariableComponent implements OnChanges {
  @Input() idA: string = '';
  @Input() idS: string = '';

  private _pertinenciaService = inject(PertinenciaService);

  temaCobertura = '';
  nivelContribucion = '';
  viabilidad = '';
  propuesta = '';
  comentarioS = '';

  pertinenciaExistente: PertinenciaDTO | null = null;
  loadingPertinencia = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idA'] && this.idA) {
      this.yaMostroAvisoSinPertinencia = false;
      this.cargarPertinencia();
    }
  }

  cargarPertinencia() {
    if (!this.idA) return;

    this.loadingPertinencia = true;
    this.resetFormularioLocal();

    this._pertinenciaService.obtenerPorIdA(this.idA).subscribe({
      next: (data) => {
        this.pertinenciaExistente = data;
        this.temaCobertura = data?.pertinencia ?? '';
        this.nivelContribucion = data?.contribucion ?? '';
        this.viabilidad = data?.viabilidad ?? '';
        this.propuesta = data?.propuesta ?? '';
        this.comentarioS = data?.comentarioS ?? '';
        this.loadingPertinencia = false;
      },
      error: (err: any) => {
        this.pertinenciaExistente = null;
        this.resetFormularioLocal();
        this.loadingPertinencia = false;

        if (err?.status === 404 && !this.yaMostroAvisoSinPertinencia) {
          this.yaMostroAvisoSinPertinencia = true;
          this.abrirModalSinPertinencia();
        } else {
          console.error('Error al cargar pertinencia:', err);
        }
      },
    });
  }

  formularioPertinenciaValido(): boolean {
    return (
      !!this.temaCobertura?.trim() &&
      !!this.nivelContribucion?.trim() &&
      !!this.viabilidad?.trim() &&
      !!this.propuesta?.trim() &&
      !!this.comentarioS?.trim()
    );
  }

  guardarPertinencia() {
    if (!this.idA || !this.idS) {
      this.abrirModalErrorPertinencia(
        'Falta contexto de variable para pertinencia.',
      );
      return;
    }

    if (!this.formularioPertinenciaValido()) {
      this.abrirModalSinDatosPertinencia();
      return;
    }

    const payload: PertinenciaDTO = {
      idA: this.idA,
      idS: this.idS,
      pertinencia: this.temaCobertura.trim(),
      contribucion: this.nivelContribucion || undefined,
      viabilidad: this.viabilidad || undefined,
      propuesta: this.propuesta?.trim() || undefined,
      comentarioS: this.comentarioS?.trim() || undefined,
    };

    if (this.pertinenciaExistente?.idUnique) {
      this._pertinenciaService.editarPertinencia(this.idA, payload).subscribe({
        next: () => {
          this.cargarPertinencia();
          this.abrirModalOkPertinencia();
        },
        error: (err: any) => {
          const mensaje =
            err?.error?.message ||
            err?.error?.error ||
            'Ocurrió un error al actualizar la pertinencia.';
          this.abrirModalErrorPertinencia(mensaje);
        },
      });
      return;
    }

    this._pertinenciaService.crearPertinencia(payload).subscribe({
      next: (data) => {
        this.pertinenciaExistente = data;
        this.cargarPertinencia();
        this.abrirModalOkPertinencia();
      },
      error: (err: any) => {
        const mensaje =
          err?.error?.message ||
          err?.error?.error ||
          'Ocurrió un error al registrar la pertinencia.';
        this.abrirModalErrorPertinencia(mensaje);
      },
    });
  }

  limpiarFormulario() {
    this.resetFormularioLocal();
  }

  private resetFormularioLocal() {
    this.temaCobertura = '';
    this.nivelContribucion = '';
    this.viabilidad = '';
    this.propuesta = '';
    this.comentarioS = '';
  }

  @Output() pertinenciaGuardada = new EventEmitter<void>();

  @ViewChild('modalOkPertinencia')
  modalOkPertinencia!: ElementRef<HTMLDialogElement>;

  @ViewChild('modalErrorPertinencia')
  modalErrorPertinencia!: ElementRef<HTMLDialogElement>;

  mensajeErrorPertinencia = '';
  abrirModalOkPertinencia() {
    this.modalOkPertinencia?.nativeElement.showModal();
  }

  cerrarModalOkPertinencia() {
    this.modalOkPertinencia?.nativeElement.close();
    this.pertinenciaGuardada.emit();
  }

  abrirModalErrorPertinencia(mensaje: string) {
    this.mensajeErrorPertinencia = mensaje;
    this.modalErrorPertinencia?.nativeElement.showModal();
  }

  cerrarModalErrorPertinencia() {
    this.modalErrorPertinencia?.nativeElement.close();
  }
  camposFaltantes: string[] = [];
  obtenerCamposFaltantes(): string[] {
    const faltantes: string[] = [];

    if (!this.temaCobertura?.trim()) faltantes.push('Tema de cobertura');
    if (!this.nivelContribucion?.trim())
      faltantes.push('Nivel de contribución');
    if (!this.viabilidad?.trim()) faltantes.push('Viabilidad de generación');
    if (!this.propuesta?.trim()) faltantes.push('Propuesta');
    if (!this.comentarioS?.trim()) faltantes.push('Comentario');

    return faltantes;
  }

  abrirModalSinDatosPertinencia() {
    this.camposFaltantes = this.obtenerCamposFaltantes();
    this.modalSinDatosPertinencia?.nativeElement.showModal();
  }

  cerrarModalSinDatosPertinencia() {
    this.modalSinDatosPertinencia?.nativeElement.close();
  }
  @ViewChild('modalSinDatosPertinencia')
  modalSinDatosPertinencia!: ElementRef<HTMLDialogElement>;

  @ViewChild('modalSinPertinencia')
  modalSinPertinencia!: ElementRef<HTMLDialogElement>;

  yaMostroAvisoSinPertinencia = false;

  abrirModalSinPertinencia() {
    this.modalSinPertinencia?.nativeElement.showModal();
  }

  cerrarModalSinPertinencia() {
    this.modalSinPertinencia?.nativeElement.close();
  }
}
