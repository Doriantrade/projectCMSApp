import { Component, Inject, OnInit } from '@angular/core';
import { MantenimientoComponent } from '../tabla-help-desk/mantenimiento/mantenimiento.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MantenimientoService } from '../tabla-help-desk/mantenimiento/services/mantenimiento.service';
import { Environments } from 'src/app/environments/environments';
import { FormControl, FormGroup } from '@angular/forms';

import Swal from 'sweetalert2'
import { FechaRealComponent } from '../tabla-help-desk/fecha-real/fecha-real.component';

// Configuración de Toast para mensajes
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
	selector: 'app-modal-tecnicos',
	templateUrl: './modal-tecnicos.component.html',
	styleUrls: ['./modal-tecnicos.component.scss']
})
export class ModalTecnicosComponent implements OnInit {

	_show_spinner: boolean = false;
	// Cambiado a un solo objeto para almacenar el técnico elegido (selección única)
	listaTecElegidos: any = null; 
	listaTecnicos: any = [];
	listaTecnicosGhost: any = [];
	modelCrono: any = [];
	modelMantenimiento: any = [];
	idAgencia: any;
	
	// Formulario para filtros
	tecnicosSearchForm = new FormGroup ({
		localidad: new FormControl(null), // Inicializado a null
		filter: 	new FormControl()
	})

	constructor( public dialog: MatDialog,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private env: Environments,
		private mant: MantenimientoService,
		public dialogRef: MatDialogRef<FechaRealComponent>) {}

	asignacionFechaInicial: any;
	asignacionFechaFinal: any;
	asignacionHoraInicial: any;
	asignacionHoraFina: any;
	listaLocalidades: any = [];

	ngOnInit(): void {
		this.asignacionFechaInicial = this.data.horaInicialReal;
		this.asignacionFechaFinal = this.data.horaFinalReal;

		this.idAgencia = this.data.idAgencia;
		this.obtenerLocalidades();
		this.obtenerTecnicosRecomendadosCMS(this.idAgencia);
	}

	obtenerTecnicosRecomendadosCMS(id:any) {
		this._show_spinner = true;
		this.listaTecnicos = [];
		this.listaTecnicosGhost = [];
		this.mant.obtenerLocalidadesAgencia(id).subscribe({
			next: (x) => {
				this.listaTecnicos = x;
				console.table(x);
				this.listaTecnicosGhost = x;
				this._show_spinner = false;
			}, error: (e) => {
				this._show_spinner = false;
				console.error(e);
			}
		})
	}

	obtenerTecnicos(id:any) {
		this._show_spinner = true;
		this.listaTecnicos = [];
		this.listaTecnicosGhost = [];
		this.mant.obtenerUsuariosCronos(id).subscribe({
			next: (x) => {
				this.listaTecnicos = x;
				this.listaTecnicosGhost = x;
				this._show_spinner = false;
			} ,error: (e) => {
				this._show_spinner = false;
				console.error(e);
			}
		})
	}

	filtrotTecnicos() {
		let filter: any = this.tecnicosSearchForm.controls['filter'].value;
		if (!filter) {
			this.listaTecnicos = this.listaTecnicosGhost;
			return;
		}
		this.listaTecnicos = this.listaTecnicosGhost.filter((item: any) =>
			item.nombre.toString().toLowerCase().includes(filter.toLowerCase()) ||
			item.apellido.toString().toLowerCase().includes(filter.toLowerCase()) ||
			item.nombreEstado.toString().toLowerCase().includes(filter.toLowerCase()) ||
			item.nombreProvincia.toString().toLowerCase().includes(filter.toLowerCase()) ||
			item.telf.toString().toLowerCase().includes(filter.toLowerCase()) ||
			item.nombreLicencia.toString().toLowerCase().includes(filter.toLowerCase())
		)
	}

	// Al hacer clic en la fila, seleccionamos el técnico (como si fuera radio)
	selectRow(tecnico: any) {
		// Deseleccionar el técnico previamente seleccionado en la lista visual
		this.listaTecnicos.forEach((t: any) => {
			if (t !== tecnico) {
				t.selected = false;
			}
		});

		// Forzar selección del técnico actual
		tecnico.selected = true; 
		this.listaTecElegidos = tecnico;
		
		console.log('Técnico seleccionado:', this.listaTecElegidos);
	}

	// Al cambiar el estado del radio button
	onRadioChange(tecnico: any) {
		// Sincronizar el estado visual del resto de la tabla
		this.listaTecnicos.forEach((t: any) => {
			if (t.coduser !== tecnico.coduser) {
				t.selected = false;
			} else {
				t.selected = true;
			}
		});
		
		// Asignar el técnico a la variable de selección única
		this.listaTecElegidos = tecnico;
		console.log('Técnico seleccionado (Radio):', this.listaTecElegidos);
	}


	obtenerLocalidades() {
		this.mant.obtenerLocalidades().subscribe({
			next: (x) => {
				this.listaLocalidades = x;
			}, error: (e) => {
				console.error(e);
			}, complete: () => {
			}
		})
	}


	localidadEncontrada: any;
	// Modificado para obtener la localidad por provincia SOLO si es necesario
	construirLaData() {
		if (!this.listaTecElegidos) return;

		console.log('Buscando Localidad por Provincia para el técnico...');
		const tec = this.listaTecElegidos;

		// Aquí se realiza la llamada al servicio para obtener la localidad por codprov
		this.mant.obtenerLocalidadPorProvincia(tec.codprov.toString().trim()).subscribe({
			next: (x:any) => {
				if (x && x.length > 0) {
					tec.idlocalidad = x[0].idlocalidad;
					tec.nombreLocalidad = x[0].nombreLocalidad;
				} else {
					console.warn(`No se encontró localidad para la provincia: ${tec.codprov}`);
				}
				// Cerramos el diálogo después de la operación asíncrona (éxito o falla en encontrar)
				this.dialogRef.close(this.listaTecElegidos);
			}, error: (e) => {
				console.error(e);
				// Cerramos el diálogo aunque haya error en el servicio
				this.dialogRef.close(this.listaTecElegidos); 
			}
		})
	}

	closeDialog() {


		// Obtenemos el valor de la localidad del FormControl
		const localidadSeleccionadaId = this.tecnicosSearchForm.controls['localidad'].value;

		// VALIDACIÓN CLAVE: Si NO hay una localidad seleccionada, llamamos a construirLaData() 
		// para obtener los datos de localidad por provincia.
		if (localidadSeleccionadaId === null || localidadSeleccionadaId === undefined) {
			console.log('Localidad NO seleccionada en el select. Buscando por provincia...');
			this.construirLaData();
		} else {

			// Buscamos el objeto de la localidad para obtener el nombre
			const localidadObj = this.listaLocalidades.find((loc: any) => loc.id == Number(localidadSeleccionadaId));      
			if (localidadObj) {
        	// Asignamos los campos de localidad al técnico elegido
        this.listaTecElegidos.idlocalidad = localidadObj.id;
        this.listaTecElegidos.nombreLocalidad = localidadObj.nombreLocalidad;
			} else {
				console.warn('Localidad seleccionada no encontrada en la lista de localidades.');
			}

			// Cerramos el diálogo con el técnico modificado/asignado
			this.dialogRef.close(this.listaTecElegidos);
		}
	}
}