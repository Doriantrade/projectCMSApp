import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';


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
  selector: 'app-bodegas',
  templateUrl: './bodegas.component.html',
  styleUrls: ['./bodegas.component.scss']
})
export class BodegasComponent implements OnInit {
  pMod: number = 4;


  _dis_back_btn: boolean = false;

  @Input() modulo: any = [];

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  _worka1:            boolean = true;
  _crear_bodega:      boolean = false;
  _kardex_bodega:     boolean = false;
  _producto_bodega:   boolean = false;
  _delete_show:       boolean = true;
  ccia:               any;
  _cancel_button:     boolean = false;
  _icon_button:       string = 'add';
  _action_butto:      string = 'Crear';
  tipoEmpresaLista:   any = [];
  _show_spinner:      boolean = false; 
  columnHead:         any = [ 'edit', 'N.Agen.', 'nombre', 'R.U.C.', 'replegal', 'descripcion', 'fechas' ];
  public dataSource!: MatTableDataSource<any>;

  constructor() { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

  }

  optionApps( type: number ) {
    switch( type ) {
      case 0:
        this._crear_bodega = false;
        this._worka1 = true;
        this._dis_back_btn = false;
        this._producto_bodega = false;
        this._kardex_bodega = false;
        break;
      case 1:
        this._dis_back_btn = true;
        this._crear_bodega = true;
        this._worka1 = false;
        this._producto_bodega = false;
        this._kardex_bodega = false;
        break;
      case 2:
        this._crear_bodega = false;
        this._worka1 = false;
        this._dis_back_btn = true;
        this._producto_bodega = true;
        this._kardex_bodega = false;
        break;
      case 3:
        this._crear_bodega = false;
        this._worka1 = false;
        this._dis_back_btn = true;
        this._producto_bodega = false;
        this._kardex_bodega = true;
        break;
      case 4:
        this._crear_bodega = false;
        this._worka1 = false;
        this._dis_back_btn = false;
        this._producto_bodega = false;
        this._kardex_bodega = false;
        break;

    }
  }

}
