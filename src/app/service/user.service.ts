// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import Utente from '../../config/utente.model';

@Injectable({ 
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<Utente[]> {
    return this.http.get<Utente[]>(this.apiUrl, { withCredentials: true });
  }

  addUser(user: Utente): Observable<Utente> {
    return this.http.post<Utente>(this.apiUrl, user, { withCredentials: true });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:3000/users/${id}`, { withCredentials: true });
  }
}
