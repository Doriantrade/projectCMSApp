import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class FileMediaTicketsService {

  public urlNodeJs: string = this.env.api_server_nodejs;
  constructor( private http: HttpClient, private env: Environments ) { }
  
  getAuthorizationFileMediaTicket( id: any ) {
    return this.http.get( this.urlNodeJs + "obtener-autorizacion/" + id);
  }

  getReporteTecnicoCorrectivo( idTicket: any, codmaster: string ) {
    return this.http.get( this.urlNodeJs + "generar-reporteTenicoCorrectivo/" + idTicket + '/' + codmaster);
  }


}
