import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  constructor(private http: HttpClient, private env: Environments) {}

  getUsuarioPortalTicket(id: string): Observable<any> {
    return this.http.get<any>(`${this.env.apiCMS}UsuarioPortalTicket/${id}`);
  }

  updateUsuarioPortalTicket(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.env.apiCMS}UsuarioPortalTicket/${id}`, data);
  }
}
