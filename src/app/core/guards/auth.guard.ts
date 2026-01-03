import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

export const authGuard: CanActivateFn = () => {
  const firebaseService = inject(FirebaseService);
  const router = inject(Router);
  
  if (firebaseService.isAuthenticated()) {
    return true;
  }
  
  return router.createUrlTree(['/auth/login']);
};