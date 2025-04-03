import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';
import dayjs from 'dayjs';
import 'dayjs/locale/it'; 
@Directive({
  selector: 'input[matDatepicker]', 
})
export class DateDirective {
  private dateFormat = 'DD/MM/YYYY'; 

  constructor(private el: ElementRef, private control: NgControl) {
    dayjs.locale('it'); 
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
