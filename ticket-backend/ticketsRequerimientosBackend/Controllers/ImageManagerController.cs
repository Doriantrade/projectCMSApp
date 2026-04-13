using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/Imagen")]
    [ApiController]
    public class ImageManagerController : ControllerBase
    {
        [HttpGet]
        [Route("downloadFile2/{nombreCarpeta}/{nombreArchivo}")]
        public IActionResult DownloadFile2([FromRoute] string nombreCarpeta, [FromRoute] string nombreArchivo)
        {
            // Construye la ruta base donde se almacenan los archivos
            string storageRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "storage");

            // Construye la ruta completa al archivo combinando la raíz de almacenamiento, el nombre de la carpeta y el nombre del archivo
            string filePath = Path.Combine(storageRootPath, nombreCarpeta, nombreArchivo);

            // Muestra la ruta construida en la consola del servidor para depuración
            //Console.WriteLine("::::::::::::::::::::::::::::::::::::::::::::;");
            //Console.WriteLine("Ruta de descarga solicitada:");
            //Console.WriteLine(filePath);
            //Console.WriteLine("::::::::::::::::::::::::::::::::::::::::::::;");

            // Verifica si el archivo existe en la ruta especificada
            if (!System.IO.File.Exists(filePath))
            {
                // Si el archivo no se encuentra, devuelve un error 404 Not Found con un mensaje descriptivo
                return NotFound(new { message = $"El archivo '{nombreArchivo}' no fue encontrado en la carpeta '{nombreCarpeta}'." });
            }

            try
            {
                // Determina el tipo de contenido (MIME type) del archivo.
                // Para PDFs, generalmente es "application/pdf". Puedes expandir esto para otros tipos de archivo.
                string contentType = "application/pdf";

                // Devuelve el archivo como un FileStreamResult. Esto permite al navegador descargar o previsualizar el archivo.
                // File.OpenRead(filePath) abre el archivo para lectura.
                // contentType especifica el tipo MIME.
                // nombreArchivo proporciona el nombre de archivo sugerido para la descarga.
                return File(System.IO.File.OpenRead(filePath), contentType, nombreArchivo);
            }
            catch (Exception ex)
            {
                // Captura cualquier excepción que pueda ocurrir durante el proceso de apertura o lectura del archivo
                // y devuelve un error 500 Internal Server Error con los detalles del error
                return StatusCode(500, new { message = "Error interno del servidor al intentar descargar el archivo.", error = ex.Message });
            }
        }


        [HttpGet]
        [Route("obtenerDetallesArchivo/{nombreCarpeta}/{nombreArchivo}")]
        public IActionResult ObtenerDetallesArchivo([FromRoute] string nombreCarpeta, [FromRoute] string nombreArchivo)
        {
            string storageRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "storage");

            // --- Lógica mejorada para encontrar la carpeta flexiblemente (manejo de _6 vs _06) ---
            string actualFolderName = nombreCarpeta;
            // Intenta extraer el año y el mes de la cadena de la carpeta
            var folderMatch = Regex.Match(nombreCarpeta, @"^IESS_ingreso_tecnicos_(\d{4})_(\d{1,2})$");
            if (folderMatch.Success)
            {
                string year = folderMatch.Groups[1].Value;
                string month = folderMatch.Groups[2].Value;
                string paddedMonth = int.Parse(month).ToString("D2"); // Convierte el mes a formato de 2 dígitos (ej. 6 -> 06)

                string potentialPaddedFolderName = $"IESS_ingreso_tecnicos_{year}_{paddedMonth}";

                // Si el nombre de la carpeta actual no es el ya formateado y la versión formateada existe, usa esa
                if (nombreCarpeta != potentialPaddedFolderName && Directory.Exists(Path.Combine(storageRootPath, potentialPaddedFolderName)))
                {
                    actualFolderName = potentialPaddedFolderName;
                }
                // Si la original no tenía padding y la padded existe, o si la original ya tenía padding,
                // pero la carpeta no existe, y la versión sin padding existe, usaremos esa.
                // Esto es para asegurar que si la carpeta en disco es '..._6' y se pide '..._06', o viceversa, lo encuentre.
                else if (nombreCarpeta == potentialPaddedFolderName && !Directory.Exists(Path.Combine(storageRootPath, nombreCarpeta)))
                {
                    string potentialUnpaddedFolderName = $"IESS_ingreso_tecnicos_{year}_{int.Parse(month)}";
                    if (potentialUnpaddedFolderName != nombreCarpeta && Directory.Exists(Path.Combine(storageRootPath, potentialUnpaddedFolderName)))
                    {
                        actualFolderName = potentialUnpaddedFolderName;
                    }
                }
            }
            // --- Fin de lógica mejorada para carpeta ---

            // --- Lógica mejorada para encontrar el archivo flexiblemente (manejo de _6.pdf vs _06.pdf) ---
            string actualFileName = nombreArchivo;
            // Intenta extraer el año y el mes del nombre del archivo
            var fileMatch = Regex.Match(nombreArchivo, @"^IESS_ingreso_tecnicos_(\d{4})_(\d{1,2})\.pdf$");
            if (fileMatch.Success)
            {
                string year = fileMatch.Groups[1].Value;
                string month = fileMatch.Groups[2].Value;
                string paddedMonth = int.Parse(month).ToString("D2"); // Convierte el mes a formato de 2 dígitos

                string potentialPaddedFileName = $"IESS_ingreso_tecnicos_{year}_{paddedMonth}.pdf";

                // Si el nombre del archivo actual no es el ya formateado y la versión formateada existe, usa esa
                if (nombreArchivo != potentialPaddedFileName && System.IO.File.Exists(Path.Combine(storageRootPath, actualFolderName, potentialPaddedFileName)))
                {
                    actualFileName = potentialPaddedFileName;
                }
                // Si el original no tenía padding y el padded existe, o si el original ya tenía padding,
                // pero el archivo no existe, y la versión sin padding existe, usaremos esa.
                else if (nombreArchivo == potentialPaddedFileName && !System.IO.File.Exists(Path.Combine(storageRootPath, actualFolderName, nombreArchivo)))
                {
                    string potentialUnpaddedFileName = $"IESS_ingreso_tecnicos_{year}_{int.Parse(month)}.pdf";
                    if (potentialUnpaddedFileName != nombreArchivo && System.IO.File.Exists(Path.Combine(storageRootPath, actualFolderName, potentialUnpaddedFileName)))
                    {
                        actualFileName = potentialUnpaddedFileName;
                    }
                }
            }
            // --- Fin de lógica mejorada para archivo ---

            // Construye la ruta completa final al archivo usando los nombres 'actuales'
            string finalFilePath = Path.Combine(storageRootPath, actualFolderName, actualFileName);

            Console.WriteLine("::::::::::::::::::::::::::::::::::::::::::::;");
            Console.WriteLine("Ruta construida para verificar (ajustada):");
            Console.WriteLine(finalFilePath);
            Console.WriteLine("::::::::::::::::::::::::::::::::::::::::::::;");

            // Verifica si el archivo existe
            if (!System.IO.File.Exists(finalFilePath))
            {
                // Mensaje de error más descriptivo
                return NotFound(new { message = $"Archivo no encontrado. La ruta esperada era: '{finalFilePath}'. Verifique permisos y el nombre exacto del archivo/carpeta." });
            }

            try
            {
                // Obtiene información del archivo
                FileInfo fileInfo = new FileInfo(finalFilePath);
                long fileSizeInBytes = fileInfo.Length; // Tamaño en bytes
                string fileSizeDisplay;

                // Convierte el tamaño a KB o MB para una mejor visualización
                if (fileSizeInBytes >= 1024 * 1024) // Si es 1 MB o más
                {
                    fileSizeDisplay = $"{(double)fileSizeInBytes / (1024 * 1024):F2} MB"; // Formatea a 2 decimales
                }
                else // Si es menos de 1 MB, muestra en KB
                {
                    fileSizeDisplay = $"{(double)fileSizeInBytes / 1024:F2} KB"; // Formatea a 2 decimales
                }

                // Retorna un objeto anónimo con los detalles
                var fileDetails = new
                {
                    nombreArchivo = fileInfo.Name,
                    tamano = fileSizeDisplay
                };

                return Ok(fileDetails);
            }
            catch (Exception ex)
            {
                // Captura cualquier error durante la obtención de los detalles del archivo
                return StatusCode(500, new { message = "Error interno del servidor al obtener detalles del archivo.", error = ex.Message });
            }
        }

        [HttpPost]
        [Route("crearCarpeta/{nombre}")]
        public async Task<IActionResult> CrearCarpeta([FromForm] IMGmodelClass request, [FromRoute] string nombre)
        {
            // 1. Validar que el archivo no sea nulo de entrada
            if (request.Archivo == null || request.Archivo.Length == 0)
            {
                return BadRequest("No se proporcionó un archivo válido.");
            }

            // 2. Construir rutas de forma segura
            string rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "storage");
            string folderPath = Path.Combine(rootPath, nombre);

            try
            {
                // Crear la carpeta principal y la subcarpeta si no existen
                // CreateDirectory no falla si la carpeta ya existe, así que no necesitas el 'if'
                Directory.CreateDirectory(folderPath);

                string filePath = Path.Combine(folderPath, request.Archivo.FileName);

                // 3. Guardar el archivo
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.Archivo.CopyToAsync(stream);
                }

                return Ok(new { mensaje = "Carpeta y archivo creados con éxito", ruta = filePath });
            }
            catch (Exception err)
            {
                // Es mejor no devolver todo el objeto 'err' en producción por seguridad, 
                // pero para debug está bien.
                return BadRequest(new { error = err.Message, detalle = err.InnerException?.Message });
            }
        }

        [HttpPost]
        [Route("CrearCarpetaMobile/{ticketId}/{nombre}")] // Añadimos ticketId a la ruta
        public async Task<IActionResult> CrearCarpetaMobile(
            [FromForm] IMGmodelClass request,
            [FromRoute] int ticketId, // Nuevo parámetro
            [FromRoute] string nombre)
        {
            // 1. Validaciones iniciales
            if (request.Archivo == null || request.Archivo.Length == 0)
            {
                return BadRequest("No se proporcionó un archivo válido.");
            }

            // 2. Construir la jerarquía: Mobile_File -> ID del Ticket -> Nombre de carpeta
            // Usamos Path.Combine para evitar problemas con las barras diagonales (/)
            string rootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "storage", "Mobile_File");
            string ticketPath = Path.Combine(rootPath, ticketId.ToString());
            string finalFolderPath = Path.Combine(ticketPath, nombre);

            try
            {
                // Directory.CreateDirectory crea toda la cadena de carpetas si no existen
                // (Crea Mobile_File, luego el ticketId, luego el nombre)
                Directory.CreateDirectory(finalFolderPath);

                // Limpiamos el nombre del archivo para evitar caracteres maliciosos o errores de SO
                string fileName = Path.GetFileName(request.Archivo.FileName);
                string filePath = Path.Combine(finalFolderPath, fileName);

                // 3. Guardar el archivo usando 'using' para asegurar que el stream se cierre
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.Archivo.CopyToAsync(stream);
                }

                // Devolvemos una respuesta clara para el desarrollador de Flutter
                return Ok(new
                {
                    mensaje = "Archivo guardado con éxito",
                    ticketId = ticketId,
                    rutaRelativa = Path.Combine("storage", "Mobile_File", ticketId.ToString(), nombre, fileName)
                });
            }
            catch (Exception err)
            {
                return BadRequest(new
                {
                    error = "Error al procesar el archivo",
                    detalle = err.Message
                });
            }
        }

        [HttpPost]
        [Route("CrearCarpetaPDF/{nombre}/{idRequerimiento}")]
        public async Task<IActionResult> CrearCarpetaPDF([FromForm] IMGmodelClass request,
                                      [FromRoute] string nombre,
                                      [FromRoute] string idRequerimiento)
        {
            // Ruta base donde se almacenan los archivos
            string baseDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "storage", "pdfTicket");
            string folderPath = Path.Combine(baseDirectory, idRequerimiento, nombre);
            string filePath = ""; // Variable para almacenar la ruta del archivo

            try
            {
                // Validar y crear las carpetas si no existen
                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }
                
                // Validar que el archivo sea PDF o imagen antes de procesarlo
                if (request.Archivo is not null)
                {
                    // Lista de extensiones permitidas (PDF y formatos de imagen)
                    var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp" };
                    var fileExtension = Path.GetExtension(request.Archivo.FileName).ToLowerInvariant();

                    // Validar la extensión del archivo
                    if (allowedExtensions.Contains(fileExtension))
                    {
                        // Ruta completa del archivo (manteniendo el nombre original)
                        filePath = Path.Combine(folderPath, request.Archivo.FileName);

                        // Crear el archivo y copiar el contenido
                        using FileStream newFile = System.IO.File.Create(filePath);
                        await request.Archivo.CopyToAsync(newFile);
                        await newFile.FlushAsync();
                    }
                    else
                    {
                        return BadRequest(new
                        {
                            message = $"Tipo de archivo no permitido. Solo se permiten PDF y formatos de imagen.",
                            attemptedFile = request.Archivo.FileName
                        });
                    }
                }

                // Obtener la ruta relativa para el cliente
                string relativePath = Path.Combine("storage", "pdfTicket", idRequerimiento, nombre, request.Archivo?.FileName ?? "");

                return Ok(new
                {
                    message = "Archivo subido correctamente.",
                    filePath = relativePath, // Ruta relativa
                    fullPath = filePath // Ruta completa (opcional)
                });

            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = "Ocurrió un error al procesar la solicitud.",
                    error = ex.Message,
                    attemptedPath = filePath // Información adicional para debugging
                });
            }
        }

        [HttpPost]
        [Route("CrearCarpetaPDF2/{nombre}/{idRequerimiento}")]
        public async Task<IActionResult> CrearCarpetaPDF2([FromForm] IMGmodelClass request,
                                                [FromRoute] string nombre,
                                                [FromRoute] string idRequerimiento)
        {
            // Ruta base donde se almacenan los archivos
            string baseDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "storage", "pdfTicket");
            string folderPath = Path.Combine(baseDirectory, idRequerimiento, nombre);

            try
            {
                // Validar y crear las carpetas si no existen
                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }

                // Validar que el archivo sea PDF
                if (request.Archivo == null || !Path.GetExtension(request.Archivo.FileName).Equals(".pdf", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new { message = "Solo se permiten archivos PDF." });
                }

                // Generar nombre único para el archivo
                string fileName = $"Cotizacion_{DateTime.Now:yyyyMMddHHmmss}.pdf";
                string filePath = Path.Combine(folderPath, fileName);

                // Guardar el archivo
                using (FileStream newFile = System.IO.File.Create(filePath))
                {
                    await request.Archivo.CopyToAsync(newFile);
                    await newFile.FlushAsync();
                }

                // Retornar la ruta relativa del archivo
                string relativePath = $"/storage/pdfTicket/{idRequerimiento}/{nombre}/{fileName}";

                return Ok(new
                {
                    message = "Archivo subido correctamente.",
                    filePath = relativePath,
                    fileName = fileName
                });

            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = "Ocurrió un error al procesar la solicitud.",
                    error = ex.Message
                });
            }
        }

        [HttpGet]
        [Route("DescargarArchivo/{idTicket}/{nombreDelArchivo}")]
        public IActionResult DescargarArchivo([FromRoute] string idTicket, [FromRoute] string nombreDelArchivo)
        {

            // Decodificar el nombre del archivo
            string nombreArchivoDecodificado = Uri.UnescapeDataString(nombreDelArchivo);
            // Ruta base donde se almacenan los archivos
            string baseDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "storage", "pdfTicket");
            string filePath = Path.Combine(baseDirectory, idTicket, "Cotizaciones", nombreArchivoDecodificado);

            try
            {
                // Validar si el archivo existe
                if (!System.IO.File.Exists(filePath)) 
                {                
                    return NotFound(new { message = "El archivo no existe." });                
                }

                // Leer el archivo y devolverlo como respuesta
                var fileStream = System.IO.File.OpenRead(filePath);
                return File(fileStream, "application/pdf", nombreArchivoDecodificado);

            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
                return BadRequest(new { message = "Ocurrió un error al procesar la solicitud.", error = ex.Message });
            }
        }

        // "ReporteTecnico"
        // "Cotizaciones"
        // "Nota_Entrega"

        [HttpGet]
        [Route("DescargarArchivoRTecnico/{idTicket}/{nombreDelArchivo}/{type}")]
        public IActionResult DescargarArchivoRTecnico([FromRoute] string idTicket, [FromRoute] string nombreDelArchivo, [FromRoute] string type )
        {
            // Decodificar el nombre del archivo
            string nombreArchivoDecodificado = Uri.UnescapeDataString(nombreDelArchivo);

            // Ruta base donde se almacenan los archivos
            string baseDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "storage", "pdfTicket");
            string filePath = Path.Combine(baseDirectory, idTicket, type, nombreArchivoDecodificado);
            Console.WriteLine(filePath);
            try
            {
                // Validar si el archivo existe
                if (!System.IO.File.Exists(filePath))
                {

                    Console.WriteLine("El archivo no existe en la ruta especificada.");
                    return NotFound(new { message = "El archivo no existe." });

                }

                // Leer el archivo y devolverlo como respuesta
                var fileStream = System.IO.File.OpenRead(filePath);
                return File(fileStream, "application/pdf", nombreArchivoDecodificado);

            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
                return BadRequest(new { message = "Ocurrió un error al procesar la solicitud.", error = ex.Message });
            }
        }

        [HttpPost]
        [Route("imagenesMensajeria/{codRequerimiento}")]
        public async Task<IActionResult> imagenesMensajeria([FromForm] IMGmodelClass request,
                                                             [FromRoute] string codRequerimiento)
        {
            string fileModelpath = Path.Combine(Directory.GetCurrentDirectory() + "\\wwwroot", "filesMsj");
            string codRequerimientoPath = Path.Combine(fileModelpath, codRequerimiento);

            try
            {

                if (!Directory.Exists(fileModelpath))
                {
                    Directory.CreateDirectory(fileModelpath);
                }

                if (!Directory.Exists(codRequerimientoPath))
                {
                    Directory.CreateDirectory(codRequerimientoPath);
                }

                if (request.Archivo is not null)
                {
                    string filePath = Path.Combine(codRequerimientoPath, request.Archivo.FileName);
                    using FileStream newFile = System.IO.File.Create(filePath);
                    await request.Archivo.CopyToAsync(newFile);
                    await newFile.FlushAsync();
                }

                return Ok();

            }

            catch (Exception err)
            {
                return BadRequest(err);
            }

        }

        [HttpGet("download/{codRequerimiento}/{fileName}")]
        public IActionResult DownloadFile(string codRequerimiento, string fileName)
        {

            try
            {

                string fileModelpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "filesMsj", codRequerimiento);
                string filePath = Path.Combine(fileModelpath, fileName);

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { message = "Archivo no encontrado." });
                }

                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                var contentType = "application/octet-stream";
                return File(fileBytes, contentType, fileName);

            }

            catch (Exception ex)
            {
                return BadRequest(new { message = $"Ocurrió un error al descargar el archivo: {ex.Message}" });
            }

        }

    }
}
