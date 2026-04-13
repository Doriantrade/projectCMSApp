import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { EncryptService } from '../services/encrypt.service';
import { Environments } from 'src/app/environments/environments';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, OnChanges {

  @Output() datafilter: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Input() clienteData: any;
  @Input() listenTicketTableHelpDesk: any;

  urlIconCli: any = this.env.apiCMSfile+ 'icon-cliente/'
  nombreCliente: string = '';
  imagenCliUrl: any;

  _cli_view: boolean = false;
  role: any;

  public exportdataform = new FormGroup({
    filter:              new FormControl('')
  })

  constructor(private ncrypt: EncryptService,private env: Environments,private cdr: ChangeDetectorRef ) { }

  ngOnInit(): void {
    this.getToken()
    let x: any = localStorage.getItem('id-cliente-escogido');
    setInterval(() => {
      let y: any = localStorage.getItem('nombre-cliente-escogido');
      let z: any = localStorage.getItem('imagen-cli');
      this.nombreCliente = y;
      this.imagenCliUrl = z;
    }, 700);

   }

   

  getToken() {
  
    let xtoken:any = sessionStorage.getItem('token');
    const xtokenDecript: any = this.ncrypt.decryptWithAsciiSeed(xtoken, this.env.es, this.env.hash);
    if (xtokenDecript != null || xtokenDecript != undefined) {
        var decoded:any = jwtDecode(xtokenDecript);
      this.role                  = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      if(this.role == 'R004') {
        this._cli_view = false;
      }

      else if(this.role == 'R003') {
        this._cli_view = true;
      }

    }
  
  }

ngOnChanges(changes: SimpleChanges): void {
  if (changes) {

    if (this.listenTicketTableHelpDesk) {
      this.exportdataform.controls['filter'].setValue(Number(this.listenTicketTableHelpDesk.replace('MC-','')).toString());
      this.filterTicketList();
    }
    if ( this.exportdataform.controls['filter'].value == '0' ) {
      this.exportdataform.controls['filter'].setValue('');
    } 

    if (this.clienteData) {
      this.nombreCliente = this.clienteData.nombre;
      const imagen = this.clienteData.imagen;
      // Verificamos si el nombre de la imagen ya incluye una extensión
      if (imagen && (imagen.toLowerCase().includes('.png') || imagen.toLowerCase().includes('.jpg'))) {
        // Si tiene la extensión, concatenamos la URL base
        this.imagenCliUrl = this.urlIconCli + imagen;
        localStorage.setItem('imagen-cli', this.imagenCliUrl);
      } else {
        // Si no tiene la extensión (o es null/undefined), lo asignamos directamente
        this.imagenCliUrl = imagen;
      }
    }
    }
  }

  onSubmitData() { }

  filterTicketList() {
    let filter: any = this.exportdataform.controls['filter'].value;
    this.datafilter.emit(filter);
    setTimeout(() => {
      this.exportdataform.controls['filter'].setValue('');
    }, 1000);
  }



}
