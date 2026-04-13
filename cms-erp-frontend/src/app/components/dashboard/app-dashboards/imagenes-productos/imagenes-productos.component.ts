import { Component, Input, OnInit } from '@angular/core';
import { ImagecontrolService } from 'src/app/components/shared/image-control/services/imagecontrol.service';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import Swal from 'sweetalert2'
import { MaquinariaService } from '../maquinaria/services/maquinaria.service';
import { MarcarepService } from '../repuestos/creador-marca-repuesto/services/marcarep.service';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
})


@Component({
  selector: 'app-imagenes-productos',
  templateUrl: './imagenes-productos.component.html',
  styleUrls: ['./imagenes-productos.component.scss']
})
export class ImagenesProductosComponent implements OnInit {

  _IMGE:              any;
  _IMGE_REP:              any;
  _show_spinner:      boolean = false;
  @Input() modulo:    any = [];
  pMod: number = 4;
  tipoMaquinaLista:   any = [];
  maquinariaModel:    any = [];
  _view_grupo:        boolean= false;
  elementoActivo:     any = null;
  modeloActivo:       any = null;
  marcaActiva:        any = null;
  grupolista:         any = [];
  public file_rep!:   File;
  public file!:       File;
  imagenModel:        any = [];
  codigoMaquina:      string = '';
  maquimg:            any = [];
  _validate_img:      boolean = true;
  _validate_img_rep:  boolean = true;
  nameFile:           string = '';
  public fileId:      any;
  maquina:            string = '';
  sgrupolista:        any = [];
  modelo:             string = '';

  codecEntidadImagen: string = '';
  codmarca:           any;
  codmodelo:          any;
  nombreModelo:       any;
  codtipomaquina:     any;
  codec:              any;
  codec_REP:              any;

  listaTipoRepuestos: any;
  listaTipoRepuestosGhost: any;

  constructor( private DataMaster: SharedService,
               private fileserv:   ImagecontrolService,
               private maq:        MaquinariaService,
               private rep:        MarcarepService  ) { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;
    this.getDataMaster('MQT');
    this.obtenerTipoRepuestos();
  }

  getDataMaster(cod:string) {
    this.DataMaster.getDataMaster(cod).subscribe({
      next: (data) => {
        switch(cod) {
          case 'MQT':
            this.tipoMaquinaLista = data;
            break;
        }
      }
    })
  }


  obtenerTipoRepuestos() {

    this.rep.obtenerMarcaRep().subscribe({
      next: (x) => {
        this.listaTipoRepuestos = x;
        this.listaTipoRepuestosGhost = x;
        console.warn(this.listaTipoRepuestos);
      }
    })

  }

  _view_modelo_marca_rep: boolean = false;
  listaModeloMarcaRepuestos: any = [];
  idMarcaRep: any;
  obtenerModeloMarcaRepuestos(idMarcaRep: number) {
    this.idMarcaRep = idMarcaRep;
    this.rep.obtenerModeloMarcaRepuestos(idMarcaRep).subscribe({
      next: (x) => {
        this.listaModeloMarcaRepuestos =x;
        console.warn(this.listaModeloMarcaRepuestos);
        this._view_modelo_marca_rep = true;
      }
    })
  }

  obtenerImagen() {
  
    this.fileserv.obtenerImagenCodBinding(this.codec, 'Maquinaria').subscribe({
      next: (imagen:any) => {
        if (imagen.length === 0) {
          this._IMGE = ''; 
        } else {
          this._IMGE = imagen[0].imagen; 
        }
      }
    })
  
  }


  obtenerImagenRep(codec: string) {
    this.fileserv.obtenerImagenCodBinding(codec, 'Repuestos').subscribe({
      next: (imagen: any) => {
        console.warn(imagen);
        if (imagen.length === 0) {
          this._IMGE_REP = '';
        } else {
          this._IMGE_REP = imagen[0].imagen;
        }
      },
      error: (e) => {
        console.error(e);
      }
    });
  
  }
  
  guardarImagenProdcuto(type: string) {

    this._show_spinner = true;
    this.maquimg = {
      "codmaquina": this.codec,
      "img":        this._IMGE,
      "type":       type
    }

    this.maq.guardarImagenMaquinaria(this.maquimg).subscribe(
      {
        next: (x) => {
          console.log(x);
          Toast.fire({ icon: 'success', title: 'Imagen generada exitosamente' })
        },
        error: (e) => {
          console.error(e);
          this._show_spinner = false;
          Toast.fire({ icon: 'error', title: 'No se ha podido generar esta imagen' })
        }, complete: () => this._show_spinner = false
      }
    )

  }

  guardarImagenRepuesto( type: string) {

    this._show_spinner = true;
    this.maquimg = {
      "codmaquina": this.codec_REP,
      "img":        this._IMGE_REP,
      "type":       type
    }

    this.maq.guardarImagenMaquinaria(this.maquimg).subscribe(
      {
        next: (x) => {
          console.log(x);
          Toast.fire({ icon: 'success', title: 'Imagen generada exitosamente' })
        },
        error: (e) => {
          console.error(e);
          this._show_spinner = false;
          Toast.fire({ icon: 'error', title: 'No se ha podido generar esta imagen' })
        }, complete: () => this._show_spinner = false
      }
    )

  }

  validarImagen() {    
    if( this._IMGE == '' || this._IMGE == undefined || this._IMGE == null ) this._validate_img = true;
    else this._validate_img = false;
  }

  validarImagen_rep() {    
    console.warn( 'IMAGE: ' + this._IMGE_REP );
    console.warn( '====================================================');
    if( this._IMGE_REP == '' || this._IMGE_REP == undefined || this._IMGE_REP == null ) this._validate_img_rep = true;
    else this._validate_img_rep = false;

    console.warn('this._validate_img_rep: ' + this._validate_img_rep);

  }

  encodeImageFileAsURL() {
  
    this._show_spinner = true;
    const filesSelected: any = document.getElementById('fileUp2') as HTMLInputElement;
    
    this.fileId = filesSelected.files;
    
    let s = this.fileId[0].name.split('.');
    this.nameFile = s[0];
    let base;
    
    if (this.fileId.length > 0) {
      const fileToLoad: any = filesSelected[0];
      const fileReader: any = new FileReader();
      fileReader.onload = () => {
        base = fileReader.result;
      };
      fileReader.onloadend = () => {
        this._IMGE = fileReader.result;
        console.log(this._IMGE);
        this.validarImagen();
      };
      fileReader.readAsDataURL(this.fileId[0]);
      this._show_spinner = false;
    }
  
  }

  encodeImageFileAsURLRep() {
  
    this._show_spinner = true;
    const filesSelected: any = document.getElementById('fileUp3') as HTMLInputElement;
    
    this.fileId = filesSelected.files;
    
    let s = this.fileId[0].name.split('.');
    this.nameFile = s[0];
    let base;
    
    if (this.fileId.length > 0) {
      const fileToLoad: any = filesSelected[0];
      const fileReader: any = new FileReader();
      fileReader.onload = () => {
        base = fileReader.result;
      };
      fileReader.onloadend = () => {
        this._IMGE_REP = fileReader.result;
        console.log(this._IMGE_REP);
        this.validarImagen();
      };
      fileReader.readAsDataURL(this.fileId[0]);
      this._show_spinner = false;
    }
  
  }

  enviarAlDataListen(data:any) {
    
    this.maquinariaModel = {
      codtipomaquina: data.codigo.trim(),
      codmaquina: data.nombre,
      modulo: 'maquinaria',
      state: 2
    };

    this.maquina = data.nombre;
    this.codigoMaquina = data.codigo.trim();
    this.getGrupos(this.codigoMaquina);

  }

  getGrupos(grupo:string) {
    this.grupolista  = [];
    this.sgrupolista = [];
    this._view_grupo = true;
    this.DataMaster.getDataMasterGrupo(grupo.trim()).subscribe({
      next:( grupo ) => {
        this.grupolista = grupo;
      }
    })
  }

  onFileSelected(event: any): void {
    this.file = event.target.files[0];
  }
  
  onFileSelectedRepuestos(event: any): void {
    this.file_rep = event.target.files[0];
    console.log(this.file_rep);
    setTimeout(() => {
      this.validarImagen_rep()
    }, 500);
  }

  getSubgrupos(subgrupo:string) {
    this.modelo = subgrupo;
    this.DataMaster.getDataMasterSubGrupo(this.codigoMaquina, subgrupo.trim()).subscribe({
        next:( sgrupo ) => {
          this.sgrupolista = sgrupo;
        }
      }
    )
  }


  getCodecModeloRepuestos( codec: any ) {
    this.codec_REP = this.idMarcaRep + '-' +  codec;
    this.obtenerImagenRep(this.codec_REP);
  }

  obtenerCodigos( data:any ) {
    this.codtipomaquina = data.codigotipomaq;
    this.codmarca       = data.codmarca;
    this.codmodelo      = data.codmodelo;
    this.nombreModelo   = data.modelo;
    this.codec = this.codtipomaquina.trim()+'-'+this.codmarca.trim()+'-'+this.codmodelo.trim();
    return this.codec;
  }

}
