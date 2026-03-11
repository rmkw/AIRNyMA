import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { authService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const IsSeleccionGuard: CanMatchFn = async () => {
  const auth = inject(authService);
  const router = inject(Router);

  await firstValueFrom(auth.checkUsuario());

  if (auth.isAdminOrRoot()) return true; // ROOT / ADMIN
  if (auth.isUser() && !auth.isArmo()) return true; // selección pura

  router.navigateByUrl('/');
  return false;
};
