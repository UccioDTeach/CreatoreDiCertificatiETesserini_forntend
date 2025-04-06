import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject, ViewChild } from '@angular/core';
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
  MatOption,
} from '@angular/material/core';
import {
  MatDatepickerModule
} from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import Swal from 'sweetalert2';
import Certificato from '../../config/certificato.model';
import { AuthService } from '../service/auth.service';
import { CertService } from '../service/cert.service';
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
  selector: 'app-certficati',
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
  templateUrl: './certficati.component.html',
  styleUrl: './certficati.component.scss',
    providers: [
      [DatePipe],
      { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
      { provide: MAT_DATE_FORMATS, useValue: IT_DATE_FORMATS },
    ],
})
export class CertficatiComponent {
  dataSource: MatTableDataSource<Certificato>;
  savedData: any[] = [];
  displayedColumns: string[] = [
    'id',
    'tipoCertificato',
    'titolo',
    'sottotitolo',
    'carica1',
    'carica2',
    'carica3',
  ];
  form: FormGroup;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<FormGroup>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  authService = inject(AuthService);
  user = this.authService.user.asReadonly();
  isEditMode: boolean = false;

  constructor(
    private dateAdapter: DateAdapter<Date>,
    private fb: FormBuilder,
    private certService: CertService,
  ) {
    this.dataSource = new MatTableDataSource(this.savedData);

    this.form = this.fb.group({
      id: [undefined],
      createdBy: [this.user],
      TipoCertificato: ['', Validators.required],
      titolo: ['', Validators.required],
      siAttestaChe: ['', Validators.required],
      sottotitolo: ['', Validators.required],
      luogoFormazione: ['', Validators.required],
      sottotitolo2: ['', Validators.required],
      carica1: ['', Validators.required],
      carica2: ['', Validators.required],
      carica3: ['', Validators.required],
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
    this.loadCert();
    this.dateAdapter.setLocale('it-IT');
  }

  
  loadCert(): void {
    this.certService.getCertificati().subscribe({
      next: (data) => {
        this.savedData = data;
        this.dataSource.data = this.savedData;
      },
      error: (err) => {
        console.error('Errore durante il caricamento dei certificati:', err);
      },
    });
  }
  
  onSubmit() {
      if (this.form.valid) {
        const certData = this.form.value;
        certData.createdBy = this.user();
  console.log(certData);
        if (this.isEditMode) {
          this.certService.updateCertificato(certData.id, certData).subscribe({
            next: () => {
              this.loadCert();
              this.resetForm();
              Swal.fire(
                'Aggiornato',
                'Utente aggiornato con successo!',
                'success'
              );
            },
            error: (err) => {
              console.error("Errore durante l'aggiornamento del certificato:", err);
              Swal.fire(
                'Errore',
                "Si è verificato un errore durante l'aggiornamento del certficato.",
                'error'
              );
            },
          });
        } else {
          this.certService.addCertificati(certData).subscribe({
            next: () => {
              this.loadCert();
              this.resetForm();
              Swal.fire('Salvato', 'Utente salvato con successo!', 'success');
            },
            error: (err) => {
              console.error("Errore durante il salvataggio del certificato:", err);
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
  
    editUser(cert: Certificato): void {
      this.isEditMode = true;
      this.populateForm(cert);
    }
  
    // Added resetForm method
    resetForm(): void {
      this.isEditMode = false;
      this.form.reset();
    }


    populateForm(element: Certificato): void {
      this.form.patchValue({
        id: element.id,
        createdBy: element.createdBy,
        TipoCertificato: element.TipoCertificato,
        titolo: element.titolo,
        siAttestaChe: element.siAttestaChe,
        sottotitolo: element.sottotitolo,
        luogoFormazione: element.luogoFormazione,
        sottotitolo2: element.sottotitolo2,
        carica1: element.carica1,
        carica2: element.carica2,
        carica3: element.carica3,
      });
    }

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

    deleteData(data: Certificato): void {
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
          this.certService.deleteCertificato(data.id).subscribe({
            next: () => {
              this.loadCert();
              Swal.fire('Eliminato!', 'Il dato è stato eliminato.', 'success');
            },
            error: (err) => {
              console.error("Errore durante l'eliminazione del certificato:", err);
              Swal.fire(
                'Errore',
                "Si è verificato un errore durante l'eliminazione del certificato.",
                'error'
              );
            },
          });
        } else {
          Swal.fire('Annullato', "L'eliminazione è stata annullata.", 'info');
        }
      });
    }

    openDetailModal(element: Certificato) {

      document.getElementById('modal-tipoCertificato')!.textContent = element.TipoCertificato;
      document.getElementById('modal-carica1')!.textContent = element.carica1;
      document.getElementById('modal-carica2')!.textContent = element.carica2;
      document.getElementById('modal-carica3')!.textContent =
        element.carica3;
      document.getElementById('modal-luogoFormazione')!.textContent =
        element.luogoFormazione;
      document.getElementById('modal-siAttestaChe')!.textContent =
        element.siAttestaChe;
      document.getElementById('modal-sottotitolo')!.textContent = element.sottotitolo;
      document.getElementById('modal-sottotitolo2')!.textContent = element.sottotitolo2;
      document.getElementById('modal-titolo')!.textContent =
        element.titolo;
      const modal = new bootstrap.Modal(document.getElementById('detailModal')!);
      modal.show();
    }


    search(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value
        .trim()
        .toLowerCase();
      this.dataSource.filter = filterValue;
      this.table.renderRows();
    }
}
