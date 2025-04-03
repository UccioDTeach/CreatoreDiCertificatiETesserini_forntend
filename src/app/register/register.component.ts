import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UtenteRegistratoSerivce } from '../service/utente.service';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  loginForm: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private routes: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  goToLogin() {
    this.routes.navigate(['/login']);
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    const userData = this.loginForm.value;
    console.log('Dati inviati:', userData);

    this.authService.register(userData).subscribe({
      next: (response) => {
        Swal.fire(
          'Registrazione completata',
          'Il tuo account è stato creato con successo!',
          'success'
        );
        this.routes.navigate(['/home']);
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
}
