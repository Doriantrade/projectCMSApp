import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import * as signalR from '@microsoft/signalr';  


@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private hubConnection!: signalR.HubConnection;
  public url: string = environment.deploy_url;

  constructor( private http: HttpClient) { 

    this.initializeSignalR();

  }

  private initializeSignalR() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7106/chatHub') // Reemplaza la URL con tu propia configuración de SignalR
      .build();

    this.hubConnection.start().catch(err => console.error(err));

    // Suscribirse al evento "NuevoClienteCreado" del hub
    this.hubConnection.on('NuevoClienteCreado', (cliente: any) => {
      console.log('Nuevo cliente creado:', cliente);
      // Realizar las acciones necesarias con el nuevo cliente en tu aplicación
    });
  }

  /** CLIENTES */
  guardarClientes( model: any [] ) {
    return this.http.post( this.url + 'ClienteAgencia/guardarCliente', model );
  }

  crearCuentaHelpDesk(codCliente: string, codCia:string, R:string, Nombre:string, Apellido: string) {
    return this.http.get( this.url + 'User/CrearCuentasHelpDesk/' + codCliente + '/' + codCia + '/' + R + '/' + Nombre + '/' +Apellido );
  }
  
  guardarMagencia( model: any [] ) {
    return this.http.post( this.url + 'MaquinaAgencia/GuardarMaquinaAgencia', model );
  }

  obtenerMaquinaAgenciaAsignada(codagencia:string, ccia:string) {
    return this.http.get( this.url + 'MaquinaAgencia/obtenerAsignacionmaquinacliente/' + codagencia + '/' + ccia );
  }

  eliminarMaquinaAgenciaAsignada(codprod:string, ccia:string) {
    return this.http.get( this.url + 'MaquinaAgencia/elimianarAsignacionmaquinacliente/' + codprod + '/' + ccia );
  }
  
  obtenerAgenciasMaquinarias( codcli:string, ccia:string ) {
    return this.http.get( this.url + 'ClienteAgencia/obtenerAgenciasMaquinarias/'+codcli+'/'+ccia );
  }

  obtenerClientes( ccia: string, type: number ) {
    return this.http.get( this.url + 'ClienteAgencia/obtenerClientes/' + ccia + '/' + type );
  }

  editaCLientes( codcli: string, ccia: string, model: any [] ) {
    return this.http.put( this.url + 'ClienteAgencia/EditarCliente/'+codcli+'/'+ccia, model );
  }

  eliminarClientes( codcli: string, ccia: string ) {
    return this.http.get( this.url + 'ClienteAgencia/eliminarClientes/'+codcli+'/'+ccia );
  }

  /**AGENCIAS */
  guardarAgencia( model:any [] ) {
    return this.http.post( this.url + 'ClienteAgencia/guardarAgencia', model );
  } 

  obtenerAgencias( ccia: string, filter:string, prov:string ) {
    return this.http.get( this.url + 'ClienteAgencia/obtenerAgencias/' + ccia + '/' + filter + '/' + prov);
  }

  eliminarAgencias( codcli: string, ccia: string ) {
    return this.http.get( this.url + 'ClienteAgencia/eliminarAgencia/'+codcli+'/'+ccia );
  }

  editaAgencias( codcli: string, ccia: string, model: any [] ) {
    return this.http.put( this.url + 'ClienteAgencia/EditarAgencia/'+codcli+'/'+ccia, model );
  }

}
