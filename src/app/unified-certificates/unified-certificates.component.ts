import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  MatOptionModule,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import Swal from 'sweetalert2';
import Certificato from '../../config/certificato.model';
import Utente from '../../config/utente.model';
import { AuthService } from '../service/auth.service';
import { CertService } from '../service/cert.service';
import { UserService } from '../service/user.service';

(pdfMake as any).vfs = pdfFonts.vfs;

export const IT_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-unified-certificates',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './unified-certificates.component.html',
  styleUrls: ['./unified-certificates.component.scss'],
  providers: [
    [DatePipe],
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: MAT_DATE_FORMATS, useValue: IT_DATE_FORMATS },
  ],
})
export class UnifiedCertificatesComponent implements OnInit {
  selectionForm: FormGroup;
  utentiList: Utente[] = [];
  certificatoTemplates: Certificato[] = [];

  authService = inject(AuthService);
  user = this.authService.user.asReadonly();

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private userService: UserService,
    private certService: CertService,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.selectionForm = this.fb.group({
      selectedUserId: [null, Validators.required],
      selectedTemplateId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUtenti();
    this.loadCertificatoTemplates();
    this.dateAdapter.setLocale('it-IT');
  }

  loadUtenti(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.utentiList = data;
      },
      error: (err) => {
        console.error('Errore caricamento utenti:', err);
        Swal.fire('Errore', 'Errore utenti.', 'error');
      },
    });
  }

  loadCertificatoTemplates(): void {
    this.certService.getCertificati().subscribe({
      next: (data) => {
        this.certificatoTemplates = data;
      },
      error: (err) => {
        console.error('Errore caricamento modelli:', err);
        Swal.fire('Errore', 'Errore modelli.', 'error');
      },
    });
  }

  generateUnifiedPDF(): void {
    if (this.selectionForm.invalid) {
      Swal.fire(
        'Errore',
        'Selezionare sia un Utente che un Modello di Certificato.',
        'warning'
      );
      return;
    }

    const selectedUserId = this.selectionForm.value.selectedUserId;
    const selectedTemplateId = this.selectionForm.value.selectedTemplateId;

    const selectedUser = this.utentiList.find((u) => u.id === selectedUserId);
    const selectedTemplate = this.certificatoTemplates.find(
      (t) => t.id === selectedTemplateId
    );

    if (!selectedUser || !selectedTemplate) {
      Swal.fire('Errore', 'Utente o Modello selezionato non trovato.', 'error');
      return;
    }

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: selectedTemplate.titolo || 'CERTIFICATO', style: 'header' },
        {
          text: `${selectedTemplate.tipoCertificato}`,
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },
        { text: '\n' },
        {
          text: selectedTemplate.siAttestaChe || 'Si attesta che:',
          style: 'subheader',
        },
        {
          text: `${selectedUser.name} ${selectedUser.cognome}`,
          style: 'userName',
        },
        {
          text: `Nato/a il: ${this.formatDate(selectedUser.dataNascita)}`,
          style: 'normal',
        },
        {
          text: `Codice Fiscale: ${selectedUser.codiceFiscale}`,
          style: 'normal',
        },
        { text: `Email: ${selectedUser.email}`, style: 'normal' },
        { text: '\n' },
        {
          text: `Ha completato il corso/attività presso ${
            selectedTemplate.luogoFormazione || ''
          }`,
          style: 'normal',
        },
        { text: `${selectedTemplate.sottotitolo || ''}`, style: 'normal' },
        { text: `${selectedTemplate.sottotitolo2 || ''}`, style: 'normal' },
        { text: '\n' },
        {
          text: `Data Rilascio Utente: ${this.formatDate(
            selectedUser.dataRilascio
          )}`,
          style: 'normal',
        },
        {
          text: `Validità Utente: ${this.formatDate(selectedUser.validita)}`,
          style: 'normal',
        },
        { text: '\n' },
        { text: 'Firme:', style: 'subheader' },
        { text: `Direttore: ${selectedUser.direttore || ''}`, style: 'normal' },
        {
          text: `Istruttore: ${selectedUser.istruttore || ''}`,
          style: 'normal',
        },
        {
          text: `Carica 1 (Modello): ${selectedTemplate.carica1 || ''}`,
          style: 'normal',
        },
        {
          text: `Carica 2 (Modello): ${selectedTemplate.carica2 || ''}`,
          style: 'normal',
        },
        {
          text: `Carica 3 (Modello): ${selectedTemplate.carica3 || ''}`,
          style: 'normal',
        },
        {
          text: `\nCodice Certificato (Utente): ${
            selectedUser.codiceCertificato || ''
          }`,
          style: 'small',
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 5],
        },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        userName: {
          fontSize: 16,
          bold: true,
          alignment: 'center',
          margin: [0, 5, 0, 10],
        },
        normal: { fontSize: 12, margin: [0, 2, 0, 2] },
        small: { fontSize: 10, italics: true, margin: [0, 5, 0, 0] },
      },
    };

    // const docDefinition: TDocumentDefinitions = {
    //   content: [
    //     { text: selectedTemplate.titolo || 'CERTIFICATO', style: 'header' },
    //     {
    //       text: `${selectedTemplate.tipoCertificato}`,
    //       alignment: 'center',
    //       margin: [0, 0, 0, 10],
    //     },
    //     { text: '\n' },
    //     {
    //       text: selectedTemplate.siAttestaChe || 'Si attesta che:',
    //       style: 'subheader',
    //     },
    //     {
    //       text: `${selectedUser.name} ${selectedUser.cognome}`,
    //       style: 'userName',
    //     },
    //     {
    //       text: `Nato/a il: ${this.formatDate(selectedUser.dataNascita)}`,
    //       style: 'normal',
    //     },
    //     {
    //       text: `Codice Fiscale: ${selectedUser.codiceFiscale}`,
    //       style: 'normal',
    //     },
    //     { text: `Email: ${selectedUser.email}`, style: 'normal' },
    //     { text: '\n' },
    //     {
    //       text: `Ha completato il corso/attività presso ${
    //         selectedTemplate.luogoFormazione || ''
    //       }`,
    //       style: 'normal',
    //     },
    //     { text: `${selectedTemplate.sottotitolo || ''}`, style: 'normal' },
    //     { text: `${selectedTemplate.sottotitolo2 || ''}`, style: 'normal' },
    //     { text: '\n' },
    //     {
    //       text: `Data Rilascio Utente: ${this.formatDate(
    //         selectedUser.dataRilascio
    //       )}`,
    //       style: 'normal',
    //     },
    //     {
    //       text: `Validità Utente: ${this.formatDate(selectedUser.validita)}`,
    //       style: 'normal',
    //     },
    //     { text: '\n' },
    //     { text: 'Firme:', style: 'subheader' },
    //     { text: `Direttore: ${selectedUser.direttore || ''}`, style: 'normal' },
    //     {
    //       text: `Istruttore: ${selectedUser.istruttore || ''}`,
    //       style: 'normal',
    //     },
    //     {
    //       text: `Carica 1 (Modello): ${selectedTemplate.carica1 || ''}`,
    //       style: 'normal',
    //     },
    //     {
    //       text: `Carica 2 (Modello): ${selectedTemplate.carica2 || ''}`,
    //       style: 'normal',
    //     },
    //     {
    //       text: `Carica 3 (Modello): ${selectedTemplate.carica3 || ''}`,
    //       style: 'normal',
    //     },
    //     {
    //       text: `\nCodice Certificato (Utente): ${
    //         selectedUser.codiceCertificato || ''
    //       }`,
    //       style: 'small',
    //     },
    //   ],
    //   styles: {
    //     header: {
    //       fontSize: 18,
    //       bold: true,
    //       alignment: 'center',
    //       margin: [0, 0, 0, 5],
    //     },
    //     subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
    //     userName: {
    //       fontSize: 16,
    //       bold: true,
    //       alignment: 'center',
    //       margin: [0, 5, 0, 10],
    //     },
    //     normal: { fontSize: 12, margin: [0, 2, 0, 2] },
    //     small: { fontSize: 10, italics: true, margin: [0, 5, 0, 0] },
    //   },
    // };

    pdfMake
      .createPdf(docDefinition)
      .download(
        `Certificato_${selectedUser.cognome}_${selectedUser.name}_${selectedTemplate.tipoCertificato}.pdf`
      );
  }

  formatDate(dateString: string | Date | undefined): string {
    if (!dateString) return 'N/A';
    try {
      const date =
        typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) {
        return 'Data non valida';
      }
      return this.datePipe.transform(date, 'dd/MM/yyyy') || 'N/A';
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return 'Errore data';
    }
  }
}
