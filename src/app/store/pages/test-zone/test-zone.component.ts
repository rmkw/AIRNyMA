import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-test-zone',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './test-zone.component.html',
})

export class TestZoneComponent implements OnInit {
  arregloHome: { name: string; comentario: string; nivel?: string }[] = [
    { name: 'John', comentario: 'comentarios asdfghjk' },
    { name: 'Jane', comentario: 'comentarios asdfghjk' },
    { name: 'Doe', comentario: 'comentarios asdfghjk' },
  ];

  nuevoNombre: string = '';
  nuevoComentario: string = '';
  nuevoNivel: string = '';

  ngOnInit() {
    console.log('TestZoneComponent ngOnInit');
  }

  agregarObjeto() {
    if (!this.nuevoNombre || !this.nuevoComentario || !this.nuevoNivel) {
      alert('Faltan datos');
      return;
    }

    this.arregloHome.push({
      name: this.nuevoNombre,
      comentario: `${this.nuevoComentario} (Nivel: ${this.nuevoNivel})`,
    });
    console.log('Arreglo actualizado:', this.arregloHome);
    // Limpiar campos
    this.nuevoNombre = '';
    this.nuevoComentario = '';
    this.nuevoNivel = '';
  }

  eliminarObjeto(index: number) {
    this.arregloHome.splice(index, 1);
    console.log('Arreglo después de eliminar:', this.arregloHome);
  }}
