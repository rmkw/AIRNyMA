import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { authService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';

export const IsUserGuard: CanMatchFn = async () => {
  const auth = inject(authService);
  const router = inject(Router);

  await firstValueFrom(auth.checkUsuario());

  if (auth.isUser()) return true;

  router.navigateByUrl('/');
  return false;
};
