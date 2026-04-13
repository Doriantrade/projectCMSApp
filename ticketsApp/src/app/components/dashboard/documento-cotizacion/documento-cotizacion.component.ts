import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DocumentoCotizacionService } from './services/documento-cotizacion.service';
import { Environments } from 'src/app/environments/environments';
import { EncryptService } from '../../shared/services/encrypt.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-documento-cotizacion',
  templateUrl: './documento-cotizacion.component.html',
  styleUrls: ['./documento-cotizacion.component.scss']
})
export class DocumentoCotizacionComponent implements OnInit, OnChanges {

    _show_spinner: boolean = false;
    @Input() data_cli: any;
    padId:             string = '0000000';
    ccia:              any;
    idTicket:          any;
    
    tituloCot:            string = '';
    listaCotizacion:      any    = [];
    subTotal:             number = 0;
    totalIVA:             number = 0;
    totalCotizacion:      number = 0;

    public id:            number = 0;
    public codrep:        string = '';
    public idRequer:      number = 0;
    public estado:        number = 0;
    public estado1:       number = 0;
    public cantidad:      number = 0;
    public valorFinal:    number = 0;
    public nombreEmpresa: string = '';
    public descripcionEmpresa:  string = '';
    public descripcionRepuesto: string = '';
    public direccion:     string = '';
    public cargo:         string = '';
    public nombrePersCargo: string = '';
    public logotipoUrl:     string = '';
    public textoCotizacion: string = '';
    public replegal:        string = ''; 
    public nombreMarcaEquipo: string = '';
    public nombreModeloEquipo: string = '';
    public nombreTipoDeEquipo: string = '';
    public nombreRep: string = '';
    public nserie:    string = '';    
    public nombreCliente: string = '';    
    public nombreAgencia: string = '';    
    public telf1: string = '';    
    public telf2: string = '';    
    public email: string = '';    
    fechaActual:  any;
    contadorinicial: number = 0;
    contadorfinal:   number = 0;
    ninventario:     any;
    codigobp:        any;
    iva:             any;

    firma: any;
    fechaFormateada!: string;

    dataNameForm = new FormGroup ({
      repLegal:    new FormControl(''),
      dirigido:    new FormControl(''),
      tituloPres:  new FormControl('')
    })

    constructor( private fechaService: EncryptService, 
                 private cotiza: DocumentoCotizacionService, 
                 private env: Environments ) { }

    ngOnInit(): void {
      const fechaActual = new Date();
      this.fechaFormateada = this.fechaService.formatFecha(fechaActual);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ( changes ) {
          this.padId    = this.data_cli[0].idRequerPad;
          this.idTicket = this.data_cli[0].id;
          // this.obtenerCotizacion(this.idTicket);
        }
    }

    onSubmit() {
      this.replegal      = this.dataNameForm.controls['repLegal']  .value || '';
      this.nombreCliente = this.dataNameForm.controls['dirigido']  .value || '';
      this.tituloCot     = this.dataNameForm.controls['tituloPres'].value || '';
    }

    loadImages(elements: HTMLImageElement[]): Promise<void[]> {
      return Promise.all(elements.map( img => {
        if (img.complete) {
          return Promise.resolve();
        } else {
          return new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load image at ${img.src}`));
          });
        }
      }));
    }

    buildCotizacion() {
      
    }

    generatePDF(elementId: string): void {
      this._show_spinner = true;
      const content: HTMLElement | null = document.getElementById(elementId);
      if (!content) {
        console.error(`Elemento con ID '${elementId}' no encontrado.`);
        return;
      }
    
      let xpad: any = this.padId.split('#');
    
      // Esperar a que todas las imágenes se carguen
      const images = Array.from(content.querySelectorAll('img'));
      this.loadImages(images).then(() => {
        setTimeout(() => {
          html2canvas(content, { scale: 2 }).then(canvas => {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/jpg');
      
            const pdfWidth = 210;
            const pdfHeight = 297;
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
            if (imgHeight > pdfHeight) pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pdfHeight);
            else pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
            pdf.save('cotizacion-' + xpad[1] + '.pdf');
          }).catch(error => {
            console.error('Error al generar el PDF:', error);
          }).finally(() => {
            this._show_spinner = false;
          });
        }, 500); // Espera 500ms antes de procesar el PDF
      }).catch(error => {
        console.error('Error al cargar las imágenes:', error);
        this._show_spinner = false;
      });
      
    }

  
    obtenerCotizacion( idTicket: number ) {

      // alert(idTicket)

      this.ccia = sessionStorage.getItem('ccia');
      this.cotiza.obtenerCotizacion( idTicket, this.ccia ).subscribe({
          next: (x:any) => {
            this.listaCotizacion    = x;
            this.id                 = x[0].id;
            this.codrep             = x[0].codrep;
            this.idRequer           = x[0].idRequer;
            this.estado             = x[0].estado;
            this.cantidad           = x[0].cantidad               || 0;
            this.valorFinal         = x[0].valorFinal             || 0.0;
            this.nombreEmpresa      = x[0].nombreEmpresa;
            this.descripcionEmpresa = x[0].descripcionEmpresa     || '';
            this.descripcionRepuesto = x[0].descripcionRepuesto   || '';
            this.direccion          = x[0].direccion              || '';
            this.cargo              = x[0].cargo;
            this.nombrePersCargo    = x[0].nombrePersCargo;
            this.logotipoUrl        = x[0].logotipoUrl;
            this.textoCotizacion    = x[0].textoCotizacion;
            this.replegal           = x[0].replegal;
            this.telf1              = x[0].telf1;
            this.telf2              = x[0].telf2;
            this.email              = x[0].email;
            this.nombreMarcaEquipo  = x[0].nombreMarcaEquipo;
            this.nombreModeloEquipo = x[0].nombreModeloEquipo;
            this.nombreTipoDeEquipo = x[0].nombreTipoDeEquipo;
            this.nombreRep          = x[0].nombreRep            || '--';
            this.nserie             = x[0].nserie               || '--';
            this.nombreCliente      = x[0].nombreCliente        || '--';
            this.nombreAgencia      = x[0].nombreAgencia        || '--';
            this.contadorinicial    = x[0].contadorinicial      || 0;
            this.contadorfinal      = x[0].contadorfinal        || 0;
            this.ninventario        = x[0].ninventario          || '--';
            this.codigobp           = x[0].codigobp             || '--';
            this.fechaActual        = new Date();
            this.firma              = this.env.apiCMSfile+x[0].firmaRepLegal;
            this.iva                = x[0].iva
          }, complete: () => {
            let ivaDeduc: any = ((this.iva/100)+1);
            this.listaCotizacion.forEach((cotiza: any) => {
              cotiza.preUnitarioSinIva = (cotiza.valorFinal / cotiza.cantidad) / ivaDeduc;
              cotiza.totalSinIva       = cotiza.valorFinal / ivaDeduc;
            });
            // Calculamos el subTotal sumando todos los valores de totalSinIva
            this.subTotal = this.listaCotizacion.reduce((sum: number, cotiza: any) => sum + cotiza.totalSinIva, 0);
            // Calculamos el IVA
            this.totalIVA = this.subTotal * 0.15;
            // Calculamos el total de la cotización
            this.totalCotizacion = this.subTotal + this.totalIVA;
          }, error: (e) => {
            console.error(e);
          }
        })
    }

}

