import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { EmailConfig } from '../configuraciones/services/models/email-config.interface';
import { map, Observable, tap } from 'rxjs';

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];


@Injectable({
  providedIn: 'root'
})
export class EncryptService {
  
  listConfmail: EmailConfig[] = []; 

  constructor(private datePipe: DatePipe) { }

  formatFecha(fecha: Date): string {
    const diaSemana = DAYS_ES[fecha.getDay()]; // Obtener día de la semana 
    const dia = fecha.getDate(); 
    // // Obtener día del mes 
    const mes = MONTHS_ES[fecha.getMonth()]; // Obtener mes 
    const anio = fecha.getFullYear(); // Obtener año 
    return `${diaSemana} ${dia} de ${mes} del ${anio}`;
  }

  encryptWithAsciiSeed(value: string, seed: number, hash: number): string {

    let encryptedValue = '';
    for (let i = 0; i < hash; i++) {
      const randomChar = String.fromCharCode(
        Math.floor(Math.random() * 26) + 97
      );
      value += randomChar;
    }
    
    for (let i = 0; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      const encryptedCharCode = charCode + seed;
      encryptedValue += String.fromCharCode(encryptedCharCode);
    }
    
    return encryptedValue;

  }


  decryptWithAsciiSeed(encryptedValue: string, seed: number, hash: number): string {
    // Primero, eliminamos los caracteres aleatorios agregados
    const originalLength = encryptedValue.length - hash;
    encryptedValue = encryptedValue.substring(0, originalLength);

    // Ahora, desencriptamos la cadena
    let decryptedValue = '';

    for (let i = 0; i < encryptedValue.length; i++) {
      const charCode = encryptedValue.charCodeAt(i);
      const decryptedCharCode = charCode - seed; // Restar la semilla
      decryptedValue += String.fromCharCode(decryptedCharCode);
    }

    return decryptedValue;
  }
  // listConfmail: any =[];
  // // obtenerEmailCliSetts(idConfig: number) {
  // //   this.eSet.obtenerEmailCliSetts( idConfig ).subscribe({
  // //     next: (x:any) => {
  // //       // const recipientsString = x[0].recipients;
  // //       // this.recipients   = recipientsString.split(',');
  // //       // this.body         = x[0].body;
  // //       // this.subject      = x[0].subject;
  // //       // this.fromAddress  = x[0].fromAddress;
  // //       // this.replyTo      = x[0].replyTo;
  // //       // this.usercrea     = x[0].usercrea;
  // //       // this.fecrea       = x[0].fecrea;
  // //       // this.codcli       = x[0].codcli;
  // //       // this.idconfig     = x[0].idconfig;
  // //       // this.codecProcess = x[0].codecProcess;
  // //       return this.listConfmail = x;
  // //     }
  // //   })
  // // }

}

