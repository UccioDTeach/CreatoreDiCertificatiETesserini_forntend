import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DatePipe } from '@angular/common';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: { dateInput: 'DD/MM/YYYY' },
        display: {
          dateInput: 'DD/MM/YYYY',
          monthYearLabel: 'MM/YYYY',
          dateA11yLabel: 'DD/MM/YYYY',
          monthYearA11yLabel: 'MM/YYYY',
        },
      },
    },
  ],
};
