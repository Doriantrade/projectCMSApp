import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CronogramaService {

  private hubConnection!: signalR.HubConnection;
  public url: string = environment.deploy_url;

  constructor(private http: HttpClient) { }

  
  obtenerCronograma(ccia:string,anio:number,mes:number,loc:any, tipo:number, userTecnic: string): Observable<any> {

    return this.http.get( this.url + 'Cronograma/ObtenerCronograma/'+ccia+ '/'+anio+'/'+mes+'/'+loc+'/'+tipo + '/' +userTecnic );
  }
  
  guardarCronos(model:any []) {
    return this.http.post(this.url + 'Cronograma/GuardarCrono', model);
  }

  obtenerLocalidades() {
    return this.http.get( this.url + 'localidad/MainLocalidad' );
  }

  obtenerDetalleCronoUnit(tipo:number, codcrono:string, mes:number, dia:number) { 
    return this.http.get( this.url + 'CronoDetalleUnit/DetalleUnitCrono/'+tipo+'/'+codcrono+'/'+mes+'/'+dia );
  }

  editarCrnograma( codcronograma:string, model:any[] ) {
    return this.http.put( this.url + 'Cronograma/EditarCrono/'+codcronograma, model );
  }

  deleteCrono(ccrono:string) {
    return this.http.get( this.url + 'Cronograma/DeleteCronograma/' + ccrono );
  }

}
