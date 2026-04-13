import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import { UserService } from '../usuario/services/user.service';
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
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.scss']
})
export class PerfilUsuarioComponent implements OnInit, OnChanges {
  pMod: number = 4;

  _show_btn:                    boolean = false;
  pass: any;
  ccia: any;
  _delete_show:                 boolean = true;
  public sexoLista:             any = [];
  public provinciaLista:        any = [];
  public estadoCivilLista:      any = [];
  public tipoPersonaLista:      any = [];
  public carrerasLista:         any = [];
  public facultadLista:         any = [];
  public capacidadesLista:      any = [];
  public estadoTrabajadorLista: any = [];
  public cantonLista:           any = [];
  public departamentoLista:     any = [];
  public tipoLista:             any = [];
  public moviLista:             any = [];
  public licenciaLista:         any = [];
  public cargoLista:            any = [];
  _action_butto = 'Actualizar';
  _show_spinner: boolean = false;
  _icon_button: string = 'add';
  _cancel_button: boolean = false;
  usuarioDato: any = [];
  // @Input() usuarioDato: any = [];
  @Input() modulo: any = [];
  
  constructor(private DataMaster: SharedService, private us: UserService) { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;


    this.usuarioDato = {
      modulo: this.modulo.nombre,
      accion: 1,
      state: 2
    }

    this.ccia = sessionStorage.getItem('codcia');
    this.validatePersonal();
    this.obtnerPerfilUsuario();
    this.getDataMaster('PRV00');
    // Estado Civil
    this.getDataMaster('R02');
    // Estado del trabajador
    this.getDataMaster('R07');
    // Sexo
    this.getDataMaster('C04');
    // Tipo de persona
    this.getDataMaster('TP01');
    //capacidades
    this.getDataMaster('CPAD');
    //departamento
    this.getDataMaster('008');
    //cargo
    this.getDataMaster('R03');
    //tipo de cuenta
    this.getDataMaster('R20');
    //Movilidad
    this.getDataMaster('MOVI');
    //Licencia
    this.getDataMaster('LIC');
  }


  ngOnChanges(changes: SimpleChanges) { }
  read:boolean = false;
  select: boolean = true;
  usuarioPerfil: any = [];
  nombretipo:string = '';
  nombrecargo:string = '';
  departamentonombre:string = '';
  estadotrabajador:string = '';
  obtnerPerfilUsuario() {

    let coduser: any = sessionStorage.getItem('UserCod');

    this.us.obtenerCuentaUsuario(coduser).subscribe({
      next:(usuario) => {
        this.usuarioPerfil = usuario;
      },error: (e) => {
        console.error(e);
      }, complete: () => {
        this.usuarioPerfil.filter( (element:any) => {
          console.log(element);
          this.userForm.controls['Email'].setValue(element.email);
          this.userForm.controls['Nombre'].setValue(element.nombre);
          this.userForm.controls['Apellido'].setValue(element.apellido);
          this.userForm.controls['Cedula'].setValue(element.cedula);
          this.userForm.controls['Cargo'].setValue(element.cargo.trim());
          this.userForm.controls['Contrasenia'].setValue(element.contrasenia);
          this.pass = element.contrasenia;
          this.userForm.controls['Estado'].setValue(element.estado.trim());
          this.userForm.controls['Edad'].setValue(element.edad);
          this.userForm.controls['Tipo'].setValue(element.tipo.trim());
          this.userForm.controls['Movilidad'].setValue(element.movilidad.trim());
          this.userForm.controls['Codcaracteristicas'].setValue(element.codcaracteristicas.trim());
          this.userForm.controls['CodProvincia'].setValue(element.codProvincia.trim());
          this.getCantones();
          this.userForm.controls['CodCanton'].setValue(element.codCanton.trim());
          this.userForm.controls['CodSexo'].setValue(element.codSexo.trim());
          this.userForm.controls['CodEstadoCivil'].setValue(element.codEstadoCivil.trim());
          this.userForm.controls['CodDepartamento'].setValue(element.codDepartamento.trim());
          this.userForm.controls['CodLicencia'].setValue(element.codLicencia.trim());
          this.userForm.controls['Telf'].setValue(element.telf);
          this.userForm.controls['Direccion'].setValue(element.direccion);
          this.nombrecargo = element.nombrecargo;
          this.nombretipo = element.nombretipo;
          this.departamentonombre = element.departamentonombre;
          this.estadotrabajador = element.estadotrabajador;
          if ( element.tipo.trim() == '003' || element.tipo.trim() == '002' ) {
            this.read = true
            this.select = false;
          }
          else {
            this.read = false;
            this.select = true;
          }



        })
      }
    })
  }
  colortext: any;
  descrip: any;
  viewpass() {
    if(this.userForm.controls['Contrasenia'].value.length > 4 ) {
      this.pass = this.userForm.controls['Contrasenia'].value;

      console.log(this.userForm.controls['Contrasenia'].value.length)
      this._show_btn = false;
      this.colortext = 'text-success';
      this.descrip = 'Normal';
    }

    // else if(this.userForm.controls['Contrasenia'].value.length > 10 && this.userForm.controls['Contrasenia'].value.length < 15) {
    //   this._show_btn = false;
    //   this.colortext = 'text-success';
    //   this.pass = this.userForm.controls['Contrasenia'].value;
    //   this.descrip = 'Fuerte - deberías anotarla';

    // } 
    else if(this.userForm.controls['Contrasenia'].value.length < 5 ){
      this._show_btn = true;
      this.colortext = 'text-danger';
      
        this.pass = this.userForm.controls['Contrasenia'].value;
        this.descrip = 'Muy Baja - Actualización deshabilitada';
    
    }

    setTimeout(() => {
      this.descrip = '';
    }, 2000);

  }


  public userForm = new FormGroup({
    Email:              new FormControl(''), 
    Nombre:             new FormControl(''), 
    Apellido:           new FormControl(''), 
    Cedula:             new FormControl(''), 
    Cargo:              new FormControl(''), 
    Contrasenia:        new FormControl(''), 
    Estado:             new FormControl(''), 
    Edad:               new FormControl(), 
    Tipo:               new FormControl(''), 
    Movilidad:          new FormControl(''), 
    Codcaracteristicas: new FormControl(''), 
    CodProvincia:       new FormControl(''), 
    CodCanton:          new FormControl(''),
    CodSexo :           new FormControl(''),
    CodEstadoCivil:     new FormControl(''),
    CodDepartamento:    new FormControl(''),
    CodLicencia:        new FormControl(''),
    Telf:               new FormControl(''),
    Direccion:          new FormControl(''),
  });

  getDataMaster(cod:string) {
    this.DataMaster.getDataMaster(cod).subscribe({
      next: (Data) => {

        switch(cod) {
          case 'R02':
            this.estadoCivilLista = Data;
            break;
          case 'PRV00':
            this.provinciaLista = Data;
            // console.warn(this.provinciaLista);
            break;
          case 'C04':
            this.sexoLista = Data;
            break;
          case 'TP01':
            this.tipoPersonaLista = Data;
            break;
          case 'UG01':
            this.carrerasLista = Data;
            break;
          case 'UG00':
            this.facultadLista = Data;
            break;
          case 'CPAD':
            this.capacidadesLista = Data;
            break;
          case 'R07':
            this.estadoTrabajadorLista = Data;
            // console.warn(this.estadoTrabajadorLista);
            break;
          case '008':
            this.departamentoLista = Data;
            break;
          case 'R03':
            this.cargoLista = Data;
            break;
          case 'R20':
            this.tipoLista = Data;
            break;
          case 'MOVI':
            this.moviLista = Data;
            break;
          case 'LIC':
            this.licenciaLista = Data;
            break;
        }
      }
    })
  }

  validatePersonal() {

    let xtipo: any = sessionStorage.getItem('tipo');
    if(xtipo.trim() == '001') {
      this._delete_show = true;
    } else {
      this._delete_show = false;
    }

  }

  onSubmit() {
    this.editarUsuario();
  }

  getCantones() {
    this.DataMaster.getDataMaster(this.userForm.controls['CodProvincia'].value).subscribe({
      next: (cantones) => {
        this.cantonLista = cantones;
        // console.warn( this.cantonLista );
      }, 
      error: (e) => {
        console.error(e);
      }
    })
  }

  public modeluser: any = []
  editarUsuario() {

    if( this.userForm.controls['Nombre'].value == '' || this.userForm.controls['Nombre'].value == undefined || this.userForm.controls['Nombre'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo nombre no puede ir vacío' })
    else if( this.userForm.controls['Apellido'].value == '' || this.userForm.controls['Apellido'].value == undefined || this.userForm.controls['Apellido'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Apellido no puede ir vacío' })
    else if( this.userForm.controls['Contrasenia'].value == '' || this.userForm.controls['Contrasenia'].value == undefined || this.userForm.controls['Contrasenia'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Contrasenia no puede ir vacío' })
    else if( this.userForm.controls['Estado'].value == '' || this.userForm.controls['Estado'].value == undefined || this.userForm.controls['Estado'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Estado no puede ir vacío' })
    else if( this.userForm.controls['CodDepartamento'].value == '' || this.userForm.controls['CodDepartamento'].value == undefined || this.userForm.controls['CodDepartamento'].value == null ) Toast.fire({ icon: 'warning', title: 'Debes ubicar el usuario al departamento que corresponde', timer: 3000 })
    else if( this.userForm.controls['Tipo'].value == '' || this.userForm.controls['Tipo'].value == undefined || this.userForm.controls['Tipo'].value == null ) Toast.fire({ icon: 'warning', title: 'Debes proporcionar el tipo de cuenta que tendrá este usuario por temas de permisos', timer: 3000 })
    else {
      let coduser: any = sessionStorage.getItem('UserCod');
    
      // this.usuarioDato = {
      //   nombreMaquina: this.userForm.controls['Nombre'].value,
      //   codtipomaquina: this.userForm.controls['codtipomaquina'].value.trim(),
      //   codmaquina: this.codmaquinaria,
      //   modulo: this.modulo.nombre,
      //   state: 1,
      //   accion: 2
      // };

      this.modeluser ={
      "Coduser":            coduser, 
      "Email":              this.userForm.controls['Email'].value, 
      "Nombre":             this.userForm.controls['Nombre'].value, 
      "Apellido":           this.userForm.controls['Apellido'].value, 
      "Cedula":             this.userForm.controls['Cedula'].value, 
      "Cargo":              this.userForm.controls['Cargo'].value,
      "Contrasenia":        this.userForm.controls['Contrasenia'].value, 
      "Estado":             this.userForm.controls['Estado'].value, 
      "Edad":               this.userForm.controls['Edad'].value, 
      "Tipo":               this.userForm.controls['Tipo'].value, 
      "Movilidad":          this.userForm.controls['Movilidad'].value, 
      "Codcaracteristicas": this.userForm.controls['Codcaracteristicas'].value, 
      "Valoracion": 0,  
      "CodProvincia":       this.userForm.controls['CodProvincia'].value, 
      "CodCanton":          this.userForm.controls['CodCanton'].value, 
      "CodSexo":            this.userForm.controls['CodSexo'].value, 
      "CodEstadoCivil":     this.userForm.controls['CodEstadoCivil'].value, 
      "CodDepartamento":    this.userForm.controls['CodDepartamento'].value, 
      "CodLicencia":        this.userForm.controls['CodLicencia'].value, 
      "Telf":               this.userForm.controls['Telf'].value, 
      "Direccion":          this.userForm.controls['Direccion'].value,
      "CodCia": this.ccia
      
    }
    
    this._show_spinner = true;
    this.us.editarUsuario( coduser, this.modeluser).subscribe({
      next: (x) => {
        Toast.fire({
          icon: 'success',
          title: 'Usuario editado correctamente',
          timer: 2000,
          position: 'center'          
        })
        this._show_spinner = false;
      }, error: (e) => {
        console.error(e);
        Toast.fire({
          icon: 'error',
          title: 'No hemos podido editar',
          timer: 1500,
          position: 'top-end'          
        })
        this._show_spinner = false;
      }, complete: () => {
        // this.limpiar();
      }
    })

  }

  }


  limpiar() {
    this.userForm.controls['Email'].setValue('');
    this.userForm.controls['Nombre'].setValue('');
    this.userForm.controls['Apellido'].setValue('');
    this.userForm.controls['Cedula'].setValue('');
    this.userForm.controls['Cargo'].setValue('');
    this.userForm.controls['Contrasenia'].setValue('');
    this.userForm.controls['Estado'].setValue('');
    this.userForm.controls['Edad'].setValue('');
    this.userForm.controls['Tipo'].setValue('');
    this.userForm.controls['Movilidad'].setValue('');
    this.userForm.controls['Codcaracteristicas'].setValue('');
    this.userForm.controls['CodProvincia'].setValue('');
    this.userForm.controls['CodCanton'].setValue('');
    this.userForm.controls['CodSexo'].setValue('');
    this.userForm.controls['CodEstadoCivil'].setValue('');
    this.userForm.controls['CodDepartamento'].setValue('');
    this.userForm.controls['CodLicencia'].setValue('');
    this.userForm.controls['Telf'].setValue('');
    this.userForm.controls['Direccion'].setValue('');
    this._action_butto = 'Crear';
    this._icon_button = 'add';
    this._cancel_button = false;
  }


}
