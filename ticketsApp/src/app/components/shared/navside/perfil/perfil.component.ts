import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PerfilService } from './services/perfil.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  perfilForm: FormGroup;
  userId: string;
  loading: boolean = true;
  hidePassword: boolean = true;

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService,
    public dialogRef: MatDialogRef<PerfilComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userId = data;
    this.perfilForm = this.fb.group({
      Coduser: [this.userId],
      Usuario: [''],
      Password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.userId) {
      this.perfilService.getUsuarioPortalTicket(this.userId).subscribe({
        next: (res) => {
          if (res) {
            this.perfilForm.patchValue({
              Coduser: res.coduser || this.userId,
              Usuario: res.usuario
              // Se deja la contraseña en blanco por seguridad
            });
          }
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          Swal.fire('Error', 'No se pudo cargar la información del perfil', 'error');
        }
      });
    } else {
      this.loading = false;
      Swal.fire('Error', 'ID de usuario no encontrado', 'error');
    }
  }

  guardar(): void {
    if (this.perfilForm.valid) {
      this.loading = true;
      this.perfilService.updateUsuarioPortalTicket(this.userId, this.perfilForm.value).subscribe({
        next: (res) => {
          this.loading = false;
          Swal.fire('Éxito', 'Perfil actualizado correctamente', 'success');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          Swal.fire('Error', 'Ocurrió un error al actualizar el perfil', 'error');
        }
      });
    } else {
      this.perfilForm.markAllAsTouched();
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
