import { CapturaTabuladoComponent } from '@/tabulados/components/captura-tabulado/captura-tabulado.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tabulados-page',
  standalone: true,
  imports: [CapturaTabuladoComponent],
  templateUrl: './tabulados-page.component.html',
})
export class TabuladosPageComponent {}
