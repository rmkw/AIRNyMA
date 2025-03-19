import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { authService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'reactiveForms';
  constructor(
    private _authService: authService
  ){}
  ngOnInit(){
    // this._authService.checkUsuario().subscribe((user) => {
    //   console.log('first')
    // });
  }
}
