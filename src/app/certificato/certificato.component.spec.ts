import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificatoComponent } from './certificato.component';

describe('CertificatoComponent', () => {
  let component: CertificatoComponent;
  let fixture: ComponentFixture<CertificatoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificatoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificatoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
