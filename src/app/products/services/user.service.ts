import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UsersResponce } from '../interfaces/user-responce.interface';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const baseUrl = environment.baseUrl;

@Injectable({providedIn: 'root'})
export class UserService {
  constructor() { }

  private http = inject(HttpClient)

  // getUsers(): Observable<UsersResponce>{
  //   return this.http
  //     .get<UsersResponce>(`${baseUrl}/usuarios`, { withCredentials: true })
  //     .pipe(tap((resp) => console.log(resp)));
  // }
}
