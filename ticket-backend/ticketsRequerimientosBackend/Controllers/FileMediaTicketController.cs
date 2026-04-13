using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using ticketsRequerimientosBackend.auditoria_services;
using ticketsRequerimientosBackend.Models;
using ticketsRequerimientosBackend.ModelsDto;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/FileMediaTicket")]
    [ApiController]
    public class FileMediaTicketController : ControllerBase
    {

        private readonly cmsDb2024Context _context;
        private readonly IHubContext<AprobarCotizacionHub> _hubAproCotiContext;
        private readonly IHubContext<fileAlertHub> _hubfileAlert;
        private readonly IHubContext<FileDelete> _fileDeleteHub;
        private readonly OperacionesAuditoriaService _operacionesAuditoria;
        public FileMediaTicketController(cmsDb2024Context context,
                                         IHubContext<AprobarCotizacionHub> hubAproCotiContext,
                                         IHubContext<fileAlertHub> hubfileAlert,
                                         IHubContext<FileDelete> fileDeleteHub,
                                         OperacionesAuditoriaService operacionesAuditoria)
        {
            _context = context;
            _hubAproCotiContext = hubAproCotiContext;
            _operacionesAuditoria = operacionesAuditoria;
            _fileDeleteHub = fileDeleteHub;
            _hubfileAlert = hubfileAlert;
        }

        [Authorize]
        [HttpDelete("EliminarArchivoTicket/{id}/{tipo}")]
        public async Task<IActionResult> EliminarArchivoTicket([FromRoute] int id, [FromRoute] string tipo)
        {
            // 1. Obtener el archivo de manera asíncrona
            var archivo = await _context.FileMediaTicket
                .AsNoTracking() // Solo lectura
                .FirstOrDefaultAsync(x => x.Id == id);

            if (archivo == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = $"No se encontró el archivo con ID {id}"
                });
            }

            // 2. Registrar auditoría
            try
            {
                await _operacionesAuditoria.RegistrarEliminacion(
                    archivo, // Pasar el objeto ya cargado
                    id.ToString(),
                    User,
                    "ELIMINAR_ARCHIVO_MEDIA",
                    0 // Código de módulo para archivos (ajusta según tu sistema)
                );
            }
            catch (Exception ex)
            {
                // Manejo de errores de auditoría
            }

            // 3. Eliminar el archivo
            try
            {
                var filasEliminadas = await _context.FileMediaTicket
                    .Where(b => b.Id == id)
                    .ExecuteDeleteAsync();

                if (filasEliminadas > 0)
                {
                    // Creamos el DTO con la información del archivo eliminado, usando el DTO que proporcionaste
                    var fileData = new FileDelDto
                    {
                        IdTicket = (int)archivo.IdTicketRequerimiento,
                        CodFile = archivo.Id,
                        Tipo = tipo
                    };

                    // Enviamos la notificación a todos los clientes conectados al hub
                    await _fileDeleteHub.Clients.All.SendAsync("FileDeleteSignalHub", fileData);
                    return Ok();

                }
                else
                {
                    return BadRequest(new { success = false, message = "No se pudo eliminar el archivo" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error interno al eliminar el archivo",
                    error = ex.Message
                });
            }
        }

        //[Authorize]
        [HttpPost]
        [Route("GuardarFileMediaTicketUnit")]
        public async Task<IActionResult> GuardarFileMediaTicketUnit([FromBody] FileMediaTicket model)
        {
            if (model == null)
            {
                return BadRequest("El resumen de mantenimiento es inexistente");
            }
            else
            {
                _context.FileMediaTicket.Add(model);
                await _context.SaveChangesAsync();
                var res = _context.FileMediaTicket.FirstOrDefault(x => x.IdTicketRequerimiento == model.IdTicketRequerimiento && x.Observacion == model.Observacion);
                return Ok(res);
            }
        }

        //[Authorize]
        [HttpPost]
        [Route("GuardarFileMediaTicket")]
        public async Task<IActionResult> GuardarFileMediaTicket([FromBody] ModelMultiDataFileMedia model)
        {
            if (model.fileMediaData == null)
            {
                return BadRequest("El resumen de mantenimiento es inexistente");
            }
            else
            {
                _context.FileMediaTicket.Add(model.fileMediaData);
                await _context.SaveChangesAsync();
                var res = _context.FileMediaTicket.FirstOrDefault(x => x.IdTicketRequerimiento == model.fileMediaData.IdTicketRequerimiento && x.Observacion == model.fileMediaData.Observacion);

                // Envía la notificación tunel SignaL R
                await _hubfileAlert.Clients.All.SendAsync("ReceiveFileAlert", model.cantFileData);

                return Ok(res);
            }
        }

        [HttpGet]
        [Route("ObtenerFileMediaTicket/{idRequerimiento}/{type}")]
        public IActionResult ObtenerFileMediaTicket([FromRoute] int idRequerimiento, [FromRoute] string type)
        {
            var res = (from file in _context.FileMediaTicket
                       where file.IdTicketRequerimiento == idRequerimiento && file.Type == type
                       select new {
                                file,
                                // Subconsulta para obtener la primera cotización coincidente (o null)
                                cotiza = _context
                                            .CabCotiza
                                            .Where( c => c.IdRepoTec == file.IdTicketRequerimiento && c.Estado > 0 )
                                            .FirstOrDefault()
                            }
                       )
                      .Select(x => new
                      {
                          x.file.Id,
                          x.file.Fecrea,
                          x.file.Usercrea,
                          x.file.FileUrl,
                          x.file.IdTicketRequerimiento,
                          x.file.Observacion,
                          x.file.Estado,
                          x.file.Permisos,
                          x.file.Type,

                          // Campo de CabCotiza (null si no hay coincidencia)
                          EstadoCotizaCab = x.cotiza != null ? x.cotiza.Estado : (int?)null,

                          // Lógica para ColorEstado:
                          ColorEstado = (x.cotiza != null && x.cotiza.Estado == 0) ? "#FF4500" :
                                        x.file.Estado == 1 ? "#ece4c3" :
                                        x.file.Estado == 2 ? "#91df0a" :
                                        "#ffffff"
                      })
                      .ToList();

            // ... (El resto de la lógica de la respuesta es correcta)
            if (res.Count > 0)
            {
                return Ok(res);
            }
            else
            {
                return Ok("No se ha podido encontrar la referencia de este archivo en el servidor");
            }
        }


        [Authorize]
        [HttpGet]
        [Route("ActualizarEstadoFileMediaTicket/{id}/{estado}/{idRequer}")]
        public async Task<IActionResult> ActualizarEstadoFileMediaTicket(
    [FromRoute] int id,
    [FromRoute] int estado,
    [FromRoute] int idRequer)
        {
            //Console.WriteLine($"=== INICIO DEBUG === | id: {id}, estado: {estado}, idRequer: {idRequer}");

            try
            {
                // 1. Buscar FileMediaTicket
                //Console.WriteLine($"Buscando FileMediaTicket con id: {id}...");
                var fileMediaTicket = await _context.FileMediaTicket.FindAsync(id);

                if (fileMediaTicket == null)
                {
                    //Console.WriteLine("❌ FileMediaTicket no encontrado.");
                    return NotFound("FileMediaTicket no encontrado.");
                }
                Console.WriteLine($"✅ FileMediaTicket encontrado. Estado actual: {fileMediaTicket.Estado}");

                // 2. Buscar repuestos relacionados
                //Console.WriteLine($"Buscando repuestos para idRequer: {idRequer}...");
                var repuestosRequer = await _context.AsignRepuRequer
                                                  .Where(x => x.IdRequer == idRequer)
                                                  .ToListAsync();

                if (repuestosRequer == null || !repuestosRequer.Any())
                {
                    //Console.WriteLine("❌ No hay repuestos asociados al requerimiento.");
                    return NotFound("No se encontraron repuestos asociados al requerimiento. \n Por eso no puede aprobarse.");
                }
                //Console.WriteLine($"✅ Repuestos encontrados: {repuestosRequer.Count}");

                // 3. Actualizar estados
                //Console.WriteLine($"Actualizando estado de FileMediaTicket a: {estado}...");
                fileMediaTicket.Estado = estado;
                _context.Entry(fileMediaTicket).Property(f => f.Estado).IsModified = true;

                //Console.WriteLine("Actualizando estados de repuestos...");
                foreach (var repuesto in repuestosRequer)
                {
                    Console.WriteLine($"  - Repuesto ID: {repuesto.Id}, Estado anterior: {repuesto.Estado}, Nuevo estado: {estado}");
                    repuesto.Estado = estado;
                    _context.Entry(repuesto).Property(r => r.Estado).IsModified = true;
                }

                // 4. Guardar cambios
                //Console.WriteLine("Guardando cambios en BD...");
                var saveResult = await _context.SaveChangesAsync() > 0;

                if (saveResult)
                {
                    //Console.WriteLine("✅ Cambios guardados correctamente.");

                    // 5. Recuperar datos para el Hub
                    //Console.WriteLine("Recuperando datos para el Hub...");
                    var fileMediaData = await (from fm in _context.FileMediaTicket
                                               join tqr in _context.TicketRequerimiento on fm.IdTicketRequerimiento equals tqr.IdTicket into tqrJoin
                                               from tqr in tqrJoin.DefaultIfEmpty()

                                               join ag in _context.Agencia on tqr.IdAgencia equals ag.Codagencia into agJoin
                                               from ag in agJoin.DefaultIfEmpty()

                                               join cli in _context.Cliente on ag.Codcliente equals cli.Codcliente into cliJoin
                                               from cli in cliJoin.DefaultIfEmpty()

                                               join imf in _context.ImgFile.Where(imf => imf.Tipo == "Cliente")
                                                   on ag.Codcliente equals imf.Codentidad into imfJoin
                                               from imf in imfJoin.DefaultIfEmpty()

                                               where fm.Id == id
                                               select new
                                               {
                                                   fm.Estado,
                                                   fm.FileUrl,
                                                   fm.Type,
                                                   fm.Id,
                                                   fm.IdTicketRequerimiento,
                                                   NombreAgencia = ag.Nombre,
                                                   NombreCliente = cli.Nombre,
                                                   Imagen = imf.Imagen
                                               }).FirstOrDefaultAsync();

                    //Console.WriteLine($"Datos para el Hub: {JsonSerializer.Serialize(fileMediaData)}");

                    // 6. Enviar al Hub
                    //Console.WriteLine("Enviando datos al Hub...");
                    await _hubAproCotiContext.Clients.All
                                         .SendAsync("SendAprobarCotizacionHub", fileMediaData, repuestosRequer);
                    //Console.WriteLine("✅ Datos enviados al Hub.");

                    return Ok();
                }
                else
                {
                    //Console.WriteLine("❌ No se pudieron guardar los cambios.");
                    return BadRequest("No se pudo guardar los cambios.");
                }
            }
            catch (Exception ex)
            {
                //Console.WriteLine($"‼️ ERROR: {ex.ToString()}");
                return BadRequest($"Ocurrió un error: {ex.Message}");
            }
            finally
            {
                Console.WriteLine("=== FIN DEBUG ===");
            }
        }

    }
}
