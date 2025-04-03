import { Routes } from '@angular/router';
import { FormComponent } from './form/form.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'form', component: FormComponent },
];
