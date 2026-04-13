import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ContratosComponent } from '../contratos/contratos.component';
import { FormControl, FormGroup } from '@angular/forms';
import { SharedService } from 'src/app/components/shared/services/shared.service';

@Component({
  selector: 'app-maquinaria-contrato',
  templateUrl: './maquinaria-contrato.component.html',
  styleUrls: ['./maquinaria-contrato.component.scss']
})
export class MaquinariaContratoComponent implements OnInit {
  pMod: number = 4;


  _show_spinner: boolean = false;
  tipoMaquinaLista:any = [];
  _dis_btn:boolean = true;
  constructor(private DataMaster: SharedService, public dialogRef: MatDialogRef<ContratosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) { }

    public maquinaForm = new FormGroup({
      cantidad:        new FormControl(''),
      codtipomaquina:   new FormControl(''),
    })

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.getDataMaster('MQT');
  }

  onSubmit() { 
    this.addMaqContrato();
  }

  listMaquinasContratos:any = [];
  addMaqContrato() {

    let nombremaquina: any;
    this.tipoMaquinaLista.filter((element:any)=>{
      if(this.maquinaForm.controls['codtipomaquina'].value == element.codigo ) {
        nombremaquina = element.nombre;
        console.warn(nombremaquina);
      }
    })

    this.listMaquinasContratos.push({
      nombretipo: nombremaquina,
      codigo: this.maquinaForm.controls['codtipomaquina'].value,
      cantidad: this.maquinaForm.controls['cantidad'].value,
    });
    this._dis_btn = true;
    console.warn(this.listMaquinasContratos)
    this.validate();
    this.sumcantMaquinas();
    this.clean();
    
  }

  sumatoriaCantMaquinas:number = 0;
  sumcantMaquinas() {
    this.sumatoriaCantMaquinas = 0;
    this.listMaquinasContratos.filter((element:any)=>{
      this.sumatoriaCantMaquinas += element.cantidad;
    })
  }

  eliminarItem(index: number) {
    this.listMaquinasContratos.splice(index, 1);
    this.sumcantMaquinas();
  }

  validate() {  
    if( this.maquinaForm.controls['codtipomaquina'].value == '' || this.maquinaForm.controls['codtipomaquina'].value == undefined || this.maquinaForm.controls['codtipomaquina'].value == null ) {
      this._dis_btn = true;
    }
    else if (  this.maquinaForm.controls['cantidad'].value == 0 ||  this.maquinaForm.controls['cantidad'].value == undefined || this.maquinaForm.controls['cantidad'].value == null ||  this.maquinaForm.controls['cantidad'].value == '' ) {
      this._dis_btn = true;
    }  
    else {
      this._dis_btn = false;
    }
  }

  clean() {
    this.maquinaForm.controls['codtipomaquina'].setValue('');
    this.maquinaForm.controls['cantidad'].setValue('');
  }

  /** OBTENER TIPO DE MAQUINAS */
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

  closeDialog() {
    this.dialogRef.close(this.listMaquinasContratos);
  }

}
