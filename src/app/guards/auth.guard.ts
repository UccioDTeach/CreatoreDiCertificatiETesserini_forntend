import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const currentUser = await authService.userPromise();
    if (currentUser !== null) {
      return true;
    } else {
      console.log('Auth guard: No authenticated user, redirecting to auth');
      return router.createUrlTree(['/auth']);
    }
  } catch (error) {
    console.error('Auth guard error:', error);
    return router.createUrlTree(['/auth']);
  }
};
