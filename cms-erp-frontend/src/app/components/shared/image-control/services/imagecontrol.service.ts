import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ImagecontrolService {
  public url: string = environment.deploy_url;
  constructor(private http: HttpClient) { }

  uploadFile(file: File, nombre: string): Observable<any> {
    const formData = new FormData();
    formData.append('Archivo', file, file.name);

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return this.http.post(this.url+'Imagen/crearCarpeta/'+nombre, formData, { headers });
  }

  obtenerImagenCodBinding( codBinding: string, tipo: string ) {
    return this.http.get( this.url + 'Imagen/obtenerImagen/' + codBinding + '/' + tipo );
  }

  guardarImgFile(model:any []) {
    return this.http.post( this.url + 'imagen/saveImagen', model );
  }

  getImageControl(route: string) {
    return this.http.get<any>(`${this.url}Imagen/GetImageControl/${route}`);
  }

  editarImagen( cbinding: string, model: any [] ) {
    return this.http.put( this.url + 'Imagen/EditarImagen/'+cbinding, model );
  }

}
