import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject, ViewChild, OnInit } from '@angular/core';
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
import {
  MatDatepickerModule
} from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatTooltipModule
],
  templateUrl: './certficati.component.html',
  styleUrl: './certficati.component.scss',
    providers: [
      [DatePipe],
      { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
      { provide: MAT_DATE_FORMATS, useValue: IT_DATE_FORMATS },
    ],
})
export class CertficatiComponent implements OnInit {
  dataSource: MatTableDataSource<Certificato>;
  savedData: Certificato[] = [];
  displayedColumns: string[] = [
    'id',
    'tipoCertificato',
    'titolo',
    'siAttestaChe',
    'sottotitolo',
    'luogoFormazione',
    'sottotitolo2',
    'carica1',
    'carica2',
    'carica3',
    'createdBy',
    'actions'
  ];
  form: FormGroup;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<FormGroup>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  authService = inject(AuthService);
  loggedInUser = this.authService.user.asReadonly();
  isEditMode: boolean = false;

  constructor(
    private dateAdapter: DateAdapter<Date>,
    private fb: FormBuilder,
    private certService: CertService,
    private datePipe: DatePipe
  ) {
    this.dataSource = new MatTableDataSource(this.savedData);

    this.form = this.fb.group({
      id: [undefined],
      tipoCertificato: ['', Validators.required],
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
    this.dataSource.sort = this.sort;

    setTimeout(() => {
      if (this.sort) {
        this.sort.active = 'id';
        this.sort.direction = 'desc';
      }
    });

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
        console.log('Certificate Templates loaded:', data);
        this.savedData = data;
        this.dataSource.data = this.savedData;
      },
      error: (err) => {
        console.error('Errore caricamento modelli certificato:', err);
      },
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;

      const certificateTemplate: Partial<Certificato> = {
        id: this.isEditMode ? formValue.id : undefined,
        tipoCertificato: formValue.tipoCertificato,
        titolo: formValue.titolo,
        siAttestaChe: formValue.siAttestaChe,
        sottotitolo: formValue.sottotitolo,
        luogoFormazione: formValue.luogoFormazione,
        sottotitolo2: formValue.sottotitolo2,
        carica1: formValue.carica1,
        carica2: formValue.carica2,
        carica3: formValue.carica3,
      };

      console.log('Certificate template to save:', certificateTemplate);

      if (this.isEditMode) {
        this.certService.updateCertificato(certificateTemplate.id!, certificateTemplate as Certificato).subscribe({
          next: () => {
            this.loadCert();
            this.resetForm();
            this.closeFormModal();
            Swal.fire('Aggiornato', 'Modello certificato aggiornato!', 'success');
          },
          error: (err) => {
            console.error("Errore aggiornamento modello:", err);
            Swal.fire('Errore', 'Errore aggiornamento modello.', 'error');
          }
        });
      } else {
        delete certificateTemplate.id;
        this.certService.addCertificati(certificateTemplate as Certificato).subscribe({
          next: () => {
            this.loadCert();
            this.resetForm();
            this.closeFormModal();
            Swal.fire('Salvato', 'Modello certificato creato!', 'success');
          },
          error: (err) => {
            console.error("Errore salvataggio modello:", err);
            Swal.fire('Errore', 'Errore salvataggio modello.', 'error');
          }
        });
      }
    } else {
      console.error('Form is invalid');
    }
  }

  resetForm(): void {
    this.isEditMode = false;
    this.form.reset();
  }

  populateForm(element: Certificato): void {
    console.log('Populating form with template:', element);
    this.form.patchValue({
      id: element.id,
      tipoCertificato: element.tipoCertificato,
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

  openDetailModal(element: Certificato): void {
    document.getElementById('modal-tipoCertificato')!.textContent = element.tipoCertificato || 'N/A';
    document.getElementById('modal-carica1')!.textContent = element.carica1 || 'N/A';
    document.getElementById('modal-carica2')!.textContent = element.carica2 || 'N/A';
    document.getElementById('modal-carica3')!.textContent = element.carica3 || 'N/A';
    document.getElementById('modal-luogoFormazione')!.textContent = element.luogoFormazione || 'N/A';
    document.getElementById('modal-siAttestaChe')!.textContent = element.siAttestaChe || 'N/A';
    document.getElementById('modal-sottotitolo')!.textContent = element.sottotitolo || 'N/A';
    document.getElementById('modal-sottotitolo2')!.textContent = element.sottotitolo2 || 'N/A';
    document.getElementById('modal-titolo')!.textContent = element.titolo || 'N/A';

    const modalElement = document.getElementById('detailModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  search(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
    this.table.renderRows();
  }

  openFormModal(): void {
    this.isEditMode = false;
    this.form.reset();
    const modalElement = document.getElementById('formModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  closeFormModal(): void {
    const modalElement = document.getElementById('formModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
  }

  editUser(element: any) {
    this.isEditMode = true;
    this.form.patchValue(element);
    this.openFormModal();
  }

  formatDateForDisplay(date: Date | string | undefined): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  openEditModal(element: Certificato): void {
    this.isEditMode = true;
    this.populateForm(element);
    const modalElement = document.getElementById('formModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  generatePDF(element: Certificato): void {
    const docDefinition = {
      content: [
        { text: element.titolo || 'Certificato', style: 'header' },
        { text: '\n' },
        { text: `Si attesta che: ${element.siAttestaChe || ''}`, style: 'normal' },
        { text: '\n' },
        { text: `Tipo Certificato: ${element.tipoCertificato || ''}`, style: 'normal' },

        { text: `Sottotitolo: ${element.sottotitolo || ''}`, style: 'normal' },
        { text: `Luogo Formazione: ${element.luogoFormazione || ''}`, style: 'normal' },
        { text: `Sottotitolo 2: ${element.sottotitolo2 || ''}`, style: 'normal' },
        { text: '\n' },
        { text: 'Firme:', style: 'subheader' },
        { text: `Carica 1: ${element.carica1 || ''}`, style: 'normal' },
        { text: `Carica 2: ${element.carica2 || ''}`, style: 'normal' },
        { text: `Carica 3: ${element.carica3 || ''}`, style: 'normal' },
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 20] },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
        normal: { fontSize: 12, margin: [0, 0, 0, 5] },
      }
    };

    pdfMake.createPdf(docDefinition as any).download(`Certificato_${element.id}.pdf`);
  }
}
