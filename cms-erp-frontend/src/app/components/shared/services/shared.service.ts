import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  public url: string = environment.deploy_url;

  constructor( private http: HttpClient) { }

  generateRandomString = (num: any) => {
    const characters ='-_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result1= '';
    const charactersLength = characters.length;
    for ( let i = 0; i < num; i++ ) {
        result1 += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result1;
  }

  getDataMaster(master: string) {
    return this.http.get( this.url + 'DataMaster/GetDataMaster/' + master );
  }

  getDataMasterGrupo(grupo:string) {
    return this.http.get( this.url + 'DataMaster/ObtenerDatamasterGrupo/' + grupo );
  }

  getDataMasterSubGrupo(grupo:string, sgrupo:string) {
    return this.http.get( this.url + 'DataMaster/ObtenerDatamasterSubGrupos/' + grupo + '/' + sgrupo );
  }

  public validarNumeros(event: KeyboardEvent, controlName: string, clientForm: any): void {
    const input = event.target as HTMLInputElement;
    const control = clientForm.get(controlName);
  
    if (control && input.value && isNaN(Number(input.value))) {
      control.setValue('');
    }
  }

  public validarLetras(event: KeyboardEvent, controlName: string, clientForm: any): void {
    const input = event.target as HTMLInputElement;
    const control = clientForm.get(controlName);
  
    if (control && input.value && /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?]/.test(input.value)) {
      control.setValue('');
    }
  }

  guardarImagenEntidadGeneral(model:any[]) {
    return this.http.post( this.url + 'Imagen/GuardarImagenEntidad', model );
  }

}
