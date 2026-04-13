import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ModalClientesComponent } from '../../bodegas/crear-bodegas/modal-clientes/modal-clientes.component';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MaquinariaContratoComponent } from '../maquinaria-contrato/maquinaria-contrato.component';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { GarantiasService } from '../services/garantias.service';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-contratos',
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss']
})
export class ContratosComponent implements OnInit {
  pMod: number = 4;


  @Input() modulo: any = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('pdfContent') pdfContent!: ElementRef;

  @ViewChild(MatPaginator)
  paginatorC!: MatPaginator;
  public dataSourceC!: MatTableDataSource<any>;

  columnHead:     any = [ 'Fec. Inicial', 
                          'Fec. Final', 'Usuario a Cargo',
                          'Cliente', 'Rep. Legal',
                          'textestado' ];

  ccia:           any;
  _show_spinner:  boolean = false; 
  _icon_button:   string  = 'add';
  _action_butto:  string  = 'Crear';
  _cancel_button: boolean = false;
  _delete_show:   boolean = true;
  codcontrato:    string  = '';
  _antecedentes:  string  = 'LA COOPERATIVA, es una institución financiera creada mediante acuerdo'
                  +'ministerial No. 0836 del 27 de mayo de 1996 y debidamente autorizada su funcionamiento por la'
                  +'Superintendencia de Bancos y Seguros según resolución No SBS-2006-707, regulada en la actualmente por la'
                  +'Superintendencia de Economía Popular y Solidaria mediante oficio ....';

  _cuartaObjeto: string = ' contrata los servicios de El Contratista con la finalidad de que realice un mantenimiento bimensual, preventivo y periódico de equipos de conteo que se realizara en sitio, y que consiste en la limpieza general, extracción de polvo interno del equipo, limpieza de rodamientos, chequeo y ajuste de bandas, resortes, filtros, calibración y ajustes mecánicos, detallándose los equipos a dar mantenimiento de las siguiente manera:'

  listresultclient: any = [];
  nombrecliente:    string = '';
  replegal:         string = '';
  ruc:              string = '';
  tipoContribuyente:string = '';
  _marginbott_Cuarta = 0;
  nombrePago:       string = '';
  correopago:       string = '';
  descripcion:      string = '';
  telfpago:         string = '';
  listMaqAgregadas: any = [];
  nombreMantenimiento:string = '';
  correomantenimiento:string = '';
  telfclimanteni:   string = '';
  cantonLista:      any = [];
  tag:              any='tag del cliente';
  provinciaLista:   any = [];
  article:          string = '';
  _footer:          string = ' Benigno Malo 9-75 entre Gran Colombia y Simón Bolívar, Teléfono (593) 7 2833255 / Cuenca - Ecuador ';
  subj='';
  _cliente:         string = '';
  _add_dis = ' Adicional se irán incorporando la cantidad de equipos, los equipos que pierdan la garantía de mantenimiento preventivo. '
           + ' Se llevará el control por escrito del mantenimiento realizado en caso de darse alguna situación especial se '
           + ' presentara un informe adicional.'
  
  _obligaciones_contrat = ' Se llevará el control por escrito del mantenimiento realizado en caso de darse alguna situación especial se presentara un informe adicional. '
                        + ' En virtud de la celebración del presente contrato, El Contratista tiene las siguientes obligaciones con ';
  
  _margintop_2dapagina = 25;

  obligacionesContratistaLista = [
    {
      description: 'Designar un canal de atención técnica, con el fin de que los usuarios puedan solicitar mantenimiento preventivo o correctivo de manera directa.'
    }, 
    {
      description: 'Acudir de manera inmediata al llamado de '+this.subj+' '+this.tag+' en caso de que el/los equipos presenten alguna irregularidad o emergencia, aspecto que de influir en el cronograma generado ocasionara la aprobación de un nuevo cronograma.'
    }, 
    {
      description: 'EL CONTRATISTA está en la obligación de dar el nombre, números telefónicos de celular y/o convencional, y dirección exacta de los profesionales capacitados para dar soporte técnico mantenimientos preventivos y correctivos de los Equipos de Conteo descritos anteriormente de propiedad de '+this.subj+' '+this.tag
    }, 
    {
      description: 'Los profesionales deberán acudir de manera inmediata a las instalaciones en donde se presente alguna eventualidad o emergencia.'
    }, 
    {
      description: 'Realizar un informe después de cada mantenimiento detallando el o los trabajos realizados.'
    }, 
    {
      description: 'Realizar un informe después de cada mantenimiento con la recomendación de remplazo del equipo de ser el caso.'
    }, 
    {
      description: 'El contratista atenderá las incidencias generadas en base a una categorización.'
    }
  ]

  public agenciaForm = new FormGroup({
    nomProv:        new FormControl(''),
    nomCant:        new FormControl(''),
  })

  public fechaForm = new FormGroup({
    fechaFirma:        new FormControl(),
  })

  constructor( private contratos: GarantiasService, public dialog: MatDialog, private DataMaster: SharedService ) { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.ccia = sessionStorage.getItem('codcia');
    this.getDataMaster('PRV00');
    this.obtenerContratos();
  }

  obtenerAntecedentes(data:any) {
    this._antecedentes = data;
    return this._antecedentes;
  }

  obtenerAdicional(data:any) {
    this._add_dis = data;
    return this._add_dis;
  }

  obtenerCuartaObjeto(data:any) {
    this._cuartaObjeto = data;
    return this._cuartaObjeto;
  }

  obtenerObligContra(data:any) {
    this._obligaciones_contrat = data;
    return this._obligaciones_contrat;
  }

  obtenerMargenQuinta(data:any) {
    this._margintop_2dapagina = data;
    return this._margintop_2dapagina;
  }

  opernDialogMachinesContract():void {
    const dialogRef = this.dialog.open( MaquinariaContratoComponent, 
      {
        height: '600px',
        width:  '50%',
        data:   '', 
      }
    );

    dialogRef.afterClosed().subscribe( result => {
      this.listMaqAgregadas = result;
    })

  }

  listaContrato:any = [];
  listaContratoGhost:any = [];
  obtenerContratos() {

    let controlFecha = new Date();
    let dia = controlFecha.getDay();
    let mes = controlFecha.getMonth() + 1;
    let anio = controlFecha.getFullYear();
    let diaActual = anio+'-'+mes.toString().padStart(2, '0')+'-'+dia.toString().padStart(2,'0');
    
    // console.log(diaActual)

    this.listaContrato = [];
    this.listaContratoGhost = [];
    this.contratos.obtenerContratos(this.ccia).subscribe({
      next: (contrato) => {
        
        this.listaContratoGhost = contrato;
        this.listaContratoGhost.filter((element:any)=>{          

          const arraycont  = {
            "usuarioCargo": element.usuarioCargo,
            "nombre":       element.nombre,
            "replegal":     element.replegal,
            "codcontrato":  element.codcontrato,
            "descripcion":  element.descripcion,
            "fecinicial":   element.fecinicial,
            "fecfinal":     element.fecfinal,
            "estado":       element.estado,
            "textestado":   '',
            "colorestado":  '',
            "colorText":    ''
          }
          
          let fechafinal = element.fecfinal.toString().split('T')

          if( diaActual > fechafinal[0] ) {
            element.estado = 0;
          }

          if( element.estado == 1 ) {
            arraycont.textestado = 'Activo';
            arraycont.colorestado = 'yellowgreen';
            arraycont.colorText   = 'whitesmoke';
          }

          else if( element.estado == 0 ) {
            arraycont.textestado = 'No Activo';
            arraycont.colorestado = 'orange';
            arraycont.colorText   = 'gray';
          }

          this.listaContrato.push(arraycont);

        })
        console.warn(this.listaContrato);
      },
      error: (e) => {
        console.error(e);
      },
      complete: () => {
        this.dataSourceC = new MatTableDataSource(this.listaContrato);
        this.dataSourceC.paginator = this.paginatorC;
        this._show_spinner = false;
      }
    })

  }

  openDialog(): void {

    const reasignData = {
      estado: 2
    }

    const dialogRef = this.dialog.open( ModalClientesComponent, {
      height: '600px',
      width: '50%',
      data: reasignData, 
    });

    dialogRef.afterClosed().subscribe( result => {
      
      this.listresultclient = result;
      this.nombrecliente = this.listresultclient.nombre;
      this.replegal = this.listresultclient.replegal;
      this.ruc = this.listresultclient.ruc;
      this.tipoContribuyente = this.listresultclient.tipoContribuyente;
      this.nombrePago = this.listresultclient.nombrePago;
      this.correopago = this.listresultclient.correopago;
      this.descripcion = this.listresultclient.descripcion;
      this.telfpago = this.listresultclient.telfpago;
      this.nombreMantenimiento = this.listresultclient.nombreMantenimiento;
      this.correomantenimiento = this.listresultclient.correomantenimiento;
      this.telfclimanteni = this.listresultclient.telfclimanteni;
      
      if (this.nombrecliente.includes('COOPERATIVA')) {
        this.article = 'LA';
        this.subj = 'DE'
      } else if (this.nombrecliente.includes('BANCO')) {
        this.article = 'DEL';
        this.subj = ''
      } else {
        this.article = '';
        this.subj = ''
      }

    });

  }

  obtenerMargenCuarta(data:any) {
    this._marginbott_Cuarta = data;
    return this._marginbott_Cuarta;
  }

  getDataMaster(cod:string) {
    this.DataMaster.getDataMaster(cod).subscribe(
      {
        next: (data) => {
          switch(cod) {
            case 'PRV00':
              this.provinciaLista = data;
              break;
          }
        }
      }
    )
  }

  getCantones() {
    this.DataMaster.getDataMaster(this.agenciaForm
                   .controls['nomProv'].value)
                   .subscribe(
                      {
                        next: (cantones) => {
                          this.cantonLista = cantones;
                          console.warn( this.cantonLista );
                        }, 
                        error: (e) => {
                          console.error(e);
                        }
                      }
                  )
  }

  fechacontrato:any;
  obtenerFecha() {
    this.fechacontrato = this.fechaForm.controls['fechaFirma'].value
  }

  nombreCanton:string = '';
  obtenerCanton() {
    this.nombreCanton = this.agenciaForm.controls['nomCant'].value
  }

  obtenerTag(value:any) {
    this.tag = value;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceC.filter = filterValue.trim().toLowerCase();
  }

  onSubmit() { }

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


}
