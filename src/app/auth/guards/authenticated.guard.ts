import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { authService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const AuthenticatedGuard: CanMatchFn = async (
  route: Route,
  segments: UrlSegment[]
) => {
  console.log('NotAuthenticatedGuard');

  const _authService = inject(authService);
  const _router = inject(Router);

  const isAuthenticated = await firstValueFrom( _authService.checkUsuario() )


  if (isAuthenticated?.authenticated) {
    _router.navigateByUrl('/');
    return false;
  }
  return true;
}