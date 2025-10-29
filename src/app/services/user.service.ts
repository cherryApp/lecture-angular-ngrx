import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = 'https://nettuts.hu/jms/cherryApp/users';

  // GET: Fetch all users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  // GET: Fetch a single user by ID
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  // POST: Create a new user
  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.baseUrl, user);
  }

  // PATCH: Update an existing user
  updateUser(id: number, user: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}`, user);
  }

  // DELETE: Remove a user
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}