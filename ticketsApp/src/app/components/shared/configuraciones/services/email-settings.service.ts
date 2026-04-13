import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class EmailSettingsServiceX {

  public urlHelpDesk: string = this.env.apiHelpDeskSytem;
  
    constructor(private http: HttpClient, private env: Environments) { }
  
    // private get headers(): HttpHeaders {
    //   return new HttpHeaders({
    //     'Authorization': `Bearer ${this.env.TokenJWT()}`,
    //     'Content-Type': 'application/json'
    //   });
    // }
  
    guardarSettingsEmailCli( model: any ) {
      return this.http.post( this.urlHelpDesk + "EmailCliSet/GuardarEmailCliSet", model );
    }

    actualizarSettingsEmailCli( model: any, id: number ) {
      return this.http.put( this.urlHelpDesk + "EmailCliSet/UpdateEmailCliSet/"+ id, model );
    }

    guardarEmailSettings( model: any ) {
      return this.http.post( this.urlHelpDesk + "EmailCliSet/GuardarEmailSettings", model );
    }

    eliminarSettingsEmailCli( id: number ) {
      return this.http.delete( this.urlHelpDesk + "EmailCliSet/DeleteEmailCliSet/" + id );
    }

    obtenerEmailCliSetts( id: number ) {
      return this.http.get( this.urlHelpDesk + "EmailCliSet/ObtenerConfiguracionEmail/" + id );
    }

    /** ENVIA EMAILS CON SQL SERVER MAGNAMENT STUDIO SMTP */
    // enviarEmails( model:any ) {
    //   return this.http.post( this.urlHelpDesk + "SendEmail", model );
    // }

    // /** ENVIA CORREOS CON BREVO NODEJS SERVER */
    enviarEmails( model:any ) {
      return this.http.post( this.env.api_server_nodejsbrevo_mailing_send, model )
    }

}
