import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { AdminsPagesComponent } from './pages/admins-pages/admins-pages.component';
import { IsAdminGuard } from '@/auth/guards/is-admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canMatch: [IsAdminGuard],
    children: [
      {
        path: 'products',
        component: AdminsPagesComponent,
      },
      {
        path: 'product/:id',
        component: AdminPageComponent,
      },
      {
        path:'**',
        redirectTo:'products'
      }
    ],
  },
];

export default adminRoutes;