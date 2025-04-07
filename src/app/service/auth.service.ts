// src/app/services/auth.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import Utente from '../../config/utente.model';
import UtenteRegistrato from '../../config/utenteRegistrato.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userPromise(): Promise<UtenteRegistrato | null> {
    return new Promise((resolve) => {
      if (this.user() === null) {
        this.me().subscribe({
          next: (user) => {
            if (user) {
              this.user.set(user);
              resolve(user);
            } else {
              resolve(null);
            }
          },
          error: (error) => {
            console.error('Auth promise error:', error);
            this.user.set(null);
            resolve(null);
          },
        });
      } else {
        resolve(this.user());
      }
    });
  }
  private url = 'http://localhost:3000/auth';

  http = inject(HttpClient);

  user = signal<UtenteRegistrato | null>(null);

  register(user: UtenteRegistrato) {
    return this.http
      .post<UtenteRegistrato>(`${this.url}/register`, user, {
        withCredentials: true,
      })
      .pipe(
        tap((response: UtenteRegistrato) => {
          this.user.set(response);
        }),
        catchError((error) => {
          this.user.set(null);
          return throwError(() => error);
        })
      );
  }

  login(user: UtenteRegistrato) {
    return this.http
      .post<UtenteRegistrato>(`${this.url}/login`, user, {
        withCredentials: true,
      })
      .pipe(
        tap((response: UtenteRegistrato) => {
          this.user.set(response);
        }),
        catchError((error) => {
          this.user.set(null);
          return throwError(() => error);
        })
      );
  }

  logout() {
    return this.http
      .post<UtenteRegistrato>(
        `${this.url}/logout`,
        {},
        { withCredentials: true }
      )
      .subscribe(() => {
        window.location.reload();
      });
  }

  me() {
    return this.http
      .get<UtenteRegistrato>(`${this.url}/me`, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .pipe(
        tap((response: UtenteRegistrato) => {
          if (response) {
            this.user.set(response);
          } else {
            this.user.set(null);
          }
        }),
        catchError((error) => {
          console.error('Auth error:', error);
          this.user.set(null);
          return throwError(() => error);
        })
      );
  }
}
