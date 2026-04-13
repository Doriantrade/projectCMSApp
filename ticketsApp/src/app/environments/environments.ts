import { Injectable } from "@angular/core";
import { EncryptService } from "../components/shared/services/encrypt.service";

@Injectable({
    providedIn: 'root'
})

export class Environments {

    public readonly VAPID_PUBLIC_KEY = 'BBJebTCZwb4ylM_-NgKNMxSohioY9WTMabxQZkZq-6xpr6UCtIN58n6KxWOmLTRVugMffUQfQG684mf4GHBg4qY';
    public readonly PRIVATE_KEY = 'VgXV8t67X4KfVMaKo-Xsmp3g1WrASEPqFo4ql-LhjMU';

    constructor(private encrypt: EncryptService) { }

    // SERVIDOR DESARROLLO
    // apiHelpDeskSytem:                    any = 'http://192.168.55.27:4001/api/';
    // apiHelpDeskSytemh:                   any = 'http://192.168.55.27:4001/';
    // apiCMS:                              any = 'http://192.168.55.27:4003/api/';
    // apiCMSfile:                          any = 'http://192.168.55.27:4003/';
    // api_server_nodejsbrevo_mailing_send: any = 'http://192.168.55.27:4004/api/brevoemail/send';
    // api_server_nodejs: any = 'http://192.168.55.27:4004/';

    // SERVIDOR EXXALINK
    // apiHelpDeskSytem:                    any = 'http://104.243.44.89:4001/api/';
    // apiHelpDeskSytemh:                   any = 'http://104.243.44.89:4001/';
    // apiCMS:                              any = 'http://104.243.44.89:4003/api/';
    // apiCMSfile:                          any = 'http://104.243.44.89:4003/';
    // api_server_nodejsbrevo_mailing_send: any = 'http://104.243.44.89:4004/api/brevoemail/send';
    // api_server_nodejs:                   any = 'http://104.243.44.89:4004/';

    // // SERVIDOR EXXALINK DOMINIO (DNS)
    // apiHelpDeskSytem: any = 'https://cmsbackticket.cashmachserv.com/api/';
    // apiHelpDeskSytemh: any = 'https://cmsbackticket.cashmachserv.com/';
    // apiCMS: any = 'https://cmsbackerp.cashmachserv.com/api/';
    // apiCMSfile: any = 'https://cmsbackerp.cashmachserv.com/';
    api_server_nodejsbrevo_mailing_send: any = 'https://cmsmailing.cashmachserv.com/api/brevoemail/send';
    api_server_nodejs: any = 'https://cmsmailing.cashmachserv.com/';

    // DESARROLLO OFICINA LAN
    // apiHelpDeskSytem:                    any = 'http://192.168.55.40:5075/api/';
    // apiHelpDeskSytemh:                   any = 'http://192.168.55.40:5075/';
    // apiCMS:                              any = 'http://192.168.55.40:5130/api/';
    // apiCMSfile:                          any = 'http://192.168.55.40:5130/';
    // api_server_nodejsbrevo_mailing_send: any = 'http://192.168.55.40:4004/api/brevoemail/send';
    // api_server_nodejs:                   any = 'http://192.168.55.40:4004/';

    // SALA C WORK
    // apiHelpDeskSytem:                    any = 'http://192.168.55.78:5075/api/';
    // apiHelpDeskSytemh:                   any = 'http://192.168.55.78:5075/';
    // apiCMS:                              any = 'http://192.168.55.78:5130/api/';
    // apiCMSfile:                          any = 'http://192.168.55.78:5130/';
    // api_server_nodejsbrevo_mailing_send: any = 'http://192.168.55.78:4004/api/brevoemail/send';
    // api_server_nodejs:                   any = 'http://192.168.55.78:4004/';

    // /** LAN */
    // apiHelpDeskSytem:  any = 'http://192.168.55.64:5075/api/';
    // apiHelpDeskSytemh: any = 'http://192.168.55.64:5075/';
    // apiCMS:            any = 'http://192.168.55.64:5130/api/';
    // apiCMSfile:        any = 'http://192.168.55.64:5130/';

    // /** LOCALHOST */
    apiHelpDeskSytem: any = 'http://localhost:5075/api/';
    apiHelpDeskSytemh: any = 'http://localhost:5075/';
    apiCMS: any = 'http://localhost:5130/api/';
    apiCMSfile: any = 'http://localhost:5130/';

    // /** LOCAL NETWOR ROOM PRUEBAS SALA C */
    // apiHelpDeskSytem:  any = 'http://192.168.55.67:5075/api/';
    // apiHelpDeskSytemh: any = 'http://192.168.55.67:5075/';
    // apiCMS:            any = 'http://192.168.55.67:5130/api/';
    // apiCMSfile:        any = 'http://192.168.55.67:5130/';

    // /** SERVER NODEJS BREVO MAIL */
    // api_server_nodejsbrevo_mailing_send: any = 'http://localhost:6565/api/brevoemail/send';
    // api_server_nodejs:                   any = 'http://localhost:6565/';

    /**SHOW ROOM */
    // apiHelpDeskSytem:  any = 'http://192.168.55.66:5075/api/';
    // apiHelpDeskSytemh: any = 'http://192.168.55.66:5075/';
    // apiCMS:            any = 'http://192.168.55.66:5130/api/';
    // apiCMSfile:        any = 'http://192.168.55.66:5130/';

    version: string = '1.1.1 - 2026';
    es: number = 5;
    hash: number = 10;
    encode: number = 99;
    codcia: string = 'CMS-001-2023';

    /** BANCO PICHINCHA CONTRATO 4H  */
    contratoBPTiempoMantenimiento: number = 14400;

    apiurl(): string {
        const env: string = this.apiHelpDeskSytem + 'api/';
        return env;
    }

    apiUrlHub(): string {
        const envHub: string = this.apiHelpDeskSytemh + 'hubs/';
        return envHub;
    }

    apiUrlStorage(): string {
        const envstorage: string = this.apiHelpDeskSytem;
        return envstorage;
    }

    apiUrlStorageMImage(): string {
        const envstorage: string = this.apiHelpDeskSytemh;
        return envstorage;
    }

    apiUrlIcon(): string {
        const envicon = this.apiHelpDeskSytem + 'iconsApp/';
        return envicon;
    }

    TokenJWT(): string {
        let xtoken: any = sessionStorage.getItem('token');
        let x: any = this.encrypt.decryptWithAsciiSeed(xtoken, this.es, this.hash);
        return x;
    }

    appTheme: appTheme = {
        colorPrimary: '#0f5499',
        colorSecondary: '#A5CF61',
        colorSecondary_A: '#6F9B3C',
        colorSecondary_B: '#558257',
        colorSecondary_C: '#1B456F'
    };

    getAppTheme(): appTheme {
        return this.appTheme;
    }

    logoCMS64bits: string = 'data:image/jpeg;base64,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';
    // logoCMS64bits: string =  'http://192.168.55.27:4004/static/logotipo/logotipo.jpg';

}

export interface appTheme {
    colorPrimary: string,
    colorSecondary: string,
    colorSecondary_A: string,
    colorSecondary_B: string,
    colorSecondary_C: string
}
