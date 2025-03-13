import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: ()=> import('./store/store-front.routes'),
  }
];
