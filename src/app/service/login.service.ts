// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import UtenteRegistrato from '../../config/utenteRegistrato.model';
@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = 'http://localhost:3000/login';

  constructor(private http: HttpClient) {}


  accediUtenti(user: UtenteRegistrato): Observable<UtenteRegistrato> {
    return this.http.post<UtenteRegistrato>(this.apiUrl, user);
  }


}
