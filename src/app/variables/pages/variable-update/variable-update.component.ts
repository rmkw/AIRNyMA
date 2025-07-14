import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-variable-update',
  imports: [CommonModule],
  templateUrl: './variable-update.component.html',
})
export class VariableUpdateComponent {
  arrComponentes = [];
  relationesMDEA = [];
  relacionesODS = [];
  arrMetas = [];
  arrIndicadores = [];
  arrODS = [];
  arrVariables = [];
  arrEstadisticos = [];
  arrSubcompo = [];
  arrTopicos = [];
  mdea_boolean: boolean = true;
  ods_boolean: boolean = true;
}
