import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { authService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const NotAuthenticatedGuard: CanMatchFn = async (
  route: Route,
  segments: UrlSegment[]
) => {
   console.log('AuthenticatedGuard');

   const _authService = inject(authService);
   const _router = inject(Router);

   try {
     const isAuthenticated = await firstValueFrom(_authService.checkUsuario());

     if (!isAuthenticated?.authenticated) {
       _router.navigateByUrl('/auth/login');
       return false;
     }

     return true;
   } catch (error) {
     console.error('Error en AuthenticatedGuard:', error);
     _router.navigateByUrl('/auth/login');
     return false;
   }
}