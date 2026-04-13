import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SettingsGeolocationService {
    private apiUrl = environment.deploy_url + 'SettingsGeoLocalizacionMobil';

    constructor(private http: HttpClient) { }

    getSettings(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    getMobileMonitorData(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/MobileMonitorData`);
    }

    getTecnicosAppMovil(): Observable<any[]> {
        return this.http.get<any[]>(environment.deploy_url + 'User/ObtenerTecnicosAppMovil');
    }

    getSettingsByMac(mac: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/ByMac/${mac}`);
    }

    updateSettings(id: number, settings: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, settings);
    }

    deleteSettings(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
