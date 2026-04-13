import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CronogramaComponent } from '../cronograma.component';
import { ClienteService } from '../../clientes/services/cliente.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-cronograma',
  templateUrl: './modal-cronograma.component.html',
  styleUrls: ['./modal-cronograma.component.scss']
})
export class ModalCronogramaComponent implements OnInit {
  pMod: number = 4;

  _show_spinner:boolean = false;
  ccia:               any;
  public dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  isLinear = false;
  columnHead:         any = [ 'nombreCliente',  'nombre', 'mantenimiento', 'action' ];
  constructor(public dialogRef: MatDialogRef<CronogramaComponent>, private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private client: ClienteService ) { }


    firstFormGroup = this._formBuilder.group({
      firstCtrl: [''],
    });
    secondFormGroup = this._formBuilder.group({
      secondCtrl: [''],
    });

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.ccia = sessionStorage.getItem('codcia');
    this.obtenerAgencias();
    console.log(this.data);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  listAgencias:any = [];
  obtenerAgencias() {
    this._show_spinner = true;

    console.warn(this.data.codcli);

    this.client.obtenerAgencias(this.ccia, this.data.codcli, 'void', ).subscribe({
      next: (agencias) => {
        this.listAgencias = agencias;
        console.log(this.listAgencias);
      },      
      error: (e) => {
        console.error(e);
      },
      complete: () => {
        this.dataSource = new MatTableDataSource(this.listAgencias);
        this.dataSource.paginator = this.paginator;
        this._show_spinner = false;
      }
    })
  }

}
