import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class NavsideService {
  //modulos/GetModulos/admin-001

  public url: string = environment.deploy_url;  
  constructor( private http: HttpClient, public router: Router ) { }

  getModulos(userCod: string) {
    return this.http.get( this.url + 'modulos/GetModulos/' + userCod );
  }

  // getUser(userCod: string) {
  //   return this.http.get( this.url + 'User/GetModulos/' + userCod );
  // }

  obtenerImagen(cuser: string, tipo: string) {
    return this.http.get( this.url + 'Imagen/obtenerImagen/' + cuser + '/' + tipo );
  }

  uploadFile(file: File, nombre: string): Observable<any> {
    const formData = new FormData();
    formData.append('Archivo', file, file.name);

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return this.http.post(this.url+'Imagen/crearCarpeta/'+nombre, formData, { headers });
  }
  
}
