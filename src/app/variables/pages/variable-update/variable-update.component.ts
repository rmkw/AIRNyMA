import { VariableDTO } from '@/variables/interfaces/variablesCapDTO.interface';
import { VariableService } from '@/variables/services/variables.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs';

@Component({
  selector: 'app-variable-update',
  imports: [CommonModule],
  templateUrl: './variable-update.component.html',
})
export class VariableUpdateComponent implements OnInit {
  idA!: string;
  variableData!: VariableDTO;

  constructor(
    private route: ActivatedRoute,
    private _variableService: VariableService
  ) {}

  mdea_boolean: boolean = true;
  ods_boolean: boolean = true;

  ngOnInit(): void {
    this.idA = this.route.snapshot.paramMap.get('idA')!;
    console.log('ID de la variable:', this.idA);
    this.loadVariable();
  }

  loadVariable() {
    this._variableService.getVariableByIdA(this.idA).subscribe({
      next: (data) => {
        this.variableData = data;
        console.log('Variable cargada:', this.variableData);
        // Aquí puedes usar patchValue si usas Reactive Forms
      },
      error: (err) => {
        console.error('Error cargando variable', err);
      }
    });
}
}
