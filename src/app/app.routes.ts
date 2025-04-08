import { Routes } from '@angular/router';
import { FormComponent } from './form/form.component';
import { HomeComponent } from './home/home.component';
import { authGuard } from './guards/auth.guard';
import { AuthComponent } from './auth/auth.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CertficatiComponent } from './certficati/certficati.component';
import { UnifiedCertificatesComponent } from './unified-certificates/unified-certificates.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { 
    path: 'form', 
    component: FormComponent, 
    canActivate: [authGuard] 
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'certificati', 
    component: CertficatiComponent, 
    canActivate: [authGuard]
  },
  {
    path: 'unified-certificates',
    component: UnifiedCertificatesComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'home' }
];
  