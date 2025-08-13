import { ProcesoLocal } from '@/procesoProduccion/interfaces/procesos_locales.interface';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-nuevo-proceso',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './nuevo-proceso.component.html',
})
export class NuevoProcesoComponent implements OnInit {
  direccionRecibida: string = '';

  constructor(
    private route: ActivatedRoute,
    private procesosService: ppEcoService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.direccionRecibida = params['direccion'] || '';
      console.log(this.direccionRecibida);
    });
  }
  mensaje: string = '';

  proceso: string = '';
  acronimo: string = '';
  estatus: string = '';
  metodo: string = '';
  iin: string = '';
  periodicidad: string = '';

  objetivo: string = '';
  pobjeto: string = '';
  uobservacion: string = '';
  comentarioS: string = '';

  registrar() {
    // Validación previa: asegúrate de ajustar según tus campos obligatorios reales
    if (
      !this.acronimo ||
      !this.proceso ||
      !this.metodo ||
      !this.objetivo ||
      !this.pobjeto ||
      !this.uobservacion ||
      !this.direccionRecibida || // unidad
      !this.periodicidad ||
      !this.iin ||
      !this.estatus
    ) {
      this.showModalCamposIncompletos();
      return;
    }
    const payload: ProcesoLocal = {
      acronimo: this.acronimo,
      proceso: this.proceso,
      metodo: this.metodo,
      objetivo: this.objetivo,
      pobjeto: this.pobjeto,
      uobservacion: this.uobservacion,
      unidad: this.direccionRecibida,
      periodicidad: this.periodicidad,
      iin: this.iin,
      estatus: this.estatus,
      ipi: false,
      comentarioS: this.comentarioS,

    };

    console.log('Payload a enviar:', payload);

    this.procesosService.registrarProcesoLocal(payload).subscribe({
      next: (res: any) => {
        this.mensaje = res?.message || 'Proceso registrado exitosamente.';
        console.log('✅ Respuesta:', res);
        this.resetForm();
        this.showModalRegistroExitoso();
      },
      error: (err: any) => {
        const msg =
          err?.error?.message || '❌ Ocurrió un error al registrar el proceso.';
        this.mensaje = msg;
        console.error('❌ Error:', err.error?.message);
        console.error('❌ Error?:', err.error);

        this.showModalError(msg);
      },
    });
  }
  resetForm() {
    this.proceso = '';
    this.acronimo = '';
    this.estatus = '';
    this.metodo = '';
    this.iin = '';
    this.periodicidad = '';
    this.objetivo = '';
    this.pobjeto = '';
    this.uobservacion = '';
    this.comentarioS = '';
    this.mensaje = '';
    console.log('Formulario reiniciado');
  }
  @ViewChild('RegistroExitoso') RegistroExitoso!: ElementRef<HTMLDialogElement>;

  // Mostrar el modal
  showModalRegistroExitoso() {
    this.RegistroExitoso.nativeElement.showModal();
  }

  // Redirigir al listado de procesos
  redirigirAProcesos() {
    this.RegistroExitoso.nativeElement.close();
    window.location.href = 'http://10.109.1.13:4200/procesos'; // o usa router.navigate si estás dentro del mismo dominio
  }

  @ViewChild('ErrorModal') ErrorModal!: ElementRef<HTMLDialogElement>;
  mensajeError: string = ''; // mensaje que se mostrará en el modal

  // Mostrar el modal de error con mensaje personalizado
  showModalError(mensaje: string) {
    this.mensajeError = mensaje;
    this.ErrorModal.nativeElement.showModal();
  }

  // Cerrar el modal
  cerrarModalError() {
    this.ErrorModal.nativeElement.close();
  }

  @ViewChild('CamposIncompletosModal')
  CamposIncompletosModal!: ElementRef<HTMLDialogElement>;

  showModalCamposIncompletos() {
    this.CamposIncompletosModal.nativeElement.showModal();
  }

  cerrarModalCamposIncompletos() {
    this.CamposIncompletosModal.nativeElement.close();
  }
}
