import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ImagecontrolService } from './services/imagecontrol.service';
import Swal from 'sweetalert2'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SharedService } from '../services/shared.service';
import Compressor from 'compressorjs';

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
  selector: 'app-image-control',
  templateUrl: './image-control.component.html',
  styleUrls: ['./image-control.component.scss']
})
export class ImageControlComponent implements OnInit, OnChanges  {
  public _IMGE:       any;
  public imagenLista: any = [];
  public imagenModel: any = [];
  public file!: File;
  _show_spinner: boolean = false;
  constructor( private fileserv: ImagecontrolService, private DataMaster: SharedService, private sanitizer: DomSanitizer ) { }
  @Input() datalisten: any = [];
  @Input() modulo: any = [];
  
  ngOnInit(): void {
    if( this.datalisten.modulo == 'Perfil' ) {
      let xcoduser: any = sessionStorage.getItem('UserCod');
      this.obtenerImagen( 'IMG-'+xcoduser, 'Perfil');
    }
  }

  showbtnperfil: boolean = false
  tipomaquina: string = '';
  codigoMaquina: string = '';

  disbtnimg: boolean = true;

  ngOnChanges(changes: SimpleChanges) {

    console.warn('DATA EMITTER')
    console.warn(this.datalisten)

    if( changes['datalisten'] ) {
      switch( this.datalisten.modulo ) {
        case 'Maquinaria':
          // alert('Estas accediendo desde Maquinaria');
          if( this.datalisten.state == 1 ) {
            console.warn('Va a guardar la imagen');
            this.codigoMaquina = this.datalisten.codmaquina;
            this.tipomaquina   = this.datalisten.modulo;
            this.obtenerImagen(this.codigoMaquina, this.tipomaquina );
            this.validateaccion(this.datalisten.accion);
          }
          else if ( this.datalisten.state == 2 ) {
            console.log('Va a leer la imagen');
            this.codigoMaquina = this.datalisten.codmaquina;
            this.tipomaquina   = this.datalisten.modulo;
            this.obtenerImagen(this.codigoMaquina, this.tipomaquina );
          }
          break;
        case 'Perfil':
          this.showbtnperfil = true;
          if( this.datalisten.state == 1 ) {
            this.codigoMaquina = this.datalisten.codmaquina;
            this.tipomaquina   = this.datalisten.modulo;
            this.obtenerImagen( this.codigoMaquina, this.tipomaquina );
            this.validateaccion(this.datalisten.accion);
          }
          else if ( this.datalisten.state == 2 ) {
            let xcoduser: any = sessionStorage.getItem('UserCod');
            this.obtenerImagen( xcoduser, 'Perfil' );
          }
          break;
      }
    } 
  }

  validacionHayImagen() {
    if( this.datalisten.modulo == 'Perfil' ) {
      if( this._IMGE == undefined || this._IMGE == null || this._IMGE == ''  ) {
        this.disbtnimg = true;
      }
      else {
        this.disbtnimg = false;
      }
    }
  }


  validateaccion(state:number) {
    switch(state) {
      case 1:
        this.guardarImgFileDB();
        break;
      case 2:
        this.editarImgFileDB();
        break;
      case 3:

        if( this.imgList.length == 0 ) {
          alert('No hay imagen de perfil de usuario');
          this.guardarImgFileDB();
        } else {
          alert('Si hay imagen de perfil de usuario');
          this.editarImgFileDB();
        }

        break;
    }
  }

  nameFile: string = '';
  public fileId: any;
  async encodeImageFileAsURL(): Promise<void> {
    console.warn('Estoy utilizando el encodeImageFileAsURL');
    this._show_spinner = true;
    
    const filesSelected = document.getElementById('fileUp') as HTMLInputElement;
    if (!filesSelected.files || filesSelected.files.length === 0) {
        this._show_spinner = false;
        return;
    }

    const file = filesSelected.files[0];
    let s = file.name.split('.');
    this.nameFile = s[0];

    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            this._IMGE = event.target?.result as string;
            this.validacionHayImagen();
            this._show_spinner = false;
            resolve();
        };
        fileReader.onerror = (error) => {
            this._show_spinner = false;
            reject(error);
        };
        fileReader.readAsDataURL(file);
    });
  }

  // Función para convertir base64 a Blob
  base64ToBlob(base64: string, mimeType: string): Blob {
      const byteString = atob(base64.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);

      for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ab], { type: mimeType });
  }

  onFileSelected(event: any): void {
    this.file = event.target.files[0];
  }

  recibirModulo(modulo: any) {}

  uploadServerFile() {
    this.guardarImgFileDB();
    this.fileserv.uploadFile(this.file, this.nameFile).subscribe({
      next: (x) => {
        console.log(x);
      }, error: (e) => {
        console.error(e);
      }, complete: () => {
      }
    })  
  
  }

  imgList: any = [];
  url: any;
  // obtenerUrlImagenServer() {
  //   this.fileserv.getImageControl('maquina1').subscribe({
  //     next: (url:any) => {        
  //       this.urlList = url;
  //       this.url = this.sanitizer.bypassSecurityTrustUrl(this.urlList.url+'/maquina1.jpg');        
  //     }
  //   })
  // }
  codEditarImagen: string = '';
  obtenerImagen(codBinding:string, tipo:string) {
    this._show_spinner = true;
    let codm : any = codBinding;
    if( this.datalisten.modulo == 'Maquinaria' ) codm = codBinding.replace('MAQ-','IMG-MAQ-')
    this.fileserv.obtenerImagenCodBinding(codm, tipo).subscribe({
      next: (img) => {
        this.imgList = img;
      }, error: (e) => {
        this._show_spinner = false;
        console.error(e);
      }, complete: () => {        
        this.imgList.filter( (element:any) => {
          if(element.codentidad == codm) {
            this._IMGE = element.imagen;
            this.codEditarImagen = element.codentidad;
          }
        })
        this._show_spinner = false; 
      }
    })
  }


  guardarImgFileDB() {
    this._show_spinner = true;    
    let token: string = '';
    switch(this.datalisten.modulo) {

      case 'Maquinaria':
        // alert('Estas enviando una imagen de maquinaria')
        token = 'IMG-'+this.codigoMaquina.trim();
        this.imagenModel = {
          codentidad: token,
          imagen:    this._IMGE,
          tipo:       this.datalisten.modulo
        }

        // console.log('ESTE ES EL MODELO A GUARDAR');
        console.log(this.imagenModel);

        break;
      case 'Perfil':
        let xcoduser: any = sessionStorage.getItem('UserCod');
        token = 'IMG-'+ xcoduser.trim();
        // alert('Estas enviando una imagen de perfil')
        this.imagenModel = {
          codentidad: token,
          imagen:     this._IMGE,
          tipo:       'Perfil'
        }
        break;

    }
    
    this.fileserv.guardarImgFile( this.imagenModel ).subscribe({
      next: (x) => {
        // console.log('LA IMAGEN GUARDADO')
        this._show_spinner = false;
        Swal.fire(
          'Imagen agregada',
          'Imagen de La máquina se ha guardado con éxito',
          'success'
        ) 
      }, error: (e) => {
        console.error(e);
        this._show_spinner = false;
      }, complete: () => {
        if(this.datalisten.modulo == 'Maquinaria') {
          this._IMGE = '';
        } else { 
          let xuser: any = sessionStorage.getItem('UserCod')
          this.obtenerImagen( xuser, 'Perfil' );
          localStorage.setItem('imgperfil', this._IMGE);
          this.disbtnimg = true;
          this._IMGE = localStorage.getItem('imgperfil');
        }
      }
    })
  }

  async editarImgFileDB() {
    this._show_spinner = true;

    try {
        // Extraer el tipo MIME y los datos binarios del base64
        const matches = this._IMGE.match(/^data:(.+);base64,(.*)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Formato base64 inválido');
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        
        // Convertir base64 a Blob
        const blob = this.base64ToBlob(this._IMGE, mimeType);
        
        // Comprimir la imagen
        new Compressor(blob, {
            quality: 0.5,
            maxWidth: 150,
            maxHeight: 150,
            convertSize: 10000, // 10KB
            success: (compressedResult) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const compressedBase64 = reader.result as string;
                    
                    // Crear el modelo con la imagen comprimida
                    this.imagenModel = {
                        codentidad: this.codEditarImagen,
                        imagen: compressedBase64,
                        tipo: this.datalisten.modulo
                    };

                    console.log('Imagen comprimida:', this.imagenModel);
                    
                    // Enviar al servidor
                    this.fileserv.editarImagen(this.codEditarImagen, this.imagenModel).subscribe({
                        next: (x) => {
                            this._show_spinner = false;
                            Swal.fire(
                                'Imagen agregada',
                                'Imagen se ha actualizado con éxito',
                                'success'
                            );
                        },
                        error: (e) => {
                            console.error(e);
                            this._show_spinner = false;
                        },
                        complete: () => {
                            if (this.datalisten.modulo === 'Maquinaria') {
                                this._IMGE = '';
                            } else {
                                const xuser = sessionStorage.getItem('UserCod');
                                localStorage.setItem('imgperfil', compressedBase64);
                                this.disbtnimg = true;
                                this._IMGE = localStorage.getItem('imgperfil') || '';
                            }
                        }
                    });
                };
                reader.onerror = (error) => {
                    console.error('Error al leer imagen comprimida:', error);
                    this._show_spinner = false;
                };
                reader.readAsDataURL(compressedResult);
            },
            error: (err) => {
                console.error('Error al comprimir imagen:', err);
                this._show_spinner = false;
                Swal.fire('Error', 'No se pudo comprimir la imagen', 'error');
            }
        });
    } catch (error) {
        console.error('Error en el proceso de compresión:', error);
        this._show_spinner = false;
        Swal.fire('Error', 'Ocurrió un error al procesar la imagen', 'error');
    }
  }


  //// FUNCION ANTIGUA PARA EDITAR IMAGEN
  // editarImgFileDB() {
  //   this._show_spinner = true;

  //   switch(this.datalisten.modulo) {

  //     case 'Maquinaria':
  //       // alert('Estas enviando una imagen de maquinaria')
  //       this.imagenModel = {
  //         codentidad: this.codEditarImagen,
  //         imagen:     this._IMGE,
  //         tipo:       this.datalisten.modulo
  //       }
  //       // console.log('ESTE ES EL MODELO A EDITAR');
  //       console.log(this.imagenModel);
  //       break;
  //       case 'Perfil':
  //         // alert('Estas enviando una imagen de Perfil')
  //         this.imagenModel = {
  //           codentidad: this.codEditarImagen,
  //           imagen:     this._IMGE,
  //           tipo:       this.datalisten.modulo
  //         }
  //         console.log(this.imagenModel);
  //       break;

  //   }

  //   this.fileserv.editarImagen( this.codEditarImagen, this.imagenModel ).subscribe({
  //     next: (x) => {
  //       this._show_spinner = false;
  //       Swal.fire(
  //         'Imagen agregada',
  //         'Imagen de La máquina se ha actualizado con éxito',
  //         'success'
  //       ) 
  //     }, error: (e) => {
  //       console.error(e);
  //       this._show_spinner = false;
  //     }, complete: () => {
  //       if(this.datalisten.modulo == 'Maquinaria') {
  //         this._IMGE = '';
  //       } else { 
  //         let xuser: any = sessionStorage.getItem('UserCod');
  //         // this.obtenerImagen( xuser, 'Perfil' );
  //         localStorage.setItem('imgperfil', this._IMGE);
  //         this.disbtnimg = true;
  //         this._IMGE = localStorage.getItem('imgperfil');
  //       }
  //     }
  //   })
  // }



}
