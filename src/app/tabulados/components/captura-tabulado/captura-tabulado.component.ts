import { interface_ProcesoP } from '@/procesoProduccion/interfaces/procesos.interface';
import { DireccionesService } from '@/procesoProduccion/services/direcciones.service';
import { ppEcoService } from '@/procesoProduccion/services/proceso-produccion.service';
import { Tabulado } from '@/tabulados/interfaces/tabulado.interface';
import { Direccion } from '@/variables/interfaces/direcciones.interface';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-captura-tabulado',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './captura-tabulado.component.html',
})
export class CapturaTabuladoComponent implements OnInit {
  private direccionesService = inject(DireccionesService);
  private procesosService = inject(ppEcoService);

  arrDirecciones: Direccion[] = [];
  arrProcesosPBydire: interface_ProcesoP[] = [];
  direccionSeleccionada = '';
  procesoSeleccionado = '';
  procesosHabilitados = false;
  prefijoTabulado = '';
  serialTabulado = '';
  edicionTabulado = '';

  tabulado: Tabulado = {
    idTabulado: '',
    tabulado: '',
    tipo: '',
    hoja: '',
    urlAcceso: '',
    urlDescarga: '',
    comentarioA: '',
  };

  ngOnInit(): void {
    this.cargarDirecciones();
  }

  selectedDireccion(direccion: string) {
    this.procesoSeleccionado = '';
    this.arrProcesosPBydire = [];
    this.procesosHabilitados = true;
    this.limpiarIdTabulado();

    this.procesosService.getPorDireccionGeneral(direccion).subscribe({
      next: (procesos) => {
        this.arrProcesosPBydire = procesos;
      },
      error: (err) => {
        console.error('Error al cargar los procesos de producción:', err);
        this.arrProcesosPBydire = [];
      },
    });
  }

  seleccionarProceso(acronimo: string) {
    this.prefijoTabulado = `${acronimo}-`;
    this.serialTabulado = '';
    this.edicionTabulado = '';
    this.sincronizarIdTabulado();
  }

  actualizarSerial(valor: string) {
    this.serialTabulado = valor.replace(/\D/g, '');
    this.sincronizarIdTabulado();
  }

  actualizarEdicion(valor: string) {
    this.edicionTabulado = valor.replace(/\D/g, '').slice(0, 4);
    this.sincronizarIdTabulado();
  }

  private cargarDirecciones() {
    this.direccionesService.getDirecciones().subscribe({
      next: (direcciones) => {
        this.arrDirecciones = direcciones;
      },
      error: (err) => {
        console.error('Error al cargar las unidades productoras:', err);
        this.arrDirecciones = [];
      },
    });
  }

  private limpiarIdTabulado() {
    this.prefijoTabulado = '';
    this.serialTabulado = '';
    this.edicionTabulado = '';
    this.tabulado.idTabulado = '';
  }

  private sincronizarIdTabulado() {
    const idBase = `${this.prefijoTabulado}${this.serialTabulado}`;

    this.tabulado.idTabulado =
      this.serialTabulado && this.edicionTabulado.length === 4
        ? `${idBase}-${this.edicionTabulado}-T`
        : idBase;
  }
}
