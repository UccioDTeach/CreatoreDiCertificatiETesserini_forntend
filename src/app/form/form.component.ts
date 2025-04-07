import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  MatOption,
} from '@angular/material/core';
import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import dayjs from 'dayjs';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { DateAdapter } from '@angular/material/core';
import { MatSort } from '@angular/material/sort';
import Utente from '../../config/utente.model';
import Swal from 'sweetalert2';
import { UserService } from '../service/user.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltip } from '@angular/material/tooltip';
import { AuthService } from '../service/auth.service';
declare var bootstrap: any;

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
  selector: 'app-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIcon,
    HttpClientModule,
    MatOption,
    MatSelectModule,
    MatExpansionModule,
    MatTooltip,
  ],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    [DatePipe],
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: MAT_DATE_FORMATS, useValue: IT_DATE_FORMATS },
  ],
})
export class FormComponent {
  istruttoreCardNome: string = '';
  nomeIstruttore: string = '';
  nomeDirettore: string = ' ';
  dataSource: MatTableDataSource<Utente>;
  savedData: any[] = [];
  displayedColumns: string[] = [
    'id',
    'name',
    'cognome',
    'NumeroCertificazione',
    'email',
    'actions',
  ];
  form: FormGroup;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<FormGroup>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  authService = inject(AuthService);
  user = this.authService.user.asReadonly();
  isEditMode: boolean = false; // Added to track edit mode

  constructor(
    private dateAdapter: DateAdapter<Date>,
    private http: HttpClient,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.dataSource = new MatTableDataSource(this.savedData);

    this.form = this.fb.group({
      id: [undefined],
      name: [undefined, Validators.required],
      cognome: [undefined, Validators.required],
      dataNascita: [Date, Validators.required],
      codiceFiscale: [undefined, Validators.required],
      email: [undefined, [Validators.required, Validators.email]],
      dataRilascio: [Date, Validators.required],
      validita: [Date, Validators.required],
      direttore: [undefined, Validators.required],
      istruttore: [undefined, Validators.required],
      codiceCertificato: [undefined, Validators.required],
      createdBy: [undefined],
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.sort.active = 'id';
    this.sort.direction = 'desc';
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const tokens = filter.split(' ');
      return tokens.every((token) => {
        const dataStr = JSON.stringify(data).toLowerCase();
        return dataStr.includes(token.toLowerCase());
      });
    };
  }

  ngOnInit(): void {
    this.loadUsers();
    this.dateAdapter.setLocale('it-IT');
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.savedData = data;
        this.dataSource.data = this.savedData;
      },
      error: (err) => {
        console.error('Errore durante il caricamento degli utenti:', err);
      },
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const userData = this.form.value;
      userData.createdBy = this.user();
console.log(userData);
      if (this.isEditMode) {
        this.userService.updateUser(userData.id, userData).subscribe({
          next: () => {
            this.loadUsers();
            this.resetForm();
            Swal.fire(
              'Aggiornato',
              'Utente aggiornato con successo!',
              'success'
            );
          },
          error: (err) => {
            console.error("Errore durante l'aggiornamento dell'utente:", err);
            Swal.fire(
              'Errore',
              "Si è verificato un errore durante l'aggiornamento dell'utente.",
              'error'
            );
          },
        });
      } else {
        this.userService.addUser(userData).subscribe({
          next: () => {
            this.loadUsers();
            this.resetForm();
            Swal.fire('Salvato', 'Utente salvato con successo!', 'success');
          },
          error: (err) => {
            console.error("Errore durante il salvataggio dell'utente:", err);
            Swal.fire(
              'Errore',
              'Si è verificato un errore durante il salvataggio o un utente con questo codice fiscale esiste già.',
              'error'
            );
          },
        });
      }
    }
  }

  // Added editUser method
  editUser(user: Utente): void {
    this.isEditMode = true;
    this.populateForm(user);
  }

  // Added resetForm method
  resetForm(): void {
    this.isEditMode = false;
    this.form.reset();
  }

  // Existing methods remain unchanged until populateForm...

  populateForm(element: Utente): void {
    this.form.patchValue({
      id: element.id,
      name: element.name,
      cognome: element.cognome,
      dataNascita: new Date(element.dataNascita),
      codiceFiscale: element.codiceFiscale,
      email: element.email,
      dataRilascio: new Date(element.dataRilascio),
      validita: new Date(element.validita),
      direttore: element.direttore,
      istruttore: element.istruttore,
      codiceCertificato: element.codiceCertificato,
      createdBy: element.createdBy,
    });
  }

  // Rest of the existing methods remain unchanged...
  formatDate(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');

    if (input.value.length >= 2 && input.value.length <= 4) {
      input.value = input.value.replace(/(\d{2})(\d{0,2})/, '$1/$2');
    } else if (input.value.length > 4 && input.value.length <= 8) {
      input.value = input.value.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
    }
  }

  formatPaste(event: ClipboardEvent): void {
    const input = event.target as HTMLInputElement;
    const pastedData = event.clipboardData?.getData('text') || '';
    const cleanData = pastedData.replace(/[^0-9]/g, '');
    input.value = cleanData;
    this.formatDate({ target: input });
  }

  saveToFile() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        let csvContent =
          'Nome;Cognome;Data di nascita;Codice fiscale;Email;Data Rilascio;Validità;Direttore del corso;Istruttore;Codice Certificato\n';
        data.forEach((row: any) => {
          let rowData = [
            `"${row.name}"`,
            `"${row.cognome}"`,
            `"${this.formatDateForCSV(row.dataNascita)}"`,
            `"${row.codiceFiscale}"`,
            `"${row.email}"`,
            `"${this.formatDateForCSV(row.dataRilascio)}"`,
            `"${this.formatDateForCSV(row.validita)}"`,
            `"${row.direttore}"`,
            `"${row.istruttore}"`,
            `"${row.codiceCertificato}"`,
          ].join(';');
          csvContent += rowData + '\n';
        });

        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dati_salvati.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Errore durante il caricamento degli utenti:', err);
      },
    });
  }

  formatDateForCSV(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')} /${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()} `;
  }

  deleteData(data: Utente): void {
    Swal.fire({
      title: 'Sei sicuro?',
      text: 'Una volta eliminato, non sarà più possibile recuperare i dati di questo utente!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Elimina!',
      cancelButtonText: 'Annulla',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(data.id).subscribe({
          next: () => {
            this.loadUsers();
            Swal.fire('Eliminato!', 'Il dato è stato eliminato.', 'success');
          },
          error: (err) => {
            console.error("Errore durante l'eliminazione dell'utente:", err);
            Swal.fire(
              'Errore',
              "Si è verificato un errore durante l'eliminazione dell'utente.",
              'error'
            );
          },
        });
      } else {
        Swal.fire('Annullato', "L'eliminazione è stata annullata.", 'info');
      }
    });
  }

  openDetailModal(element: Utente) {
    const formattedDateNascita = this.datePipe.transform(
      element.dataNascita,
      'dd/MM/yyyy'
    );
    const formattedDateRilascio = this.datePipe.transform(
      element.dataRilascio,
      'dd/MM/yyyy'
    );
    const formattedDateValidita = this.datePipe.transform(
      element.validita,
      'dd/MM/yyyy'
    );
    document.getElementById('modal-name')!.textContent = element.name;
    document.getElementById('modal-cognome')!.textContent = element.cognome;
    document.getElementById('modal-email')!.textContent = element.email;
    document.getElementById('modal-birthdate')!.textContent =
      formattedDateNascita;
    document.getElementById('modal-rilascio')!.textContent =
      formattedDateRilascio;
    document.getElementById('modal-validita')!.textContent =
      formattedDateValidita;
    document.getElementById('modal-cf')!.textContent = element.codiceFiscale;
    document.getElementById('modal-direttore')!.textContent = element.direttore;
    document.getElementById('modal-istruttore')!.textContent =
      element.istruttore;
    document.getElementById('modal-codiceCertificato')!.textContent =
      element.codiceCertificato;
    const modal = new bootstrap.Modal(document.getElementById('detailModal')!);
    modal.show();
  }

  async fileToBase64(file: File): Promise<string> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () =>
        reject(new Error('Errore nella conversione del file'));
      reader.readAsDataURL(file);
    });
  }

  async fetchImageAsBase64(filename: string): Promise<string> {
    try {
      const filePath = `public/${filename}`;
      const response = await this.http
        .get(filePath, { responseType: 'blob' })
        .toPromise();

      if (!response) throw new Error('Immagine non disponibile');

      return await this.fileToBase64(
        new File([response], filename, { type: response.type })
      );
    } catch (error) {
      console.error("Errore nel recupero dell'immagine:", error);
      return '';
    }
  }
  onDataRilascioChange(event: MatDatepickerInputEvent<Date>): void {
    const rilascioDate = event.value;
    const validitaDate = new Date(rilascioDate!);
    validitaDate.setFullYear(validitaDate.getFullYear() + 2);
    this.form.controls['validita'].setValue(validitaDate);
  }

  search(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
    this.table.renderRows();
  }

  async decidiDirettoreNome() {
    switch (this.form.value.direttore) {
      case 'Rocca':
        return (this.nomeDirettore = 'Francesca Rocca');
      case 'Faini':
        return (this.nomeDirettore = 'Daniele Faini');
      case 'Picone':
        return (this.nomeDirettore = 'Donato Picone');
    }
    return '';
  }

  async decidiIstruttoreNome() {
    switch (this.form.value.istruttore) {
      case 'Rocca':
        return (this.nomeIstruttore = 'Francesca Rocca');
      case 'Faini':
        return (this.nomeIstruttore = 'Daniele Faini');
      case 'Picone':
        return (this.nomeIstruttore = 'Donato Picone');
    }
    return '';
  }

  async generatePdf() {
    this.decidiDirettoreNome();
    this.decidiIstruttoreNome();
    const image_logoSfondo = await this.fetchImageAsBase64('logo.png');
    const documentDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      background: [
        {
          image: image_logoSfondo as string,
          width: 498 * 0.7,
          height: 501 * 0.7,
          alignment: 'center',
          margin: [0, (595.28 - 501 * 0.7) / 2],
          opacity: 0.1,
        },
      ],
      content: [
        {
          text: "Verificato l'apprendimeto,",
          alignment: 'center',
          bold: true,
          fontSize: 20,
        },
        '\n',
        {
          text: 'Si attesta che,',
          alignment: 'center',
          bold: true,
          fontSize: 16,
        },
        '\n',
        {
          text:
            this.form.value.name.toUpperCase() +
            ' ' +
            this.form.value.cognome.toUpperCase(),
          alignment: 'center',
          fontSize: 20,
          bold: true,
        },
        '\n',
        {
          text: 'CF ' + '(' + this.form.value.codiceFiscale.toUpperCase() + ')',
          alignment: 'center',
          fontSize: 16,
        },
        '\n',
        {
          text: 'ha superato il corso di lingue Inglese',
          alignment: 'center',
          fontSize: 14,
          bold: true,
        },
        '\n',
        {
          text: "nell'istituto di formazione Centro Studio Internazionale Lenguages",
          alignment: 'center',
          fontSize: 14,
          bold: true,
        },
        {
          text: 'con esame eseguito ai sensi della legge 4/2013',
          alignment: 'center',
          fontSize: 10,
          bold: true,
        },
        '\n',
        {
          text:
            'Data rilascio ' +
            dayjs(this.form.value.dataRilascio).format('DD/MM/YYYY'),
          alignment: 'left',
          bold: true,
        },
        {
          text:
            'Validità ' + dayjs(this.form.value.validita).format('DD/MM/YYYY'),
          alignment: 'right',
          bold: true,
        },
        '\n',
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                {
                  stack: [
                    {
                      text: 'Direttore del Corso',
                      alignment: 'center',
                      color: '#fb2424',
                      bold: true,
                      fontSiz: 14,
                    },
                    {
                      text: this.nomeDirettore,
                      alignment: 'center',
                      bold: true,
                    },
                  ],
                  alignment: 'center',
                },
                {
                  stack: [
                    {
                      text: 'IL PRESIDE',
                      alignment: 'center',
                      color: '#fb2424',
                      bold: true,
                      fontSiz: 14,
                    },
                    {
                      text: 'Tommaso Rello',
                      alignment: 'center',
                      bold: true,
                    },
                  ],
                  alignment: 'center',
                },
                {
                  stack: [
                    {
                      text: 'Istruttore',
                      alignment: 'center',
                      color: '#fb2424',
                      bold: true,
                      fontSiz: 14,
                    },
                    {
                      text: this.nomeIstruttore,
                      alignment: 'center',
                      bold: true,
                    },
                  ],
                  alignment: 'center',
                },
              ],
            ],
          },
          layout: 'noBorders',
        },
        '\n \n \n ',
        '\n \n \n ',
        '\n \n \n ',
        '\n \n  ',
        {
          text:
            'Brevetto N° ' +
            'n.BLSD_' +
            dayjs(this.form.value.dataRilascio).year() +
            '_' +
            this.form.value.codiceCertificato,
          fontSize: 10,
          alignment: 'right',
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          marginBottom: 15,
        },
      },
    };

    pdfMake
      .createPdf(documentDefinition)
      .download(
        'Certificato di ' +
          this.form.value.name +
          '_' +
          this.form.value.cognome +
          '.pdf'
      );
  }
}
