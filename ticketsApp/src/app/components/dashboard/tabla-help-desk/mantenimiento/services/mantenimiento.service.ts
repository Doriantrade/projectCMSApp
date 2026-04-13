import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {

  public urlCms: string = this.env.apiCMS;
  public urlHelpDesk: string = this.env.apiHelpDeskSytem;

  constructor(private http: HttpClient, private env: Environments) { }

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.env.TokenJWT()}`,
      'Content-Type': 'application/json'
    });
  }

  guardarResumenMantenimiento(model: any[]) {
    return this.http.post('https://cmsbackticket.cashmachserv.com/api/' + 'ResumenMantenimiento/GuardarResumenMantenimientos', model, { headers: this.headers });
    // return this.http.post( this.urlHelpDesk + 'ResumenMantenimiento/GuardarResumenMantenimientos', model, { headers: this.headers } );
  }

  obtenerResumenMantenimiento(idRequerimiento: number) {
    return this.http.get(this.urlHelpDesk + 'ResumenMantenimiento/ObtenerResumenMantenimiento/' + idRequerimiento, { headers: this.headers });
  }

  // guardarAsignacionTecnicoTicket( model: any [], modelTecnico: any ) {
  //   return this.http.post( this.urlHelpDesk + 'AsignacionTecnicoTicket/guardarAsignTecnicoRequer', model, modelTecnico, { headers: this.headers } );
  // }

  guardarAsignacionTecnicoTicket(model: any, modelTecnico: any) {
    const request = {
      asignacion: model,
      tecnico: modelTecnico
    };

    return this.http.post(
      this.urlHelpDesk + 'AsignacionTecnicoTicket/guardarAsignTecnicoRequer',
      request,
      { headers: this.headers }
    );
  }

  eliminarTecnicoProcess(idTicket: number, coduserTecnic: string) {
    return this.http.delete(this.urlHelpDesk + 'TicketResolucion/EliminarTecnicosProcess/' + idTicket + '/' + coduserTecnic, { headers: this.headers });
  }

  obtenerTecnicosTicket(idticket: number) {
    return this.http.get(this.urlHelpDesk + 'AsignacionTecnicoTicket/obtenerTecnicosTicket/' + idticket, { headers: this.headers });
  }

  obtenerRepuestos(usercrea: string, ccia: string) {
    return this.http.get(this.urlCms + 'Repuestos/obtenerRepuestos/' + usercrea + '/' + ccia, { headers: this.headers });
  }

  guardarAsignacionRepuestosRequerimientos(model: any[]) {
    return this.http.post(this.urlHelpDesk + 'AsignRepuRequer/guardarAsignRepuRequer', model, { headers: this.headers });
  }

  obtenerRepuestosRequerimientos(id: number) {
    return this.http.get(this.urlHelpDesk + 'AsignRepuRequer/obtenerRepuestosRequerimientos/' + id, { headers: this.headers });
  }

  actualizarRepuestos(codrep: string, model: any[]) {
    return this.http.put(this.urlCms + 'Repuestos/EditarRepuestos/' + codrep, model, { headers: this.headers });
  }

  eliminarRepuestosAsignados(idRepu: string) {
    return this.http.delete(this.urlHelpDesk + 'AsignRepuRequer/EliminarRepuestosAsignados/' + idRepu, { headers: this.headers });
  }

  obtenerUsuariosCronos(idlocalidad: any) {
    return this.http.get(this.urlCms + 'User/ObtenerTecniCrono/' + idlocalidad, { headers: this.headers })
  }

  guardarCronos(model: any[]) {
    return this.http.post(this.urlCms + 'Cronograma/GuardarCrono', model, { headers: this.headers });
  }

  guardarCronoInteligente(codlocalidad: number, codcrono: string) {
    return this.http.get(this.urlCms + 'Cronograma/CalculoAsignacionCronograma/' + codlocalidad + '/' + codcrono, { headers: this.headers });
  }

  generateRandomString = (num: any) => {
    const characters = '-_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result1 = '';
    const charactersLength = characters.length;
    for (let i = 0; i < num; i++) {
      result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result1;
  }

  obtenerLocalidades() {
    return this.http.get(this.urlCms + 'localidad/MainLocalidad', { headers: this.headers });
  }

  guardarMantenimiento(model: any) {
    return this.http.post(this.urlCms + 'Mantenimiento/guardarMantenimiento', model, { headers: this.headers });
  }

  ActualizarStockRepuestosDarDeBaja(codRep: string, cantidad: number) {
    return this.http.get(this.urlHelpDesk + 'cotizacion/ActualizarStockRepuestos/' + codRep + '/' + cantidad, { headers: this.headers });
  }


  GuardarAuditoriaCotizacionDeBaja(model: any[]) {
    return this.http.post(this.urlHelpDesk + 'cotizacion/GuardarAuditoriaCotizacionDeBaja', model, { headers: this.headers });
  }

  eliminarAsignacionRepuTicket(idTicket: number) {
    return this.http.delete(this.urlHelpDesk + 'AsignRepuRequer/EliminarAsignacionRepuTicket/' + idTicket, { headers: this.headers });
  }

  obtenerLocalidadesAgencia(idAgencia: string) {
    return this.http.get(this.urlHelpDesk + 'AsignRepuRequer/obtenerLocalidadAgencia/' + idAgencia, { headers: this.headers });
  }

  obtenerLocalidadPorProvincia(codprov: string) {
    return this.http.get(this.urlHelpDesk + 'LocalidadPorProvincia/ObtenerLocalidadPorProvincia/' + codprov, { headers: this.headers });
  }

  actualizarContadorEquipo(idEquipo: string, contador: number) {
    return this.http.get(this.urlHelpDesk + 'AsignRepuRequer/actualizarEquipoContadorInicial/' + idEquipo + '/' + contador, { headers: this.headers })
  }

}
