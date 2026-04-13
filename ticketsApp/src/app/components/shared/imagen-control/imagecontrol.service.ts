import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})

export class ImagecontrolService {

  public url: string = this.env.apiUrlStorage();

  constructor(private http: HttpClient, private env: Environments) { }

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.env.TokenJWT()}`,
      'Content-Type': 'application/json'
    });
  }

  downloadFile(nombreCarpeta: string, nombreArchivo: string): Observable<Blob> {
    // La respuesta esperada es un Blob (archivo binario)
    return this.http.get(`https://cmsbackticket.cashmachserv.com/api/Imagen/downloadFile2/${nombreCarpeta}/${nombreArchivo}`, {
      responseType: 'blob' // Indica que esperamos una respuesta de tipo binario (Blob)
    });
  }

  getFileDetails(nombreCarpeta: string, nombreArchivo: string) {
    // Construye la URL para la petición GET
    return this.http.get(`${this.url}Imagen/obtenerDetallesArchivo/${nombreCarpeta}/${nombreArchivo}`);
  }

  uploadFile(file: File, nombre: string): Observable<any> {
    const formData = new FormData();
    formData.append('Archivo', file, file.name);

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return this.http.post(this.url + 'Imagen/crearCarpeta/' + nombre, formData, { headers });
  }

  uploadFilePDF(file: File, nombre: string, idRequerimiento: string): Observable<any> {


    const formData = new FormData();
    formData.append('Archivo', file, file.name);

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return this.http.post(this.url + 'Imagen/CrearCarpetaPDF/' + nombre + '/' + idRequerimiento, formData, { headers });

  }

  uploadFilePDF2(file: File, nombre: string, idRequerimiento: string): Observable<{ filePath: string }> {
    const formData = new FormData();
    formData.append('Archivo', file, file.name);

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return this.http.post<{ filePath: string }>(
      this.url + 'Imagen/CrearCarpetaPDF2/' + nombre + '/' + idRequerimiento,
      formData,
      { headers }
    );
  }


  uploadFileMsj(file: File, codRequerimiento: string): Observable<any> {
    const formData = new FormData();
    formData.append('Archivo', file, file.name);

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return this.http.post(this.url + 'Imagen/imagenesMensajeria/' + codRequerimiento, formData, { headers });
  }

  obtenerImagenCodBinding(codBinding: string, tipo: string) {
    return this.http.get(this.url + 'Imagen/obtenerImagen/' + codBinding + '/' + tipo, { headers: this.headers });
  }

  guardarFileMidaTicketDBUnit(model: any[]) {
    return this.http.post('https://cmsbackticket.cashmachserv.com/api/FileMediaTicket/GuardarFileMediaTicketUnit', model, { headers: this.headers });
  }

  guardarFileMidaTicketDB(model: any, fileDtoTunelHub: any) {

    const request = {
      fileMediaData: model,
      cantFileData: fileDtoTunelHub
    };

    return this.http.post(
      this.url + 'FileMediaTicket/GuardarFileMediaTicket',
      request,
      {
        headers: this.headers
      }
    );

  }

  eliminarArchivosMedia(id: number, tipo: string) {
    return this.http.delete(this.url + 'FileMediaTicket/EliminarArchivoTicket/' + id + '/' + tipo, { headers: this.headers });
  }

  actualizarArchivosMedia(id: number, estado: number, idrequer: number) {
    return this.http.get(this.url + 'FileMediaTicket/ActualizarEstadoFileMediaTicket/' + id + '/' + estado + '/' + idrequer, { headers: this.headers });
  }

  descargarArchivoMedia(idReuqerPad: string, nombreArchivo: string) {
    return this.http.get(this.url + 'Imagen/DescargarArchivo/' + idReuqerPad + '/' + nombreArchivo, {
      responseType: 'blob'  // <-- IMPORTANTE
    });
  }

  descargarArchivoMediaRTecnico(idReuqerPad: any, nombreArchivo: any, type: any) {
    // console.log('API PARA DESCARGAR ARCHIVOS')
    // console.log(this.url + 'Imagen/DescargarArchivoRTecnico/' + idReuqerPad + '/' + nombreArchivo + '/' + type)
    return this.http.get(this.url + 'Imagen/DescargarArchivoRTecnico/' + idReuqerPad + '/' + nombreArchivo + '/' + type, {
      responseType: 'blob'  // <-- IMPORTANTE
    });
  }

  guardarImgFile(model: any[]) {
    return this.http.post(this.url + 'imagen/saveImagen', model, { headers: this.headers });
  }

  getImageControl(route: string) {
    return this.http.get<any>(`${this.url}Imagen/GetImageControl/${route}`, { headers: this.headers });
  }

  editarImagen(cbinding: string, model: any[]) {
    return this.http.put(this.url + 'Imagen/EditarImagen/' + cbinding, model, { headers: this.headers });
  }

  obtenerFileMediaTicket(idTicket: number, type: string) {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log('OBTENER FILE MEDIA TICKET DESDE EL SERVICIO');
    console.log(this.url + 'FileMediaTicket/ObtenerFileMediaTicket/' + idTicket + '/' + type, { headers: this.headers })
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    return this.http.get(this.url + 'FileMediaTicket/ObtenerFileMediaTicket/' + idTicket + '/' + type, { headers: this.headers });
  }
}
