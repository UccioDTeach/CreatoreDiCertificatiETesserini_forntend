// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, map, switchMap, of, take, lastValueFrom } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Prendi lo stato corrente dal BehaviorSubject
  const currentStatus = await authService.userPromise();
  if (currentStatus !== null) {
    return true;
  } else {
    return router.navigate(['/login']);
  }
};
