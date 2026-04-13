
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { KardexTransferenciasService } from './services/kardex-transferencias.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { FormControl, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-kardex-transferencia',
  templateUrl: './kardex-transferencia.component.html',
  styleUrls: ['./kardex-transferencia.component.scss']
})
export class KardexTransferenciaComponent implements OnInit {
  pMod: number = 4;

  ccia:               any;
  _show_spinner:      boolean = false;
  _cancel_button:     boolean = false;
  _icon_button:       string  = 'add';
  _action_butto:      string  = 'Crear';
  listacabecera:  any = [];
  listamovimientos: any = [];
  listadetalletrans: any = [];
  searchTerm: string = '';

  /** VARIABLES CABECERA */
  user_transfer: string = 'sin datos';
  fecha_transfer: any = new Date();
  serie_transfer: string = '00000000000';
  empresa_transfer: string = 'sin datos';
  cedulaUsuario: string = 'sin datos';
  bodegaEntrada: string = 'sin datos';
  bodegaSalida: string = 'sin datos';
  observacion: string = 'sin datos';
  nombre: string = 'ORDEN DE TRANSFERENCIA';
  _color_transfer: string = 'steelblue';

  @ViewChild('pdfContent') pdfContent!: ElementRef;
  @ViewChild('myTable') myTable!: ElementRef;
 
  movimientoForm = new FormGroup({
    tipomovimiento: new FormControl(''),    
  })

  constructor( private kardexTransferencias: KardexTransferenciasService ) { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.ccia = sessionStorage.getItem('codcia');
    // this.obtenerKardexCacbecera();
    this.obtenerInvMov();
  }

  obtenerKardexCacbecera(ccab:string) {
    this.kardexTransferencias.obtenerReportecabecera(this.ccia, ccab).subscribe({
      next: ( cabecera ) => {
        this.listacabecera = cabecera;
        console.warn(this.listacabecera);
        let serieString:string = this.listacabecera[0].serie.trim().padStart(10, '0');
        this.serie_transfer = this.listacabecera[0].tipo + '-' + serieString;
        this.user_transfer = this.listacabecera[0].usuarioEncargado;
        this.fecha_transfer = this.listacabecera[0].fechaCreacion;
        this.empresa_transfer = this.listacabecera[0].nombreEmpresa;
        this.cedulaUsuario = this.listacabecera[0].cedulaUsuario;
        this.bodegaEntrada = this.listacabecera[0].bodegaEntrada;
        this.bodegaSalida = this.listacabecera[0].bodegaSalida;
        this.nombre = this.listacabecera[0].nombre;
        this.observacion = this.listacabecera[0].observacion;

        if( this.serie_transfer.slice(0,1) == 'E' ) {
          this._color_transfer = 'yellowgreen';
        } else if ( this.serie_transfer.slice(0,1) == 'S' ) {
          this._color_transfer = 'orange';
        }

        this.obtenerDetalle(ccab);

      }
    })
  }

  filterRadioMovimiento() {
    this.listamovimientos= [];
    let narray: any = [];
    this.listamovimientosghost.filter((element:any)=>{
      if( this.movimientoForm.controls['tipomovimiento'].value == element.tipomov ) { 
        narray = {            
          "codmov": element.codmov,
          "codtrancab": element.codtrancab,
          "feccrea": element.feccrea,
          "tipomov": element.tipomov,
          "movcab": element.movcab,
          "state": element.state,
          "color": 'yellowgreen'        
        }        
        if( narray.tipomov == 'E' )      narray.color = 'yellowgreen'; 
        else if( narray.tipomov == 'S' ) narray.color = 'orange';
        this.listamovimientos.push(narray);         
      }

      else if (this.movimientoForm.controls['tipomovimiento'].value == 'A') {
        this.listamovimientos= [];
        this.listamovimientosghost.filter((element:any)=>{
            narray = {            
              "codmov":     element.codmov,
              "codtrancab": element.codtrancab,
              "feccrea":    element.feccrea,
              "tipomov":    element.tipomov,
              "movcab":     element.movcab,
              "state":      element.state,
              "color":      'yellowgreen'        
            }
          
            if( narray.tipomov == 'E' )      narray.color = 'yellowgreen'; 
            else if( narray.tipomov == 'S' ) narray.color = 'orange';
            this.listamovimientos.push(narray);
          
          })
      }
    
    })    
 
  }

  downloadPDF(titulo: any) {
    const doc = new jsPDF();
  
    const canvas = document.createElement('canvas');
    canvas.width = this.pdfContent.nativeElement.offsetWidth;
    canvas.height = this.pdfContent.nativeElement.offsetHeight;
    
    const htmlElement = this.pdfContent.nativeElement;
    
    html2canvas(htmlElement).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      
      // Use a promise to wait for the image to load before continuing
      const loadImage = (src: string) => {
        return new Promise((resolve, reject) => {
          const img:any = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };
  
      loadImage(imgData).then((img:any) => {
        const imgWidth = doc.internal.pageSize.getWidth();
        const imgHeight = img.height * imgWidth / img.width;
        let offset = 0;
  
        // Add each page to the PDF
        while (offset < img.height) {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          // canvas.height = Math.min(img.height - offset, imgHeight);
          canvas.height = 1750
          
          const context: any = canvas.getContext('2d');
  
          context.drawImage(img, 0, offset, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
          const imgDataResized = canvas.toDataURL('image/png');
          
          doc.addImage(imgDataResized, 'PNG', 0, 0, imgWidth, 0, undefined, 'FAST');
          offset += canvas.height;
  
          if (offset < img.height) {
            // doc.moveTo(0, 100);
            doc.addPage();
          }
        }
  
        doc.save(titulo + '.pdf');
      });
    });
  }

  listamovimientosghost:any = [];
  obtenerInvMov() {

    this.listamovimientos= [];
    this.kardexTransferencias.obtenerMonInv().subscribe({
      next: (movimientos) => {
        this.listamovimientosghost = movimientos;
        this.listamovimientosghost.filter((element:any)=>{

          let array = {
            
              "codmov": element.codmov,
              "codtrancab": element.codtrancab,
              "feccrea": element.feccrea,
              "tipomov": element.tipomov,
              "movcab": element.movcab,
              "state": element.state,
              "color": 'yellowgreen'
            
          }

          if( array.tipomov == 'E' )      array.color = 'yellowgreen'; 
          else if( array.tipomov == 'S' ) array.color = 'orange';



          this.listamovimientos.push(array)


        })

        console.warn(this.listamovimientos);
        
      }
    })
  }


  obtenerDetalle( codcab:string ) {

    console.log(codcab);

    this.kardexTransferencias.obtenerDetalle(codcab).subscribe({
      next: (detalletran) => {
        this.listadetalletrans = detalletran;
        console.log(this.listadetalletrans);
      }, error: (e) => {
        console.error(e)
      }
    })
  }
  listamovimientosG2:any = [];
  filterMovimientos() {    
    this.listamovimientos= [];
    let narray: any = [];
    if (this.searchTerm) {
      this.listamovimientosG2 = this.listamovimientosghost.filter( (movimiento:any) => 
        movimiento.codtrancab.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        movimiento.feccrea.toString().toLowerCase().includes(this.searchTerm.toLowerCase()) );


      this.listamovimientosG2.filter((element:any)=>{

        let array = {            
          "codmov":     element.codmov,
          "codtrancab": element.codtrancab,
          "feccrea":    element.feccrea,
          "tipomov":    element.tipomov,
          "movcab":     element.movcab,
          "state":      element.state,
          "color":      'yellowgreen'
        }

        if      ( array.tipomov == 'E' ) array.color = 'yellowgreen';
        else if ( array.tipomov == 'S' ) array.color = 'orange';
        this.listamovimientos.push(array);
    
      } 
    )        

    } else {

      this.listamovimientosghost.filter((element:any) => {
          narray = {            
              "codmov": element.codmov,
              "codtrancab": element.codtrancab,
              "feccrea": element.feccrea,
              "tipomov": element.tipomov,
              "movcab": element.movcab,
              "state": element.state,
              "color": 'yellowgreen'        
            }
          
            if( narray.tipomov == 'E' )      narray.color = 'yellowgreen'; 
            else if( narray.tipomov == 'S' ) narray.color = 'orange';
            this.listamovimientos.push(narray);
          
          })


    }
  }


}
