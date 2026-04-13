import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MensajeriaTicketService } from './services/mensajeria-ticket.service';
import { Environments } from 'src/app/environments/environments';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { jwtDecode } from 'jwt-decode';
import { EncryptService } from 'src/app/components/shared/services/encrypt.service';
import Swal from 'sweetalert2'
import { ImagecontrolService } from 'src/app/components/shared/imagen-control/imagecontrol.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalPreviewComponent } from 'src/app/components/shared/modal-preview/modal-preview.component';
import { FormularioRegistroProblemasService } from '../../formulario-registro-problemas/services/formulario-registro-problemas.service';
@Component({
  selector: 'app-mensajeria-ticket',
  templateUrl: './mensajeria-ticket.component.html',
  styleUrls: ['./mensajeria-ticket.component.scss']
})
export class MensajeriaTicketComponent implements OnInit, OnChanges, AfterViewChecked {
  imagePreview: string | ArrayBuffer | null = null;
  @ViewChild('audioPlayer') audioPlayer!: ElementRef;

  private audio = new Audio();
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  _show_spinner: boolean = false;
  @Input() listenTicketCliente: any;
  @Output() _data_ticket_mensaje_del: any = new EventEmitter();
  @Output() _data_ticket_mensaje_send: any = new EventEmitter();
  @Output() _data_ticket_mensaje_update: any = new EventEmitter();
  modelSendMsj: any = [];
  public file!: File;
  usercodec: any;
  listaMensajes: any = [];
  listaMensajesGhost: any = [];
  _cli_view: boolean = false;
  sub: any;
  nameidentifier: any;
  name: any;
  role: any;
  authorizationdecision: any;
  exp: any;
  iss: any;
  aud: any;
  codcli: any;

  idRequerimiento: number = 0;
  private urlHub: any = this.env.apiUrlHub();
  private urlImg: any = this.env.apiUrlStorageMImage()+'filesMsj/';
  private mensajesHub: HubConnection;

  constructor( private env: Environments, 
               public dialog: MatDialog,
               private maquinaria: FormularioRegistroProblemasService,
               private ncrypt: EncryptService,
               private mensajeria: MensajeriaTicketService,
               private imgMsj: ImagecontrolService ) {
    
    this.mensajesHub = new HubConnectionBuilder().withUrl(this.urlHub + 'msjHub').build();
    this.mensajesHub.on("SendMessageHub", ( message: any, respuesta: any[]) => {
        this.msjTicketSend( message, respuesta );
        this.scrollToBottom();
    });

    this.audio.src = '../../../../../assets/audio/msj_sound.mp3';
    this.audio.load();

  }


  playAudio() {
    this.audio.play();
  }

  ngOnInit(): void {
    this.usercodec = sessionStorage.getItem('codcli');
    this.getToken();
    this.mensajesHub.start().then( () => {
      // // console.log('MSJ CONECTAD@!!!')
    }).catch( e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DEL MENSAJE DEL TICKET:',e);
    })
  }
  

  codRequerimiento: string = '';
  ngOnChanges( changes: SimpleChanges ): void {
    if( changes ) {
      this.idRequerimiento = this.listenTicketCliente.idRequerimiento;
      this.codRequerimiento = this.listenTicketCliente.codRequerimiento;
      if (this.idRequerimiento != null ) {
        this.obtenerMensajes(this.idRequerimiento, 50);
      }
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  clearFileInput(): void {
    const fileInput = document.getElementById('imgMsjSend') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';  // Limpiar el input de archivo
    }
    this.imagePreview = null; // Limpiar el preview de la imagen
    this.messengerForm.get('imgMsjSend')?.reset(); // Resetear el formControl
    
  }
  

  messengerForm = new FormGroup  ({
    msj:          new FormControl(''),
    imgMsjSend:   new FormControl(),
  })

  compressedImageFile: any;
  handleFileInput(event: any): void {
    this.file= event.target.files[0];
  
    if (this.file && this.isImage(this.file)) {
      this.compressImage(this.file, 0.7).then((compressedFile: Blob) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = reader.result;
        }
  
        // Asignar el archivo comprimido a una variable global para usarlo en enviarMensaje
        this.compressedImageFile = compressedFile;  
        reader.readAsDataURL(compressedFile);

      });
    } else {
      console.error("El archivo no es una imagen");
    }
  }
  
  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }
  
  compressImage(file: File, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
  
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
  
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
  
          // Ajustar tamaño del canvas al tamaño de la imagen
          canvas.width = img.width;
          canvas.height = img.height;
  
          // Dibujar la imagen en el canvas
          ctx.drawImage(img, 0, 0, img.width, img.height);
  
          // Convertir la imagen a Blob con calidad reducida
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Error al comprimir la imagen.'));
              }
            },
            'image/jpeg', // Puedes cambiar a 'image/png' según el tipo de imagen
            quality
          );
        };
  
        img.onerror = reject;
      };
  
      reader.onerror = reject;
    });
  }
  
  uploadServerFile(file: any, nameFile: any) {
    this.imgMsj.uploadFileMsj(file, nameFile).subscribe({
      next: (x) => {
        //// // console.log(x);
        // alert('Se Guardo la imagen: ' + nameFile);
      }, 
      error: (e) => {
        console.error(e);
      }, 
      complete: () => {
        // Acción al completar la subida del archivo
      }
    });
  }
  
  enviarMensaje() {
    this._show_spinner = true;
    const xcli: any = sessionStorage.getItem('codcli');
  
    // Obtener el valor de la imagen y extraer solo el nombre del archivo
    let ximage: any = this.messengerForm.controls['imgMsjSend'].value;
    if (ximage) {
      ximage = ximage.split('\\').pop(); // Esto toma el último segmento después del último '\'
      // ximage = ximage.replace(/\s+/g, '_'); // Reemplazar los espacios en blanco con guiones bajos
    } else {
      ximage = '-Sin Imagen-'; // En caso de que no haya imagen, asignar valor por defecto
    }
  
    // Crear el objeto con el mensaje y los datos
    this.modelSendMsj = {
      idRequerimiento: this.idRequerimiento,
      fechaemit:       new Date(),
      mensaje:         this.messengerForm.controls['msj'].value,
      coduser:         xcli,
      active:          'A',
      estado:          'NL',
      urlImagen:       ximage
    }

    // Enviar el mensaje con el servicio
    this.mensajeria.enviarMensaje(this.modelSendMsj).subscribe({
      next: (x) => {
        // Aquí verificamos si el archivo comprimido está disponible
        if (this.file) {
          this.uploadServerFile(this.file, this.idRequerimiento);
        }
        this._show_spinner = false;
      }, 
      error: (e) => {
        console.error(e);
        this._show_spinner = false;
      }, 
      complete: () => {
        this.messengerForm.controls['msj'].setValue(''); // Limpiar el campo del mensaje
        this.clearFileInput();
      }
    });
  }
  
  


  getToken() {
  
    let xtoken:any = sessionStorage.getItem('token');
    const xtokenDecript: any = this.ncrypt.decryptWithAsciiSeed(xtoken, this.env.es, this.env.hash);
    if ( xtokenDecript != null || xtokenDecript != undefined ) {

      var decoded:any = jwtDecode(xtokenDecript);
      this.sub                   = decoded["sub"];
      this.nameidentifier        = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      this.name                  = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      this.role                  = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      this.authorizationdecision = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/authorizationdecision"];
      this.exp                   = decoded["exp"];
      this.iss                   = decoded["iss"];
      this.aud                   = decoded["aud"];
      this.codcli                = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/country"];

      if(this.role == 'R004') {
        this._cli_view = false;
      }

      else if(this.role == 'R003') {
        this._cli_view = true;
      }

    }
  
  }

  
  openDataEquiposDialog(data:any) {

    const dialogRef = this.dialog.open( ModalPreviewComponent, {
      height: '100%',
      width: 'auto',
      data: data
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
      }
    });
  }


  cargarImagen(){
    //// // console.log('Intentando cargar imagen')
  }

  emitDataTicket_send( data: any ) {
    this._data_ticket_mensaje_send.emit(data);
  }

  emitDataTicket_del( data:any ) {
    this._data_ticket_mensaje_del.emit(data);
  }

  emitDataTicket_update( data:any ) {
    this._data_ticket_mensaje_update.emit(data);
  }

  eliminarMensaje(data:any, index:number) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.mensajeria.eliminarMensajes(data.idmensaje).subscribe({
          next: (x) => {
            Swal.fire({
              title: "Eliminado!",
              text: "Este mensaje ha sido eliminado.",
              icon: "success"
            });
          }, error: (e) => {
            console.error(e);
          }, complete: () => {
            this.emitDataTicket_del(data);
            this.listaMensajes.splice( index, 1 );
          }
        })
      }
    });
  }

  scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  msjTicketSend(message: any, respuesta: any) {
    this.listaMensajes = [];
    let xreq: any = localStorage.getItem('idRequerimientoShow');
    let xus: any = sessionStorage.getItem('codcli');
    this.listaMensajes.filter( (x:any) => {

      if( respuesta.idmensaje == x.idmensaje && xus != x.coduser ) {
        x.color = '#6D9681';
      }
      
    })

    this._data_ticket_mensaje_send.emit(respuesta);
    this.listaMensajesGhost.push(respuesta);
    // console.table('//////////////////////////////////////////////////////////////////////////');
    // console.table('HUB MSJ respuesta');
    // // console.log(respuesta)

    this.asignanDoListaMensajes();

    if ( respuesta.coduser != this.usercodec ) this.playAudio();
    

  }

  listaRequerimientos: any = [];
  obtenerTicketsRequerimientos( codcli: string ) {
      this._show_spinner = true;
      this.maquinaria.obtenerTicketsRequerimientos(codcli, 'CMS-001-2023', 1).subscribe({
        next: (x) => {
          this.listaRequerimientos = x;
          // console.table(this.listaRequerimientos);
        },error: (e) => {
          console.error(e);
          this._show_spinner = false;
        }, complete: () => {
          this._show_spinner = false;
        }
      })
  }

  changeColorMsjAll() {
    this.listaMensajes.filter( (x:any) => {
      x.color = 'rgb(46, 46, 46)';
    })
  }

  onSubmit() {
    this.enviarMensaje();
  }

  actualizarMensajeEstado(top:number) {
    this._show_spinner = true;
    let xus: any = sessionStorage.getItem('codcli');
    this.mensajeria.actualizarMensajeEstado(this.idRequerimiento, xus).subscribe({
      next: (x) => {
        //// // console.log(x);
        this.obtenerMensajes(this.idRequerimiento, top)
        this._show_spinner = false;
      }, error: (e) => {
        console.error(e);
        this._show_spinner = false;
      }, complete: () => {
        // this.listaMensajes.filter( (x:any) => {

        // })
        this.emitDataTicket_update( this.idRequerimiento );
        this.changeColorMsjAll();
      }
    })
  }

  obtenerMensajes(idRequerimiento: number, top: number) {

    this._show_spinner = true;
    this.listaMensajes = [];
    this.mensajeria.obtenerMensaje( idRequerimiento, top ).subscribe({
      next: (x) => {
        this.listaMensajesGhost = x;
        //// // console.warn('this.listaMensajesGhost');
        //// // console.warn(this.listaMensajesGhost);
        this._show_spinner = false;
      }, error: (e) => {
        console.error(e);
        this._show_spinner = false;
      }, complete: () => {
        this.asignanDoListaMensajes();
      }

    }) 

  }

  asignanDoListaMensajes() {
    // Definir los tipos de archivo permitidos
    const arrImgTypes: { type: string }[] = [
      { type: 'jpg' },
      { type: 'jpeg' },
      { type: 'png' },
      { type: 'gif' },
      { type: 'bmp' },
      { type: 'tiff' },
      { type: 'svg' },
      { type: 'webp' },
      { type: 'ico' }
    ];
  
    this.listaMensajesGhost.filter((x: any) => {
  
      x.estado = x.estado.toString().trim();
      if (x.estado === 'NL') {
        x.colorIcono = 'gray';
      } else if (x.estado === 'L') {
        x.colorIcono = 'yellowgreen';
      }
      
      const fileExtension = x.urlImagen.split('.').pop()?.toLowerCase();
      const isImage = arrImgTypes.some(imgType => imgType.type === fileExtension);

      let arr = {
        "idRequerimiento": x.idRequerimiento,
        "fechaemit": x.fechaemit,
        "mensaje": x.mensaje,
        "coduser": x.coduser,
        "idmensaje": x.idmensaje,
        "active": x.active,
        "usuarioNombre": x.usuario,
        "usuario": x.usuario,
        "color": '#2E2E2E',
        "estado": x.estado,
        "colorIcono": x.colorIcono,
        "file": x.urlImagen,
        "urlImagen": 'http://192.168.55.242:5075/filesMsj/' + x.idRequerimiento + '/' + x.urlImagen,
        "tipo": x.tipo,
        "codReq": x.tipo + '-' + x.idRequerimiento.toString().padStart(9, '0'),
        "typeMediaFile": isImage // Retorna true si es una imagen, false en caso contrario
      };
  
      // Añadir el objeto a la lista
      this.listaMensajes.push(arr);

    });

    // // console.warn('------------------------------------------------------------------------------');
    // // console.warn(this.listaMensajes);
    // // console.warn('------------------------------------------------------------------------------');

  }
  

}

