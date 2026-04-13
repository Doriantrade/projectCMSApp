import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class PersonalEncargadoBodegaService {

    public urlCms:      string = this.env.apiCMS;
    public urlHelpDesk: string = this.env.apiHelpDeskSytem;
  
    constructor(private http: HttpClient, public router: Router, private env: Environments) { }

    obtenerAsignacionUsuarioBodega( cci: string ) {
      return this.http.get( this.urlCms + 'AsignacionUsuarioBodega/ObtenerAsignacionUsuarioBodega/' + cci )
    }

    guardarAsignacionUsuarioBodega( model:any ) {
      return this.http.post( this.urlCms + 'AsignacionUsuarioBodega/GuardarAsignacionUsuarioBodega', model );
    }

    EditarAsignacionUsuarioBodega( id:number, model:any ) {
      return this.http.put( this.urlCms + 'AsignacionUsuarioBodega/EditarAsignacionUsuarioBodega/' + id, model );
    }

    EliminarAsignacionUsuarioBodega( id:number ) {
      return this.http.delete( this.urlCms + 'AsignacionUsuarioBodega/EliminarAsignacionUsuarioBodega/' + id );
    }

    obtenerBodegas(  cci: string ) {
      return this.http.get( this.urlCms + 'Bodegas/obtenerBodegas/' + cci );
    }

    obtenerUsuarios( cci: string ) {
      return this.http.get( this.urlCms + 'User/ObtenerUsuariosExec/' + cci );
    }

}
