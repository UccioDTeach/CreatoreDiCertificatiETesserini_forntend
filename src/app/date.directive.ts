import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';
import dayjs from 'dayjs';
import 'dayjs/locale/it'; // Importa la lingua italiana

@Directive({
  selector: 'input[matDatepicker]', // Selettore per tutti gli input con MatDatepicker
})
export class DateDirective {
  private dateFormat = 'DD/MM/YYYY'; // Formato italiano

  constructor(private el: ElementRef, private control: NgControl) {
    dayjs.locale('it'); // Imposta la lingua italiana per Dayjs
  }

  @HostListener('blur') onBlur() {
    const value = this.el.nativeElement.value;
    if (value) {
      const formattedDate = dayjs(value, ['YYYY-MM-DD', 'DD/MM/YYYY'], true).format(this.dateFormat);
      if (formattedDate !== 'Invalid Date') {
        this.control.control?.setValue(formattedDate);
      }
    }
  }
}
