import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import UtenteRegistrato from '../../config/utenteRegistrato.model';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-auth',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIcon,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  registerForm: FormGroup;
  loginForm: FormGroup;
  submitted = false;
  loginError: string | null = null;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get fLogin() {
    return this.loginForm.controls;
  }
  get fRegister() {
    return this.registerForm.controls;
  }

  onSubmitLogin(): void {
    this.submitted = true;
    this.loginError = null;
    if (this.loginForm.invalid) {
      return;
    }
    const userData = this.loginForm.value;
    this.authService.login(userData).subscribe({
      next: (response) => {
        console.log('Login avvenuto con successo:', response);
        this.router.navigate(['/home']);
        Swal.fire({
          icon: 'success',
          title: 'Login effettuato!',
          showConfirmButton: false,
          timer: 1500,
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error('Errore durante il login:', err);
        this.submitted = false;
        let errorMessage =
          'Si è verificato un errore durante il login. Riprova più tardi.';
        if (err.status === 401) {
          errorMessage = 'Email o password non validi.';
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }
        this.loginError = errorMessage;
        Swal.fire('Errore di Login', errorMessage, 'error');
      },
    });
  }
  onSubmitRegister(): void {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }

    const userData = this.registerForm.value;

    this.authService.register(userData).subscribe({
      next: (response) => {
        Swal.fire(
          'Registrazione completata',
          'Il tuo account è stato creato con successo!',
          'success'
        );
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error("Errore durante il salvataggio dell'utente:", err);
        Swal.fire(
          'Errore',
          'Si è verificato un errore durante il salvataggio, un utente con questa email esiste già.',
          'error'
        );
      },
    });
  }
  goToRegistration() {
    this.router.navigate(['/register']);
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
