import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class GeolocalizacionService {

  public urlCms: string = this.env.apiCMS;
  public urlHelpDesk: string = this.env.apiHelpDeskSytem;


  constructor( private http: HttpClient, private env: Environments ) { }

  getGeolocalizacion() { 

    return this.http.get('https://ipapi.co/json/');

  }


}
