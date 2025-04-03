import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// Rimuovi UtenteRegistratoSerivce se non serve specificamente qui per il login
// import { UtenteRegistratoSerivce } from '../service/utente.service';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
// Rimuovi LoginService se AuthService gestisce la chiamata API di login
// import { LoginService } from '../service/login.service';
import { AuthService } from '../service/auth.service';
import { HttpErrorResponse } from '@angular/common/http'; // <-- Importa per tipizzare l'errore

@Component({
  selector: 'app-login',
  standalone: true, // Assumendo che sia standalone basato sull'imports originale
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    // Aggiungi CommonModule se usi *ngIf etc. nel template
    // import { CommonModule } from '@angular/common';
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'], // Nota: styleUrls (plurale) è più comune
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  loginError: string | null = null; // Per mostrare errori nel template (opzionale)

  constructor(
    private fb: FormBuilder,
    // private loginService: LoginService, // Inietta AuthService invece se gestisce la chiamata
    private authService: AuthService, // <-- Inietta AuthService
    private router: Router // Router è ancora necessario se la navigazione non è dentro AuthService.login
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.loginError = null; // Resetta l'errore a ogni tentativo
    if (this.loginForm.invalid) {
      return;
    }

    const userData = this.loginForm.value;
    console.log('Tentativo di login con:', userData);

    // Usa il metodo login dell'AuthService
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
        // Tipizza l'errore
        console.error('Errore durante il login:', err);
        this.submitted = false; // Permetti nuovi tentativi

        // Estrai un messaggio di errore più significativo
        let errorMessage =
          'Si è verificato un errore durante il login. Riprova più tardi.';
        if (err.status === 401) {
          // 401 Unauthorized è comune per credenziali errate
          errorMessage = 'Email o password non validi.';
        } else if (err.error && err.error.message) {
          // Se il backend manda un messaggio specifico nel corpo dell'errore
          errorMessage = err.error.message;
        }

        this.loginError = errorMessage; // Per mostrarlo nel template (opzionale)

        Swal.fire(
          'Errore di Login',
          errorMessage, // Usa il messaggio più specifico
          'error'
        );
        // AuthService.login dovrebbe già aver gestito lo stato (mantenendolo a false)
      },
    });
  }

  goToRegistration() {
    this.router.navigate(['/register']);
  }
}
