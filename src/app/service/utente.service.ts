// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import UtenteRegistrato from '../../config/utenteRegistrato.model';
@Injectable({
  providedIn: 'root',
})
export class UtenteRegistratoSerivce {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getUtenti(): Observable<UtenteRegistrato[]> {
    return this.http.get<UtenteRegistrato[]>(this.apiUrl);
  }
  
  addUtenti(user: UtenteRegistrato): Observable<UtenteRegistrato> {
    return this.http.post<UtenteRegistrato>(this.apiUrl + '/register', user);
  }


}
