import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoTicketsService {

  public url: string = environment.deploy_url;

  constructor(private http: HttpClient) { }

  getUsuarioTickets() {
    return this.http.get(this.url + 'UsuarioPortalTicket');
  }

  createUsuarioTicket(data: any) {
    return this.http.post(this.url + 'UsuarioPortalTicket', data);
  }

  updateUsuarioTicket(id: number, data: any) {
    return this.http.put(this.url + 'UsuarioPortalTicket/' + id, data);
  }

  deleteUsuarioTicket(id: number) {
    return this.http.delete(this.url + 'UsuarioPortalTicket/' + id);
  }

  getClientes(ccia: string) {
    return this.http.get(this.url + 'ClienteAgencia/obtenerClientes/' + ccia + '/1');
  }

  getRoles() {
    return this.http.get(this.url + 'DataMaster/GetDataMaster/ROL');
  }
}
