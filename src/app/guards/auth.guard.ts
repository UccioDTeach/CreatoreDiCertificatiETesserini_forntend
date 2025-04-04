import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentStatus = await authService.userPromise();
  if (currentStatus !== null) {
    return true;
  } else {
    return router.navigate(['/home']);
  }
};
