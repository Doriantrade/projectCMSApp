import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
// Asegúrate de que esta ruta sea correcta y que FileDetails esté exportada desde tu servicio
import { ImagecontrolService } from '../../shared/imagen-control/imagecontrol.service';

@Component({
  selector: 'app-docu-iess',
  templateUrl: './docu-iess.component.html',
  styleUrls: ['./docu-iess.component.scss']
})
export class DocuIESSComponent implements OnInit {

  // Define el FormGroup para tu formulario
  IessDocuRegisterForm = new FormGroup({
    docuPDF: new FormControl(null, Validators.required),
  });

  pdfPreviewUrl: SafeUrl | null = null;
  selectedPdfFile: File | null = null;
  // Cambiado a array para soportar la tabla, incluso si solo hay un elemento
  fetchedFileDetails: any = [];

  constructor(
    private sanitizer: DomSanitizer,
    private fileServ: ImagecontrolService
  ) {}

  ngOnInit(): void {
    // Al iniciar el componente, llama a la función para obtener los detalles del archivo del mes actual.
    // Se añade un pequeño retraso para que la UI se renderice antes de la alerta de carga.
    setTimeout(() => {
      this.fetchCurrentMonthFileDetails();
    }, 500); // 500ms de retraso
  }

  /**
   * Construye el nombre de la carpeta y del archivo para el mes y año actuales
   * y llama a getFileDetailsFromApi.
   */
  public fetchCurrentMonthFileDetails(): void {
    const date = new Date();
    const year = date.getFullYear();
    // El mes es 0-indexado, sumamos 1 y usamos padStart para asegurar 2 dígitos (ej. 6 -> 06)
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    // Construye los nombres de la carpeta y del archivo con el formato esperado
    const folderName = `IESS_ingreso_tecnicos_${year}_${month}`;
    const fileName = `${folderName}.pdf`;

    this.getFileDetailsFromApi(folderName, fileName);
  }

  /**
   * Maneja el evento de selección de archivo.
   * Valida que el archivo sea un PDF, lo renombra y prepara la previsualización.
   * @param event El evento de cambio del input de tipo 'file'.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file.type === 'application/pdf') {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');

        const newFileName = `IESS_ingreso_tecnicos_${currentYear}_${currentMonth}.pdf`;

        const renamedFile:any = new File([file], newFileName, {
          type: file.type,
          lastModified: file.lastModified
        });

        this.selectedPdfFile = renamedFile;
        // Previsualiza el archivo recién seleccionado
        this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(renamedFile)
        );

        this.IessDocuRegisterForm.get('docuPDF')?.setValue(renamedFile);
        this.IessDocuRegisterForm.get('docuPDF')?.updateValueAndValidity();

        Swal.fire({
          icon: 'success',
          title: 'Archivo cargado',
          text: `PDF seleccionado y renombrado a '${newFileName}'.`,
          showConfirmButton: false,
          timer: 2000
        });
      } else {
        this.selectedPdfFile = null;
        this.pdfPreviewUrl = null; // Limpia la previsualización si el archivo es inválido
        this.IessDocuRegisterForm.get('docuPDF')?.setValue(null);
        this.IessDocuRegisterForm.get('docuPDF')?.updateValueAndValidity();

        if (input) {
          input.value = '';
        }

        Swal.fire({
          icon: 'error',
          title: 'Tipo de archivo inválido',
          text: 'Por favor, selecciona solo archivos PDF.',
          confirmButtonText: 'Entendido'
        });
      }
    } else {
      this.selectedPdfFile = null;
      this.pdfPreviewUrl = null; // Limpia la previsualización si no se selecciona ningún archivo
      this.IessDocuRegisterForm.get('docuPDF')?.setValue(null);
      this.IessDocuRegisterForm.get('docuPDF')?.updateValueAndValidity();
    }
  }

  /**
   * Maneja el envío del formulario.
   * Llama al servicio para enviar el archivo PDF a tu backend.
   * Tras una subida exitosa, se intentan obtener y mostrar los detalles del archivo.
   */
  onSubmit(): void {
    this.IessDocuRegisterForm.markAllAsTouched();

    if (this.IessDocuRegisterForm.valid && this.selectedPdfFile) {
      // console.log('Formulario válido. Archivo PDF a enviar:', this.selectedPdfFile);

      const nombreArchivo = this.selectedPdfFile.name;
      const nombreCarpeta = nombreArchivo.substring(0, nombreArchivo.lastIndexOf('.')) || nombreArchivo;

      Swal.fire({
        title: 'Subiendo documento...',
        text: 'Por favor, espera.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.fileServ.uploadFile(this.selectedPdfFile, nombreCarpeta).subscribe({
        next: (uploadResponse) => {
          Swal.fire({
            icon: 'success',
            title: '¡Subida exitosa!',
            text: 'Documento subido correctamente. Actualizando detalles...',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            // Después de una subida exitosa, vuelve a cargar los detalles del archivo actual
            this.fetchCurrentMonthFileDetails();
          });
        },
        error: (uploadError) => {
          console.error('Error al subir el documento:', uploadError);
          Swal.fire({
            icon: 'error',
            title: 'Error al subir',
            text: `Hubo un problema al subir el documento: ${uploadError.message || uploadError.error?.message || 'Error desconocido'}.`,
            confirmButtonText: 'Entendido'
          });
          this.resetForm();
        }
      });

    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor, selecciona un archivo PDF antes de enviar.',
        confirmButtonText: 'Ok'
      });
    }
  }

  /**
   * Llama a la API para obtener los detalles del archivo y los muestra.
   * Si el archivo se encuentra, se añade a `fetchedFileDetails`.
   * @param folderName El nombre de la carpeta.
   * @param fileName El nombre completo del archivo.
   */
  getFileDetailsFromApi(folderName: string, fileName: string): void {
    Swal.fire({
      title: 'Obteniendo detalles...',
      text: 'Buscando información del archivo en el servidor.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.fileServ.getFileDetails(folderName, fileName).subscribe({
      next: (details: any) => {
        // Almacena los detalles como un array con el único elemento encontrado
        this.fetchedFileDetails = [details];
        console.table(this.fetchedFileDetails);

        Swal.fire({
          icon: 'info',
          title: 'Documento Encontrado',
          html: `
            <div style="text-align: left; margin: 0 auto; max-width: 280px; font-family: 'Inter', sans-serif;">
              <p style="margin-bottom: 8px;"><b>Nombre:</b><br>${details.nombreArchivo}</p>
              <p><b>Tamaño:</b> ${details.tamano}</p>
            </div>
          `,
          confirmButtonText: 'Cerrar',
          customClass: {
            title: 'text-lg font-semibold',
            htmlContainer: 'text-sm'
          }
        });
        // Si el propósito es solo mostrar, no reseteamos el formulario aquí,
        // ya que la información se ha solicitado al cargar el componente.
        // this.resetForm(); // Comentado para que los detalles puedan permanecer visibles o la lógica posterior se ejecute.
      },
      error: (error) => {
        console.error('Error al obtener los detalles del archivo:', error);
        this.fetchedFileDetails = []; // Limpia la lista si no se encuentra el archivo
        const errorMessage = error.status === 404 ?
                             'El documento del mes actual no fue encontrado en el servidor.' :
                             `Hubo un problema al obtener los detalles: ${error.message || error.error?.message || 'Error desconocido'}.`;

        Swal.fire({
          icon: 'error',
          title: 'Error de búsqueda',
          text: errorMessage,
          confirmButtonText: 'Entendido'
        });
        // this.resetForm(); // Comentado por la misma razón que arriba
      }
    });
  }

  /**
   * Previsualiza un archivo PDF específico desde la tabla.
   * Este método descarga el Blob del archivo y lo muestra en el iframe.
   * @param itemFile Los detalles del archivo a previsualizar.
   */
  onPreviewFile(itemFile: any): void {
    // Para la previsualización, necesitamos el nombre de la carpeta.
    // Asumimos que el nombre de la carpeta es el nombre del archivo sin la extensión.
    const folderName = itemFile.nombreArchivo.substring(0, itemFile.nombreArchivo.lastIndexOf('.')) || itemFile.nombreArchivo;

    Swal.fire({
      title: 'Cargando previsualización...',
      text: 'Por favor, espera.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.fileServ.downloadFile(folderName, itemFile.nombreArchivo).subscribe({
      next: (blob: Blob) => {
        Swal.close(); // Cierra el SweetAlert de carga
        // Crea una URL para el Blob y la asigna a pdfPreviewUrl
        this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
        Swal.fire({
          icon: 'success',
          title: 'Previsualización lista',
          text: 'El documento se ha cargado en el previsualizador.',
          showConfirmButton: false,
          timer: 1500
        });
      },
      error: (error) => {
        console.error('Error al previsualizar el archivo:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error de previsualización',
          text: `No se pudo cargar el documento para previsualizar: ${error.message || error.error?.message || 'Error desconocido'}.`,
          confirmButtonText: 'Entendido'
        });
        this.pdfPreviewUrl = null; // Limpia la previsualización en caso de error
      }
    });
  }

  /**
   * Resetea el formulario y las variables de previsualización.
   * Se llama después de una subida exitosa.
   */
  private resetForm(): void {
    this.IessDocuRegisterForm.reset();
    this.pdfPreviewUrl = null;
    this.selectedPdfFile = null;
    // No reseteamos fetchedFileDetails aquí porque queremos que permanezca en la tabla
    // this.fetchedFileDetails = []; // Comentado intencionalmente
    const inputElement = document.getElementById('docuPDF') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
    }
  }
}
