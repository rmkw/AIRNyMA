import { Routes } from '@angular/router';
import { NotAuthenticatedGuard } from './auth/guards/not-authenticated.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes'),
    canMatch: [NotAuthenticatedGuard],
  },
  {
    path: '',
    loadChildren: () => import('./store/store-front.routes'),
    canMatch: [NotAuthenticatedGuard],
  },
];
