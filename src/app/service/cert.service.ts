import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import Certificato from '../../config/certificato.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/certificati';

  constructor(private http: HttpClient) {}

  getCertificati(): Observable<Certificato[]> {
    return this.http.get<Certificato[]>(this.apiUrl, { withCredentials: true });
  }

  addCertificati(certificato: Certificato): Observable<Certificato> {
    return this.http.post<Certificato>(this.apiUrl, certificato, {
      withCredentials: true,
    });
  }

  updateCertificato(
    id: number,
    certificato: Certificato
  ): Observable<Certificato> {
    return this.http.put<Certificato>(`${this.apiUrl}/${id}`, certificato, {
      withCredentials: true,
    });
  }

  deleteCertificato(id: number): Observable<void> {
    return this.http.delete<void>(
      `http://localhost:3000/api/certificati/${id}`,
      {
        withCredentials: true,
      }
    );
  }
}
