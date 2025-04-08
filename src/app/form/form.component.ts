import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  Component,
  inject,
  ViewChild,
  ViewEncapsulation,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
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
  MatOptionModule,
} from '@angular/material/core';
import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../service/auth.service';
import UtenteRegistrato from '../../config/utenteRegistrato.model';
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
    MatIconModule,
    HttpClientModule,
    MatOptionModule,
    MatSelectModule,
    MatExpansionModule,
    MatTooltipModule,
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
export class FormComponent implements OnInit {
  fb = inject(FormBuilder);
  istruttoreCardNome: string = '';
  nomeIstruttore: string = '';
  nomeDirettore: string = ' ';
  dataSource: MatTableDataSource<Utente>;
  savedData: any[] = [];
  displayedColumns: string[] = [
    'id',
    'name',
    'cognome',
    'email',
    'dataNascita',
    'codiceFiscale',
    'dataRilascio',
    'validita',
    'direttore',
    'istruttore',
    'codiceCertificato',
    'actions',
  ];
  form = this.fb.group({
    id: new FormControl<number | undefined>(undefined),
    name: new FormControl<string | null>(null, Validators.required),
    cognome: new FormControl<string | null>(null, Validators.required),
    dataNascita: new FormControl<Date | null>(null, Validators.required),
    codiceFiscale: new FormControl<string | null>(null, Validators.required),
    email: new FormControl<string | null>(null, [Validators.email]),
    dataRilascio: new FormControl<Date | null>(null, Validators.required),
    validita: new FormControl<Date | null>(null),
    direttore: new FormControl<string | null>(null, Validators.required),
    istruttore: new FormControl<string | null>(null, Validators.required),
    codiceCertificato: new FormControl<string | null>(
      null,
      Validators.required
    ),
    createdBy: new FormControl<UtenteRegistrato | null>(null),
    voto: new FormControl<string | null>(null),
  });
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<Utente>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  authService = inject(AuthService);
  user = this.authService.user.asReadonly();
  isEditMode: boolean = false;

  constructor(
    private dateAdapter: DateAdapter<Date>,
    private http: HttpClient,
    private datePipe: DatePipe,
    private userService: UserService
  ) {
    this.dataSource = new MatTableDataSource<Utente>(this.savedData);
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
      setTimeout(() => {
        this.sort.sort({ id: 'id', start: 'desc', disableClear: false });
      });
    }
    this.dataSource.filterPredicate = (data: Utente, filter: string) => {
      const dataStr = (
        (data.id?.toString() ?? '') +
        (data.name ?? '') +
        (data.cognome ?? '') +
        (data.email ?? '') +
        (data.codiceCertificato ?? '') +
        (data.codiceFiscale ?? '') +
        (data.direttore ?? '') +
        (data.istruttore ?? '') +
        (data.dataNascita
          ? this.datePipe.transform(data.dataNascita, 'dd/MM/yyyy')
          : '') +
        (data.dataRilascio
          ? this.datePipe.transform(data.dataRilascio, 'dd/MM/yyyy')
          : '') +
        (data.validita
          ? this.datePipe.transform(data.validita, 'dd/MM/yyyy')
          : '')
      ).toLowerCase();
      const transformedFilter = filter.trim().toLowerCase();
      return dataStr.indexOf(transformedFilter) !== -1;
    };
  }

  ngOnInit(): void {
    this.loadUsers();
    this.dateAdapter.setLocale('it-IT');
    const style = document.createElement('style');
    style.innerHTML = `
      .cdk-overlay-container {
        z-index: 99999 !important;
      }
      .cdk-overlay-pane {
        z-index: 99999 !important;
      }
      .mat-mdc-select-panel {
        z-index: 99999 !important;
      }
    `;
    document.head.appendChild(style);
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.savedData = data;
        this.dataSource.data = this.savedData;
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
      },
      error: (err) => {
        console.error('Errore durante il caricamento degli utenti:', err);
        Swal.fire(
          'Errore',
          'Impossibile caricare i dati degli utenti.',
          'error'
        );
      },
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const rawUserData = this.form.getRawValue();
      const currentUser = this.user();

      const basePayload: Utente = {
        id: rawUserData.id ?? 0,
        name: rawUserData.name ?? '',
        cognome: rawUserData.cognome ?? '',
        dataNascita: rawUserData.dataNascita
          ? dayjs(rawUserData.dataNascita).format('YYYY-MM-DD')
          : '',
        codiceFiscale: rawUserData.codiceFiscale ?? '',
        email: rawUserData.email ?? '',
        dataRilascio: rawUserData.dataRilascio
          ? dayjs(rawUserData.dataRilascio).format('YYYY-MM-DD')
          : '',
        validita: rawUserData.validita
          ? dayjs(rawUserData.validita).format('YYYY-MM-DD')
          : '',
        direttore: rawUserData.direttore ?? '',
        istruttore: rawUserData.istruttore ?? '',
        codiceCertificato: rawUserData.codiceCertificato ?? '',
        createdBy: currentUser, // Keep full object initially
        voto: rawUserData.voto ?? '',
      };

      if (this.isEditMode) {
        const userId = rawUserData.id;
        if (userId === undefined || userId === null) {
          console.error('Update Error: User ID is missing or invalid.', userId);
          Swal.fire(
            'Errore',
            "ID utente non valido per l'aggiornamento.",
            'error'
          );
          return;
        }

        // Payload for update - ensure it matches Utente or expected backend DTO
        // Assuming updateUser expects the full Utente object
        const updatePayload: Utente = {
          ...basePayload,
          id: userId, // Set the correct ID for update
          // If backend expects createdById even for update, adjust here:
          // createdBy: null, // Remove object if sending ID
          // createdById: currentUser?.id ?? null // Add ID if needed
        };
        console.log('Payload for Update:', updatePayload);

        this.userService.updateUser(userId, updatePayload).subscribe({
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
            console.error('Update Error:', err);
            Swal.fire('Errore', "Errore durante l'aggiornamento.", 'error');
          },
        });
      } else {
        // Add User Logic
        // Validate creator user ID *before* preparing add payload
        if (!currentUser || typeof currentUser.id !== 'number') {
          console.error('Add Error: Invalid creator user or ID.', currentUser);
          Swal.fire(
            'Errore di Autenticazione',
            'Utente creatore non valido. Impossibile salvare.',
            'error'
          );
          return; // Stop submission
        }

        // Prepare payload specifically for addUser
        // Exclude Utente's 'createdBy' object and 'id', add 'createdById'
        const { createdBy, id, ...restOfBasePayload } = basePayload;
        const addPayload = {
          ...restOfBasePayload,
          createdById: currentUser.id, // Use the validated creator ID
        };

        console.log('Payload for Add:', addPayload); // Log the exact payload

        // Define expected type for addPayload if possible (e.g., UserCreationDto)
        // Using 'as any' if the exact DTO type isn't defined/imported yet
        this.userService.addUser(addPayload as any).subscribe({
          next: () => {
            this.loadUsers();
            this.resetForm();
            Swal.fire('Salvato', 'Utente salvato con successo!', 'success');
          },
          error: (err) => {
            console.error('Add User Error:', err); // Log the full error
            const errorDetail =
              err.error?.message || err.message || 'Errore sconosciuto';
            const displayMsg = `Salvataggio fallito: ${errorDetail}. Controlla i dati inseriti (es. Codice Fiscale duplicato) o l'utente loggato.`;
            Swal.fire('Errore Salvataggio', displayMsg, 'error');
          },
        });
      }
      this.closeFormModal();
    } else {
      this.form.markAllAsTouched();
      Swal.fire(
        'Attenzione',
        'Per favore, compila correttamente tutti i campi obbligatori.',
        'warning'
      );
    }
  }

  editUser(user: Utente): void {
    this.isEditMode = true;
    this.populateForm(user);
    this.openFormModal();
  }

  resetForm(): void {
    this.isEditMode = false;
    this.form.reset();
  }

  populateForm(element: Utente): void {
    this.form.patchValue({
      id: element.id,
      name: element.name ?? null,
      cognome: element.cognome ?? null,
      dataNascita: element.dataNascita ? new Date(element.dataNascita) : null,
      codiceFiscale: element.codiceFiscale ?? null,
      email: element.email ?? null,
      dataRilascio: element.dataRilascio
        ? new Date(element.dataRilascio)
        : null,
      validita: element.validita ? new Date(element.validita) : null,
      direttore: element.direttore ?? null,
      istruttore: element.istruttore ?? null,
      codiceCertificato: element.codiceCertificato ?? null,
      createdBy: element.createdBy ?? null,
    });
  }

  formatDate(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, '');

    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + '/' + value.substring(5, 9);
    }
    input.value = value.substring(0, 10);

    const controlName = input.getAttribute('formControlName');
    if (
      controlName === 'dataNascita' ||
      controlName === 'dataRilascio' ||
      controlName === 'validita'
    ) {
      const parts = value.split('/');
      if (
        parts.length === 3 &&
        parts[0].length === 2 &&
        parts[1].length === 2 &&
        parts[2].length === 4
      ) {
        const date = dayjs(value, 'DD/MM/YYYY');
        if (date.isValid()) {
          this.form.get(controlName)?.setValue(date.toDate());
        } else {
          this.form.get(controlName)?.setValue(null);
        }
      } else {
        this.form.get(controlName)?.setValue(null);
      }
    }
  }

  formatPaste(event: ClipboardEvent): void {
    event.preventDefault();
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
        data.forEach((row: Utente) => {
          let rowData = [
            `"${row.name ?? ''}"`,
            `"${row.cognome ?? ''}"`,
            `"${this.formatDateForCSV(row.dataNascita)}"`,
            `"${row.codiceFiscale ?? ''}"`,
            `"${row.email ?? ''}"`,
            `"${this.formatDateForCSV(row.dataRilascio)}"`,
            `"${this.formatDateForCSV(row.validita)}"`,
            `"${row.direttore ?? ''}"`,
            `"${row.istruttore ?? ''}"`,
            `"${row.codiceCertificato ?? ''}"`,
          ].join(';');
          csvContent += rowData + '\n';
        });

        const blob = new Blob(['\ufeff' + csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dati_salvati.csv';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error(
          'Errore durante il caricamento degli utenti per CSV:',
          err
        );
        Swal.fire('Errore', 'Impossibile scaricare i dati.', 'error');
      },
    });
  }

  formatDateForCSV(date: string | Date | null): string {
    if (!date) return '';
    const d = dayjs(date);
    return d.isValid() ? d.format('DD/MM/YYYY') : '';
  }

  deleteData(data: Utente): void {
    const userId = data.id;
    if (typeof userId !== 'number') {
      console.error("ID utente non valido per l'eliminazione:", userId);
      Swal.fire('Errore', 'ID utente non valido.', 'error');
      return;
    }

    Swal.fire({
      title: 'Sei sicuro?',
      text: `Vuoi eliminare l'utente ${data.name ?? ''} ${
        data.cognome ?? ''
      }? Non sarà possibile recuperare i dati.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sì, elimina!',
      cancelButtonText: 'Annulla',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            this.loadUsers();
            Swal.fire('Eliminato!', "L'utente è stato eliminato.", 'success');
          },
          error: (err) => {
            console.error("Errore durante l'eliminazione dell'utente:", err);
            Swal.fire(
              'Errore',
              "Si è verificato un errore durante l'eliminazione.",
              'error'
            );
          },
        });
      }
    });
  }

  openDetailModal(element: Utente) {
    const modalElement = document.getElementById('detailModal');
    if (!modalElement) {
      console.error('Detail modal element not found');
      return;
    }

    const modal = new bootstrap.Modal(modalElement);

    const formattedDateNascita = element.dataNascita
      ? dayjs(element.dataNascita).format('DD/MM/YYYY')
      : 'N/A';
    const formattedDateRilascio = element.dataRilascio
      ? dayjs(element.dataRilascio).format('DD/MM/YYYY')
      : 'N/A';
    const formattedDateValidita = element.validita
      ? dayjs(element.validita).format('DD/MM/YYYY')
      : 'N/A';

    const updateElementContent = (id: string, content: string) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = content;
      } else {
        console.warn(`Element with id '${id}' not found in detail modal`);
      }
    };

    updateElementContent('modal-name', element.name ?? 'N/A');
    updateElementContent('modal-cognome', element.cognome ?? 'N/A');
    updateElementContent('modal-email', element.email ?? 'N/A');
    updateElementContent('modal-birthdate', formattedDateNascita);
    updateElementContent('modal-rilascio', formattedDateRilascio);
    updateElementContent('modal-validita', formattedDateValidita);
    updateElementContent('modal-cf', element.codiceFiscale ?? 'N/A');
    updateElementContent('modal-direttore', element.direttore ?? 'N/A');
    updateElementContent('modal-istruttore', element.istruttore ?? 'N/A');
    updateElementContent(
      'modal-codiceCertificato',
      element.codiceCertificato ?? 'N/A'
    );

    modal.show();
  }

  async fileToBase64(file: File): Promise<string> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) =>
        reject(new Error('Errore nella conversione del file: ' + error));
      reader.readAsDataURL(file);
    });
  }

  async fetchImageAsBase64(filename: string): Promise<string> {
    try {
      const filePath = `./assets/${filename}`;
      console.log(`Fetching image from: ${filePath}`);
      const response = await this.http
        .get(filePath, { responseType: 'blob' })
        .toPromise();
      if (!response) {
        throw new Error("Risposta vuota dal server per l'immagine.");
      }
      console.log(`Image ${filename} fetched successfully.`);
      return await this.blobToBase64(response);
    } catch (error: any) {
      console.error(
        `Errore nel caricamento dell'immagine ${filename}:`,
        error.message || error
      );
      Swal.fire(
        'Errore Immagine',
        `Impossibile caricare l'immagine: ${filename}. Controlla il percorso e assicurati che sia nella cartella assets.`,
        'error'
      );
      return '';
    }
  }

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  onDataRilascioChange(event: MatDatepickerInputEvent<Date>): void {
    const rilascioDate = event.value;
    if (
      rilascioDate &&
      rilascioDate instanceof Date &&
      !isNaN(rilascioDate.getTime())
    ) {
      const validitaDate = new Date(rilascioDate);
      validitaDate.setFullYear(validitaDate.getFullYear() + 2);
      this.form.controls.validita.setValue(validitaDate);
    } else {
      this.form.controls.validita.setValue(null);
    }
  }

  search(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async decidiDirettoreNome(): Promise<string> {
    const direttore = this.form.value.direttore;
    if (!direttore) {
      this.nomeDirettore = '';
      return '';
    }
    switch (direttore) {
      case 'Rocca':
        this.nomeDirettore = 'Francesca Rocca';
        break;
      case 'Faini':
        this.nomeDirettore = 'Daniele Faini';
        break;
      case 'Picone':
        this.nomeDirettore = 'Donato Picone';
        break;
      default:
        this.nomeDirettore = '';
    }
    return this.nomeDirettore;
  }

  async decidiIstruttoreNome(): Promise<string> {
    const istruttore = this.form.value.istruttore;
    if (!istruttore) {
      this.nomeIstruttore = '';
      return '';
    }
    switch (istruttore) {
      case 'Rocca':
        this.nomeIstruttore = 'Francesca Rocca';
        break;
      case 'Faini':
        this.nomeIstruttore = 'Daniele Faini';
        break;
      case 'Picone':
        this.nomeIstruttore = 'Donato Picone';
        break;
      default:
        this.nomeIstruttore = '';
    }
    return this.nomeIstruttore;
  }

  async generatePdf() {
    if (!this.form.valid) {
      Swal.fire(
        'Attenzione',
        'Il form non è valido. Controlla i campi evidenziati.',
        'warning'
      );
      this.form.markAllAsTouched();
      return;
    }

    await this.decidiDirettoreNome();
    await this.decidiIstruttoreNome();

    let image_logoSfondo = '';
    try {
      image_logoSfondo = await this.fetchImageAsBase64('logo.png');
    } catch (error) {
      console.error('Errore nel recupero immagine per PDF:', error);
    }

    const formValue = this.form.getRawValue();
    const name = formValue.name ?? 'N/D';
    const cognome = formValue.cognome ?? 'N/D';
    const codiceFiscale = formValue.codiceFiscale ?? 'N/D';
    const dataRilascioFormatted = formValue.dataRilascio
      ? dayjs(formValue.dataRilascio).format('DD/MM/YYYY')
      : 'N/D';
    const validitaFormatted = formValue.validita
      ? dayjs(formValue.validita).format('DD/MM/YYYY')
      : 'N/D';
    const codiceCertificato = formValue.codiceCertificato ?? 'N/D';
    const dataRilascioYear = formValue.dataRilascio
      ? dayjs(formValue.dataRilascio).year()
      : '-----';

    const documentDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      background: image_logoSfondo
        ? [
            {
              image: image_logoSfondo,
              width: 498 * 0.7,
              height: 501 * 0.7,
              alignment: 'center',
              margin: [0, (595.28 - 501 * 0.7) / 2],
              opacity: 0.1,
            },
          ]
        : undefined,
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
          text: `${name.toUpperCase()} ${cognome.toUpperCase()}`,
          alignment: 'center',
          fontSize: 20,
          bold: true,
        },
        '\n',
        {
          text: `CF (${codiceFiscale.toUpperCase()})`,
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
          text: `Data rilascio ${dataRilascioFormatted}`,
          alignment: 'left',
          bold: true,
        },
        {
          text: `Validità ${validitaFormatted}`,
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
                      fontSize: 14,
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
                      fontSize: 14,
                    },
                    { text: 'Tommaso Rello', alignment: 'center', bold: true },
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
                      fontSize: 14,
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
        { text: ' ', margin: [0, 40] },
        {
          text: `Brevetto N° n.BLSD_${dataRilascioYear}_${codiceCertificato}`,
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

    try {
      pdfMake
        .createPdf(documentDefinition)
        .download(`Certificato di ${name}_${cognome}.pdf`);
    } catch (error) {
      console.error('Errore durante la generazione del PDF:', error);
      Swal.fire(
        'Errore PDF',
        'Impossibile generare il documento PDF.',
        'error'
      );
    }
  }

  openFormModal() {
    if (!this.isEditMode) {
      this.resetForm();
    }
    const modalElement = document.getElementById('formModal');
    if (modalElement) {
      const bsModal = new bootstrap.Modal(modalElement);
      bsModal.show();
    } else {
      console.error('Elemento modale del form non trovato.');
      Swal.fire('Errore UI', 'Impossibile aprire il form modale.', 'error');
    }
  }

  closeFormModal() {
    const modalElement = document.getElementById('formModal');
    if (modalElement) {
      const bsModal = bootstrap.Modal.getInstance(modalElement);
      if (bsModal) {
        bsModal.hide();
      }
    }
  }
}
