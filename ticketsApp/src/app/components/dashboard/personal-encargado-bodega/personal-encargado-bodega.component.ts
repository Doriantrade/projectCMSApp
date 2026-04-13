import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PersonalEncargadoBodegaService } from './services/personal-encargado-bodega.service';


import Swal from 'sweetalert2'
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
  selector: 'app-personal-encargado-bodega',
  templateUrl: './personal-encargado-bodega.component.html',
  styleUrls: ['./personal-encargado-bodega.component.scss']
})
export class PersonalEncargadoBodegaComponent implements OnInit {

  listaBodegas: any = [];
  listaUsuarios: any = [];
  listaAsignacionUsuarioBodega: any = [];
  ccia: string = '';
  cuser: string = '';
  icon_action: string = 'save';
  button_action: string = 'Guardar';
  
  // Variables para la imagen de firma
  public imagenFirmaBase64: string = '';
  public fileError: string = '';
  
  asignacionForm = new FormGroup({
    usuario: new FormControl ('', Validators.required),
    bodega: new FormControl ('', Validators.required)
  });

  constructor( 
    private personalEncargadoBodegaService: PersonalEncargadoBodegaService,
    private fb: FormBuilder 
  ) { 

  }

  ngOnInit(): void {
    this.ccia = sessionStorage.getItem('ccia') || '';
    this.cuser = sessionStorage.getItem('codcli') || '';
    this.obtenerBodegas(this.ccia);
    this.obtenerUsuarios(this.ccia);
    this.obtenerAsignacionUsuarioBodega(this.ccia);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileError = '';
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      if (!this.validarTipoArchivo(file)) {
        this.fileError = 'Solo se permiten archivos de imagen (JPEG, PNG, GIF, BMP)';
        this.imagenFirmaBase64 = '';
        input.value = '';
        return;
      }
      
      // Validar tamaño del archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.fileError = 'El archivo no debe superar los 5MB';
        this.imagenFirmaBase64 = '';
        input.value = '';
        return;
      }
      
      this.convertirImagenABase64(file);
    }
  }

  validarTipoArchivo(file: File): boolean {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    return tiposPermitidos.includes(file.type);
  }

  eliminarAsignacion(id: number) {
    if (confirm('¿Está seguro de eliminar esta asignación?')) {
      this.personalEncargadoBodegaService.EliminarAsignacionUsuarioBodega(id)
          .subscribe({
            next: (x) => {
              Toast.fire({ icon: 'success', title: 'Se ha eliminado el registro' })
              this.obtenerAsignacionUsuarioBodega(this.ccia);
            },
            error: (err) => {
              console.error('Error al eliminar la asignación:', err);
              Toast.fire({ icon: 'success', title: 'Intentelo más tarde' })
            }
          });
    }
  }

  idAsignacion: number = 0;
  catchData( data: any ) {
    console.log(data);
    this.idAsignacion = data.id;
    this.asignacionForm.controls['usuario'].setValue( data.iduser );
    this.asignacionForm.controls['bodega'].setValue( data.idbodega );
    this.imagenFirmaBase64 =  data.urlImagenFirma;
    this.icon_action = 'edit';
    this.button_action = 'Editar';
  }

  convertirImagenABase64(file: File): void {
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        this.imagenFirmaBase64 = e.target.result as string;
        console.log('Imagen convertida a Base64 correctamente');
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error al convertir la imagen:', error);
      this.fileError = 'Error al procesar la imagen';
      this.imagenFirmaBase64 = '';
    };
    
    reader.readAsDataURL(file);
  }

  eliminarFirma(): void {
    this.imagenFirmaBase64 = '';
    this.fileError = '';
    
    // Limpiar el input file
    const fileInput = document.getElementById('firmaInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  submit() {

    switch(this.button_action) {
      case 'Guardar':
        this.guardarAsignacion();
        break;
      case 'Editar':
        this.editarAsignacion();
        break;
    }

  }

  guardarAsignacion(): void {
    if (this.asignacionForm.valid && this.imagenFirmaBase64) {

      const asignacion: any = {
        idbodega: this.asignacionForm.controls['bodega'].value,
        iduser:   this.asignacionForm.controls['usuario'].value,
        urlImagenFirma: this.imagenFirmaBase64,
        usercrea: this.cuser,
        ccia: this.ccia,
        estado: 1,
        fecrea: new Date()
      };

      console.warn('Asignación a guardar:', asignacion);

      this.personalEncargadoBodegaService.guardarAsignacionUsuarioBodega(asignacion)
          .subscribe({
            next: (x) => {
              // console.log('Asignación guardada correctamente:', x);
              Toast.fire({ icon: 'success', title: 'Se ha guardado el registro' });
              this.limpiarFormulario();
              this.obtenerAsignacionUsuarioBodega(this.ccia);
            },
            error: (err) => {
              console.error('Error al guardar:', err);
              Toast.fire({ icon: 'error', title: 'Intente más tarde' });
            }
          });
    } else {
      this.asignacionForm.markAllAsTouched();
      if (!this.imagenFirmaBase64) {
        this.fileError = 'Debe cargar una imagen de firma';
      }
    }
  }

  editarAsignacion(): void {
    if (this.asignacionForm.valid && this.imagenFirmaBase64) {

      const asignacion: any = {
        id: this.idAsignacion,
        idbodega: this.asignacionForm.controls['bodega'].value,
        iduser:   this.asignacionForm.controls['usuario'].value,
        urlImagenFirma: this.imagenFirmaBase64,
        usercrea: this.cuser,
        ccia: this.ccia,
        estado: 1,
        fecrea: new Date()
      };

      console.warn('Asignación a editar:', asignacion);

      this.personalEncargadoBodegaService.EditarAsignacionUsuarioBodega(this.idAsignacion, asignacion)
          .subscribe({
            next: (x) => {
              // console.log('Asignación editada correctamente:', x);
              this.limpiarFormulario();
              this.obtenerAsignacionUsuarioBodega(this.ccia);
              this.icon_action = 'save';
              this.button_action = 'Guardar';
              Toast.fire({ icon: 'success', title: 'Se ha actualizado el registro' });
            },
            error: (err) => {
              console.error('Error al editar:', err);
              Toast.fire({ icon: 'error', title: 'Intente más tarde' });
            }
          });
    } else {
      this.asignacionForm.markAllAsTouched();
      if (!this.imagenFirmaBase64) {
        this.fileError = 'Debe cargar una imagen de firma';
      }
    }
  }

  mostrarMensajeExito(): void {
    // Puedes implementar un toast o alert de éxito
    // alert('Asignación guardada correctamente');
  }

  mostrarMensajeError(): void {
    // Puedes implementar un toast o alert de error
    // alert('Error al guardar la asignación');
  }

  limpiarFormulario(): void {
    this.asignacionForm.reset();
    this.eliminarFirma();
  }

  // Los demás métodos se mantienen igual
  obtenerAsignacionUsuarioBodega(cci: string): void {
    this.personalEncargadoBodegaService.obtenerAsignacionUsuarioBodega(cci)
        .subscribe({
          next: (x) => {
            this.listaAsignacionUsuarioBodega = x;
            console.log('Asignaciones obtenidas:', x);
          },
          error: (err) => {
            console.error('Error al obtener asignaciones:', err);
          }
        });
  }

  obtenerBodegas(cci: string): void {
    this.personalEncargadoBodegaService.obtenerBodegas(cci)
        .subscribe({
          next: (x) => {
            this.listaBodegas = x;
            console.log('Bodegas obtenidas:', x);
          }, 
          error: (err) => {
            console.error('Error al obtener bodegas:', err);
          }
        });
  }

  obtenerUsuarios(cci: string): void {
    this.personalEncargadoBodegaService.obtenerUsuarios(cci)
        .subscribe({
          next: (x) => {
            this.listaUsuarios = x;
            console.log('Usuarios obtenidos:', x);
          },
          error: (err) => {
            console.error('Error al obtener usuarios:', err);
          }
        });
  }

  // Getter para fácil acceso a los controles del formulario
  get f() {
    return this.asignacionForm.controls;
  }
}