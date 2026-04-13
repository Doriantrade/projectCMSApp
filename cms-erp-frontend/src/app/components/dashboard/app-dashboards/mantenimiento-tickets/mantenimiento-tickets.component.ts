import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MantenimientoTicketsService } from './services/mantenimiento-tickets.service';
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
  selector: 'app-mantenimiento-tickets',
  templateUrl: './mantenimiento-tickets.component.html',
  styleUrls: ['./mantenimiento-tickets.component.scss']
})
export class MantenimientoTicketsComponent implements OnInit {
  pMod: number = 4;


  @Input() modulo: any;
  _show_spinner: boolean = false;
  _show_form: boolean = false;
  _form_create: boolean = true;
  _cancel_button: boolean = false;
  _create_show: boolean = true;
  _edit_btn: boolean = false;
  _edit_show: boolean = true;
  _delete_show: boolean = true;
  _icon_button: string = 'add';
  _action_butto: string = 'Guardar';

  userForm: FormGroup;
  listUsuariosTickets: any[] = [];
  clientesLista: any[] = [];
  rolesLista: any[] = [];
  ccia: any = '';

  displayedColumns: string[] = ['edit', 'nombre', 'apellido', 'usuario', 'correo', 'rol', 'active'];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private ticketService: MantenimientoTicketsService
  ) {
    this.userForm = this.fb.group({
      id: [0],
      usuario: ['', Validators.required],
      password: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      idCliente: [''],
      rol: [''],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      active: ['A'],
      coduser: [''],
      ccia: ['']
    });
  }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    if (!this.modulo) {
      this.modulo = { nombre: 'Mantenimiento Tickets', icono: 'confirmation_number' };
    }
    this.ccia = sessionStorage.getItem('codcia');
    this.getUsuarios();
    this.obtenerClientes();
    this.obtenerRoles();
  }

  obtenerClientes() {
    this.ticketService.getClientes(this.ccia).subscribe({
      next: (res: any) => this.clientesLista = res,
      error: (e) => console.error(e)
    });
  }

  obtenerRoles() {
    this.ticketService.getRoles().subscribe({
      next: (res: any) => this.rolesLista = res,
      error: (e) => console.error(e)
    });
  }

  getUsuarios() {
    this._show_spinner = true;
    this.ticketService.getUsuarioTickets().subscribe({
      next: (res: any) => {
        this.listUsuariosTickets = res;
        this.dataSource = new MatTableDataSource(this.listUsuariosTickets);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this._show_spinner = false;
      },
      error: () => this._show_spinner = false
    });
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    // Set 'ccia' automatically from sessionStorage
    this.userForm.patchValue({ ccia: this.ccia });

    // Find the selected client to extract 'coduser' if necessary
    // Based on the instructions, the selected 'idCliente' (which sets codcli/codcliente) 
    // will be used as the 'coduser'.
    const selectedCliente = this.userForm.value.idCliente;
    this.userForm.patchValue({ coduser: selectedCliente });

    this._show_spinner = true;
    if (this._edit_btn) {
      // Update
      const id = this.userForm.value.id;
      this.ticketService.updateUsuarioTicket(id, this.userForm.value).subscribe({
        next: () => {
          this.getUsuarios();
          this.limpiar();
          this._show_spinner = false;
          Toast.fire({
            icon: 'success',
            title: 'Usuario actualizado correctamente'
          })
        },
        error: () => {
          this._show_spinner = false;
          Toast.fire({
            icon: 'error',
            title: 'No hemos podido actualizar'
          })
        }
      });
    } else {
      // Create - Ensure ID is not sent for auto-increment
      const payload = { ...this.userForm.value };
      delete payload.id;
      this.ticketService.createUsuarioTicket(payload).subscribe({
        next: () => {
          this.getUsuarios();
          this.limpiar();
          this._show_spinner = false;
          Toast.fire({
            icon: 'success',
            title: 'Usuario agregado correctamente'
          })
        },
        error: () => {
          this._show_spinner = false;
          Toast.fire({
            icon: 'error',
            title: 'No hemos podido guardar'
          })
        }
      });
    }
  }

  catchData(data: any) {
    this.userForm.patchValue({
      id: data.id,
      usuario: data.usuario,
      password: data.password,
      correo: data.correo,
      idCliente: data.idCliente,
      rol: data.rol,
      nombre: data.nombre,
      apellido: data.apellido,
      active: data.active,
      coduser: data.coduser,
      ccia: data.ccia
    });
    this._create_show = false;
    this._edit_btn = true;
    this._cancel_button = true;
  }

  eliminarUsuario(data: any) {
    Swal.fire({
      title: 'Estás seguro?',
      text: "Esta acción es irreversible y eliminará el registro!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this._show_spinner = true;
        this.ticketService.deleteUsuarioTicket(data.id).subscribe({
          next: () => {
            this.getUsuarios();
            this._show_spinner = false;
            Swal.fire(
              'Eliminado!',
              'El usuario ha sido eliminado.',
              'success'
            )
          },
          error: () => {
            this._show_spinner = false;
            Swal.fire(
              'Error!',
              'No se pudo eliminar el usuario',
              'error'
            )
          }
        });
      }
    });
  }

  limpiar() {
    this.userForm.reset();
    this.userForm.get('id')?.setValue(0);
    this.userForm.get('active')?.setValue('A');
    this._show_form = false;
    this._create_show = true;
    this._edit_btn = false;
    this._cancel_button = false;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
