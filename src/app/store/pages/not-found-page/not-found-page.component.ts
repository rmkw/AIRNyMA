import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-not-found-page',
  imports: [CommonModule],
  templateUrl: './not-found-page.component.html',
})
export class NotFoundPageComponent implements OnInit {
  dogImageUrl: string = '';
  isLoading: boolean = true;

  ngOnInit() {
    this.getRandomDogImage();
  }

  getRandomDogImage() {
    this.isLoading = true;
    const randomNumber = Math.floor(Math.random() * 200) + 1;
    this.dogImageUrl = `https://images-na.ssl-images-amazon.com/images/G/01/error/${randomNumber}._TTD_.jpg`;

    // Simular tiempo de carga antes de mostrar la imagen
    const img = new Image();
    img.src = this.dogImageUrl;
    img.onload = () => {
      this.isLoading = false;
    };
  }
}
