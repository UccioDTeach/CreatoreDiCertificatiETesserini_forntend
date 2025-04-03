// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import Utente from '../../config/utente.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<Utente[]> {
    return this.http.get<Utente[]>(this.apiUrl);
  }

  addUser(user: Utente): Observable<Utente> {
    return this.http.post<Utente>(this.apiUrl, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:3000/users/${id}`);
  }
}
