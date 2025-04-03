import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormComponent } from './form/form.component';
import { HomeComponent } from './home/home.component';
import { RouterOutlet } from '@angular/router';
// Format personalizzato per le date italiane
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatButtonModule,
    MatToolbarModule,
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_LOCALE, useValue: 'it' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class AppComponent {
  title = 'CreatoreDiCertificatiETesserini';

  constructor(private dateAdapter: DateAdapter<any>) {
    this.dateAdapter.setLocale('it'); // Imposta la localizzazione per il calendario
  }

  ngOnInit() {}
}
