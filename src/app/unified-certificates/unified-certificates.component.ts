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
import dayjs from 'dayjs';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions, PageSize } from 'pdfmake/interfaces';
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
    this.dateAdapter.setLocale('it-IT');
  }

  ngOnInit(): void {
    this.loadUtenti();
    this.loadCertificatoTemplates();
  }

  loadUtenti(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.utentiList = data;
      },
      error: (err) => {
        console.error('Errore caricamento utenti:', err);
        Swal.fire(
          'Errore',
          'Errore durante il caricamento degli utenti.',
          'error'
        );
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
        Swal.fire(
          'Errore',
          'Errore durante il caricamento dei modelli.',
          'error'
        );
      },
    });
  }

  async fetchImageAsBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(`/public/${imageUrl}`);
      if (!response.ok) {
        throw new Error(
          `Impossibile caricare l'immagine: ${response.status} ${response.statusText}`
        );
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          console.log(
            'Immagine caricata come Base64 (inizio):',
            base64String.substring(0, 100)
          );
          resolve(base64String);
        };
        reader.onerror = (error) => {
          console.error('Errore FileReader:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error: any) {
      console.error(`Errore nel caricamento dell'immagine ${imageUrl}:`, error);
      Swal.fire(
        'Errore Immagine',
        `Impossibile caricare l'immagine di sfondo (${imageUrl}): ${error.message}`,
        'error'
      );
      return '';
    }
  }

  async generateUnifiedPDF(): Promise<void> {
    if (this.selectionForm.invalid) {
      Swal.fire(
        'Errore',
        'Selezionare sia un Utente che un Modello di Certificato.',
        'warning'
      );
      this.selectionForm.markAllAsTouched();
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

    let image_logoSfondo = '';
    try {
      console.log('Tentativo di caricamento immagine di sfondo...');
      image_logoSfondo = await this.fetchImageAsBase64('logo.png');
      if (!image_logoSfondo) {
        console.warn(
          'Immagine di sfondo non caricata o fetch fallito. Procedo senza sfondo.'
        );
      } else {
        console.log('Immagine di sfondo caricata con successo.');
      }
    } catch (error) {
      console.error(
        'Errore imprevisto durante recupero immagine per PDF:',
        error
      );
    }

    const name = selectedUser.name ?? 'N/D';
    const cognome = selectedUser.cognome ?? 'N/D';
    const codiceFiscale = selectedUser.codiceFiscale ?? 'N/D';
    const dataRilascioFormatted = this.formatDate(new Date());
    const pageSize: PageSize = 'A4';
    const pageWidth = 841.89;
    const pageHeight = 595.28;
    const pageMargin = 40;

    const documentDefinition: TDocumentDefinitions = {
      pageSize: pageSize,
      pageOrientation: 'landscape',
      pageMargins: [pageMargin, pageMargin, pageMargin, pageMargin],

      background: (currentPage: number, currentPageSize?: PageSize) => {
        const effectivePageWidth =
          typeof currentPageSize === 'object' && currentPageSize.width
            ? currentPageSize.width
            : pageWidth;
        const effectivePageHeight =
          typeof currentPageSize === 'object' && currentPageSize.height
            ? currentPageSize.height
            : pageHeight;

        const layers: any[] = [
          {
            canvas: [
              {
                type: 'rect',
                x: Number(pageMargin) / 2,
                y: Number(pageMargin) / 2,
                w: Number(effectivePageWidth) - Number(pageMargin),
                h: Number(effectivePageHeight) - Number(pageMargin),
                lineWidth: 1,
                lineColor: '#CCCCCC',
              },
            ],
          },
        ];

        if (image_logoSfondo) {
          layers.push({
            image: image_logoSfondo,
            width: 498 * 0.7,
            height: 501 * 0.7,
            alignment: 'center',
            margin: [
              0,
              (Number(effectivePageHeight) - 501 * 0.7) / 2 -
                Number(pageMargin),
            ],
            opacity: 0.08,
          });
        }
        return layers as any[];
      },

      footer: {
        columns: [
          {
            text: `Certificato N° ___________${new Date().getFullYear()}`,
            alignment: 'right',
            fontSize: 9,
            italics: true,
            margin: [0, 0, pageMargin, 10],
          },
        ],
      },

      content: [
        {
          text: selectedTemplate.titolo || `Verificato l'apprendimeto,`,
          style: 'mainTitle',
          alignment: 'center',
          margin: [0, 20, 0, 20],
        },
        {
          text: selectedTemplate.siAttestaChe || 'Si attesta che,',
          style: 'attestation',
          alignment: 'center',
          margin: [0, 0, 0, 15],
        },
        {
          text: `${name.toUpperCase()} ${cognome.toUpperCase()}`,
          style: 'userName',
          alignment: 'center',
          margin: [0, 0, 0, 5],
        },
        {
          text: `CF (${codiceFiscale.toUpperCase()})`,
          style: 'cf',
          alignment: 'center',
          margin: [0, 0, 0, 25],
        },
        {
          text: selectedTemplate.sottotitolo || 'ha superato il corso',
          style: 'courseDetails',
          alignment: 'center',
        },
        {
          text: selectedTemplate.sottotitolo2 || '',
          style: 'courseDetails',
          alignment: 'center',
          margin: [0, 0, 0, 5],
        },
        {
          text: selectedTemplate.tipoCertificato || '',
          style: 'legalReference',
          alignment: 'center',
          margin: [0, 0, 0, 35],
        },
        {
          columns: [
            {
              text: `Data rilascio ${dataRilascioFormatted}`,
              style: 'dateText',
              alignment: 'left',
            },
          ],
          margin: [0, 0, 0, 45],
        },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                {
                  text: selectedTemplate.carica1 || 'Direttore del Corso',
                  style: 'signatureTitle',
                  alignment: 'center',
                },
                {
                  text: selectedTemplate.carica2 || 'IL PRESIDE',
                  style: 'signatureTitle',
                  alignment: 'center',
                },
                {
                  text: selectedTemplate.carica3 || 'Istruttore',
                  style: 'signatureTitle',
                  alignment: 'center',
                },
              ],
              [
                {
                  border: [false, true, false, false],
                  text: ' ',
                  margin: [20, 20, 20, 2],
                  borderColor: ['#AAAAAA', '#AAAAAA', '#AAAAAA', '#AAAAAA'],
                },
                {
                  border: [false, true, false, false],
                  text: ' ',
                  margin: [20, 20, 20, 2],
                  borderColor: ['#AAAAAA', '#AAAAAA', '#AAAAAA', '#AAAAAA'],
                },
                {
                  border: [false, true, false, false],
                  text: ' ',
                  margin: [20, 20, 20, 2],
                  borderColor: ['#AAAAAA', '#AAAAAA', '#AAAAAA', '#AAAAAA'],
                },
              ],
              [
                {
                  text: '(Firma Direttore)',
                  style: 'signatureName',
                  alignment: 'center',
                },
                {
                  text: '(Firma Preside)',
                  style: 'signatureName',
                  alignment: 'center',
                },
                {
                  text: '(Firma Istruttore)',
                  style: 'signatureName',
                  alignment: 'center',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
      ],
      styles: {
        mainTitle: { fontSize: 24, bold: true },
        attestation: { fontSize: 16, italics: true },
        userName: { fontSize: 20, bold: true },
        cf: { fontSize: 16 },
        courseDetails: { fontSize: 14, bold: true },
        legalReference: { fontSize: 10, italics: true },
        dateText: { fontSize: 12, bold: true },
        signatureTitle: {
          fontSize: 14,
          bold: true,
          color: '#000000',
          margin: [0, 0, 0, 5],
        },
        signatureName: {
          fontSize: 11,
          italics: true,
          color: '#555555',
          margin: [0, 2, 0, 0],
        },
      },
    };

    try {
      pdfMake
        .createPdf(documentDefinition)
        .download(
          `Certificato_${
            selectedTemplate.tipoCertificato || ''
          }_${name}_${cognome}.pdf`
        );
    } catch (error) {
      console.error('Errore durante la generazione del PDF:', error);
      Swal.fire(
        'Errore PDF',
        'Impossibile generare il documento PDF.',
        'error'
      );
    }
  }

  formatDate(dateString: string | Date | undefined): string {
    if (!dateString) {
      return 'N/D';
    }
    try {
      return this.datePipe.transform(dateString, 'dd/MM/yyyy') || 'N/D';
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return 'Data non valida';
    }
  }
}
