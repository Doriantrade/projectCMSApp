using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using ticketsRequerimientosBackend.Models;
using ticketsRequerimientosBackend.ModelsDto;
using System; // Necesario para DateTime y TimeSpan

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/AsignacionTecnicoTicket")]
    [ApiController]
    public class AsignacionTecnicoController : ControllerBase
    {

        private readonly cmsDb2024Context _context;
        private readonly IHubContext<TecnicosSendHub> _hubContext;
        private readonly IHubContext<HoraMantenimientoHub> _HoraMantenimientoHub;

        public AsignacionTecnicoController(cmsDb2024Context context, IHubContext<TecnicosSendHub> hubContext, IHubContext<HoraMantenimientoHub> horaMantenimientoHub)
        {
            _context = context;
            _hubContext = hubContext;
            _HoraMantenimientoHub = horaMantenimientoHub;
        }


        [Authorize]
        [HttpPost]
        [Route("guardarAsignTecnicoRequer")]
        public async Task<IActionResult> guardarAsignTecnicoRequer([FromBody] ModelAsignacionHubDto model)
        {
            // ... (Tu código existente para guardarAsignTecnicoRequer) ...
            try
            {
                // Validación básica
                if (model?.Asignacion == null || model.Tecnico == null)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Los datos de asignación y técnico no pueden ser nulos"
                    });
                }

                // Validación de campos mínimos requeridos
                if (model.Asignacion.IdRequerimiento <= 0 || string.IsNullOrEmpty(model.Asignacion.CodTenicUser))
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "El ID de requerimiento y código de técnico son obligatorios"
                    });
                }

                // Verificar si ya existe una asignación previa
                bool existeAsignacion = await _context.AsignacionTecnicoTicket
                    .AnyAsync(x => x.CodTenicUser == model.Asignacion.CodTenicUser
                                 && x.IdRequerimiento == model.Asignacion.IdRequerimiento);

                // Asignar valor de reasignación (1 si ya existe, 0 si es nueva)
                model.Asignacion.Reasignacion = existeAsignacion ? 1 : 0;

                // Guardar en la base de datos
                _context.AsignacionTecnicoTicket.Add(model.Asignacion);
                await _context.SaveChangesAsync();

                // Enviar datos del técnico a través de SignalR
                Console.WriteLine($"Preparando para enviar técnico: {model.Tecnico.Nombre}");

                // Enviar datos del técnico a través de SignalR
                if (_hubContext != null)
                {
                    Console.WriteLine("HubContext está disponible");
                    await _hubContext.Clients.All.SendAsync("SendTecnicosHubAsign", model.Tecnico);
                    // Mostrar el objeto completo en consola (opción 2 - serializado como JSON)
                    Console.WriteLine("\nDatos del técnico (JSON completo):");
                    Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(model.Tecnico, Newtonsoft.Json.Formatting.Indented));
                    Console.WriteLine("Mensaje enviado por SignalR");
                }
                else
                {
                    Console.WriteLine("HubContext es nulo - no se enviará notificación");
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Asignación guardada y notificada correctamente",
                    AsignacionId = model.Asignacion.IdAsignacionTecnico,
                    EsReasignacion = existeAsignacion
                });
            }
            catch (Exception ex)
            {
                // _logger.LogError(ex, "Error al guardar asignación técnica");
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Error interno al procesar la solicitud",
                    Error = ex.Message
                });
            }
        }

        [Authorize]
        [HttpGet("obtenerTecnicosTicket/{idRequer}")]
        public async Task<IActionResult> obtenerTecnicosTicket([FromRoute] int idRequer)
        {
            // ... (Tu código existente para obtenerTecnicosTicket) ...
            string Sentencia = "exec ObtenerAsignacionTecnicoReuqerimiento @idR";
            DataTable dt = new DataTable();

            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@idR", idRequer));
                    adapter.Fill(dt);
                }
            }

            if (dt == null || dt.Rows.Count == 0)
            {
                return Ok("No se ha encontrado ninguna asignación.");
            }

            // Convertir el DataTable a una lista de objetos anónimos
            var result = dt.AsEnumerable().Select(row => new
            {
                IdAsignacionTecnico = row["idAsignacionTecnico"],
                Imagen = row["imagen"],
                IdRequerimiento = row["idRequerimiento"],
                ResTecnico = row["resTecnico"],
                Reasignacion = row["reasignacion"],
                NombreTecnico = row["nombreTecnico"],
                Cedula = row["cedula"],
                Email = row["email"],
                Feciniciomante = row["feciniciomante"],
                Fecfinmant = row["fecfinmant"],
                Horainit = row["horainit"],
                Horafin = row["horafin"],

            }).ToList();

            return Ok(result);
        }

        [HttpGet]

        // --- NUEVA API ---
        //[Authorize]
        [HttpGet("actualizarHoraAsignacion/{idAsignacionTecnico}/{tipo}")]
        public async Task<IActionResult> actualizarHoraAsignacion(
       [FromRoute] int idAsignacionTecnico,
       [FromRoute] string tipo)
        {
            try
            {
                if (string.IsNullOrEmpty(tipo) || (tipo.ToUpper() != "E" && tipo.ToUpper() != "S"))
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "El parámetro 'tipo' es inválido. Debe ser 'E' (Entrada) o 'S' (Salida)."
                    });
                }

                var asignacion = await _context.AsignacionTecnicoTicket
                    .FirstOrDefaultAsync(a => a.IdAsignacionTecnico == idAsignacionTecnico);

                var resManteMacro = await _context.Mantemaqcro.FirstOrDefaultAsync( a => a.IdRequer == asignacion.IdRequerimiento );

                if (asignacion == null)
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = $"No se encontró la asignación con ID: {idAsignacionTecnico}"
                    });
                } else if ( resManteMacro == null )
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = $"No se encontró la el mantenimiento con ID de requerimiento: {idAsignacionTecnico}"
                    });
                }

                // Validar que exista un IdRequerimiento asociado
                if (!asignacion.IdRequerimiento.HasValue)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "La asignación no tiene un requerimiento/ticket asociado."
                    });
                }

                var now = DateTime.Now;
                var currentTimeString = now.ToString("HH:mm:ss"); // Formato string para SignalR
                var currentTimeSpan = now.TimeOfDay; // TimeSpan para la BD
                var fechaActual = now.Date;

                if (tipo.ToUpper() == "E")
                {
                    // Actualizar Hora Inicial (HoraIni)
                    asignacion.HoraIni = currentTimeSpan;
                    asignacion.FechaIni = fechaActual;
                    await _context.SaveChangesAsync();

                    // Crear modelo para SignalR
                    var signalRModel = new RequestMantenimientoTecnico
                    {
                        idTicket = asignacion.IdRequerimiento.Value, // Usamos .Value porque ya validamos que no es null
                        idAsignacionTecnico = idAsignacionTecnico,
                        tipo = "E",
                        HoraInicio = currentTimeString,
                        HoraFin = null
                    };

                    // Enviar por SignalR
                    await _HoraMantenimientoHub.Clients.All.SendAsync("SendHoraMantenimientoHub", signalRModel);

                    return Ok(new
                    {
                        Success = true,
                        Message = $"Hora Inicial (Entrada) actualizada correctamente. Nueva HoraIni: {currentTimeString}",
                        IdAsignacion = idAsignacionTecnico,
                        Data = signalRModel
                    });
                }
                else // tipo.ToUpper() == "S"
                {
                    // Validar que exista hora de entrada
                    if (asignacion.HoraIni == null || !asignacion.FechaIni.HasValue)
                    {
                        return BadRequest(new
                        {
                            Success = false,
                            Message = "No se puede registrar la hora de salida (S) sin una hora de entrada (E) previa."
                        });
                    }

                    // Calcular tiempo total si es necesario
                    TimeSpan tiempoTotal = TimeSpan.Zero;
                    if (asignacion.HoraIni.HasValue)
                    {
                        var fechaHoraInicio = asignacion.FechaIni.Value + asignacion.HoraIni.Value;
                        var fechaHoraFin = fechaActual + currentTimeSpan;
                        tiempoTotal = fechaHoraFin - fechaHoraInicio;
                    }

                    // Actualizar Hora Final (Horafin)
                    asignacion.Horafin = currentTimeSpan;
                    asignacion.FechaFin = fechaActual;
                    await _context.SaveChangesAsync();

                    // Crear modelo para SignalR
                    var signalRModel = new RequestMantenimientoTecnico
                    {
                        idTicket = asignacion.IdRequerimiento.Value,
                        idAsignacionTecnico = idAsignacionTecnico,
                        tipo = "S",
                        HoraInicio = asignacion.HoraIni?.ToString(@"hh\:mm\:ss") ?? string.Empty,
                        HoraFin = currentTimeString,
                        // Opcional: puedes agregar una propiedad para el tiempo total si quieres
                        // TiempoTotal = tiempoTotal.ToString(@"hh\:mm\:ss")
                    };

                    // Enviar por SignalR
                    await _HoraMantenimientoHub.Clients.All.SendAsync("SendHoraMantenimientoHub", signalRModel);

                    return Ok(new
                    {
                        Success = true,
                        Message = $"Hora Final (Salida) actualizada correctamente. Nueva HoraFin: {currentTimeString} | Tiempo total: {tiempoTotal.ToString(@"hh\:mm\:ss")}",
                        IdAsignacion = idAsignacionTecnico,
                        Data = signalRModel,
                        TiempoTotal = tiempoTotal.ToString(@"hh\:mm\:ss")
                    });
                }
            }
            catch (Exception ex)
            {
                // Log del error (si tienes un sistema de logging)
                //_logger?.LogError(ex, "Error en actualizarHoraAsignacion para IdAsignacionTecnico: {IdAsignacionTecnico}, Tipo: {Tipo}",
                //    idAsignacionTecnico, tipo);

                return StatusCode(500, new
                {
                    Success = false,
                    Message = $"Error interno: {ex.Message}"
                });
            }
        }
    }



    } 