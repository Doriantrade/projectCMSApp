import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RepCorrectivoService } from './services/rep-correctivo.service';
import { MantenimientoService } from '../tabla-help-desk/mantenimiento/services/mantenimiento.service';

import { EncryptService } from '../../shared/services/encrypt.service';
import { MasterTableService } from '../../shared/master-table/master-table.service';

@Component({
  selector: 'app-documentos-reportes',
  templateUrl: './documentos-reportes.component.html',
  styleUrls: ['./documentos-reportes.component.scss']
})

export class DocumentosReportesComponent implements OnInit, OnChanges {
  
  @Input() data_cli: any;

  public serieTicket: string = '';
  public idAgencia: string = '';
  public nombreCliente: string = '';
  public nombreAgencia: string = '';
  public nombreTecnico: string = '';
  public cedulaTecnico: string = '';
  public provinciaAgencia: string = '';
  public tipoMantenimientoCorto: string = '';
  public nSerieEquipo: string = '';
  public tipoMaquina: string = '';
  public capacidad: string = ''; 
  public marca: string = '';
  public modelo: string = '';
  public contadorinicial: number = 0;
  public codigobp: string = '';
  public ninventario: string = '';
  public estadoEquipo: string = '';

  fechaFormateada: any;
  padId: string = '0000000';
  listaReporteTecnicoCorrectivo: any = [];

  constructor( private repTec: RepCorrectivoService,
               private dataMater: MasterTableService,
               private mant: MantenimientoService,
               private fechaService: EncryptService ) {}

  ngOnInit(): void {
    const fechaActual = new Date();
    this.fechaFormateada = this.fechaService.formatFecha(fechaActual);   
  }

  ngOnChanges(changes: SimpleChanges): void {
      if(changes) {
        this.padId = this.data_cli[0].idRequerPad;
        this.obtenerReptecCorr(this.data_cli[0].id);
      }
  }

  obtenerReptecCorr(id:number) {
    this.repTec.obtenerReporteTecnicoCorrectivo(id).subscribe({
      next: (x) => {
        this.listaReporteTecnicoCorrectivo = x;
      }, error: (e) => {
        console.error(e);
      }, complete: () => {
          this.serieTicket            = this.listaReporteTecnicoCorrectivo[0].serieTicket;
          this.idAgencia              = this.listaReporteTecnicoCorrectivo[0].idAgencia;
          this.nombreCliente          = this.listaReporteTecnicoCorrectivo[0].nombreCliente;
          this.nombreAgencia          = this.listaReporteTecnicoCorrectivo[0].nombreAgencia;
          this.nombreTecnico          = this.listaReporteTecnicoCorrectivo[0].nombreTecnico;
          this.cedulaTecnico          = this.listaReporteTecnicoCorrectivo[0].cedulaTecnico;
          this.provinciaAgencia       = this.listaReporteTecnicoCorrectivo[0].provinciaAgencia;
          this.tipoMantenimientoCorto = this.listaReporteTecnicoCorrectivo[0].tipoMantenimientoCorto;
          this.nSerieEquipo           = this.listaReporteTecnicoCorrectivo[0].nSerieEquipo;
          this.tipoMaquina            = this.listaReporteTecnicoCorrectivo[0].tipoMaquina;
          this.capacidad              = this.listaReporteTecnicoCorrectivo[0].capacidad;
          this.marca                  = this.listaReporteTecnicoCorrectivo[0].marca;
          this.modelo                 = this.listaReporteTecnicoCorrectivo[0].modelo;
          this.contadorinicial        = this.listaReporteTecnicoCorrectivo[0].contadorinicial;
          this.codigobp               = this.listaReporteTecnicoCorrectivo[0].codigobp;
          this.ninventario            = this.listaReporteTecnicoCorrectivo[0].ninventario;
          this.estadoEquipo            = this.listaReporteTecnicoCorrectivo[0].estadoEquipo;

          /** =============================================
           *  ========================================= */
          //CHECKLIST ACTIVIDADES MANTENIMIENTOS
          this.obtenerDataMasterCheckList();
          /** =============================================
           *  ========================================= */
          // REPUESTOS
          this.obtenerRepuestosRequerimientos(id);
          /** =============================================
           *  ========================================= */

      }
    })
  }

  generatePDF(elementId: string): void {
    // Seleccionar el elemento HTML mediante su ID
    const content: HTMLElement | null = document.getElementById(elementId);

    // if (!content) {
    //   console.error(`Elemento con ID '${elementId}' no encontrado.`);
    //   return;
    // }

    // html2canvas(content, { scale: 2 }).then(canvas => {
    //   const pdf = new jsPDF('p', 'mm', 'a4'); // Crear un documento PDF en A4
    //   const imgData = canvas.toDataURL('image/png');
    
    //   const pdfWidth = 210; // Ancho A4 en mm
    //   const pdfHeight = 297; // Altura A4 en mm
    //   const imgWidth = pdfWidth;
    //   const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    //   if (imgHeight > pdfHeight) {
    //     // Escalar si la imagen es más alta que una página A4
    //     pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pdfHeight);
    //   } else {
    //     pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    //   }    
    //   pdf.save('reporte-tecnico.pdf');
    // });
    
  }

  listaCheckListaMantenimiento: any = [];
  obtenerDataMasterCheckList() {
    this.dataMater.obtenerDatosMasterTable('CM').subscribe({
      next: (x) => {
        this.listaCheckListaMantenimiento = x;
        // // console.warn(this.listaCheckListaMantenimiento);
      }
    })
  }

  listaEstadoEquipo: any = [];
  obtenerDataEstadoEquipo() {
    this.dataMater.obtenerDatosMasterTable('EE').subscribe({
      next: (x) => {
        this.listaEstadoEquipo = x;
        // // console.warn(this.listaEstadoEquipo);
      }
    })
  }

  listaRepuestoRequerimientos: any = [];
  obtenerRepuestosRequerimientos( id:number ) {
    this.mant.obtenerRepuestosRequerimientos(id).subscribe({
      next: (x) => {
        this.listaRepuestoRequerimientos = x;
        // // console.warn('REPUESTOS A AL REPORTECNICO')
        // // console.warn(this.listaRepuestoRequerimientos)
      }, error: (e) => {
        if( e.status != 200 ) console.error(e);
      }      
    })
  }

}
