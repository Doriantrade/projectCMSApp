using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Reflection.Emit;
using System.Security.Claims;
using System.Text.Json;
using ticketsRequerimientosBackend.funcionality;
using ticketsRequerimientosBackend.LoggerControl;
using ticketsRequerimientosBackend.Models;
using ticketsRequerimientosBackend.ModelsDto;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/TicketRequerimientos")]
    [ApiController]
    public class TicketRequerimientosController : ControllerBase
    {
        private readonly cmsDb2024Context _context;
        private readonly IHubContext<TicketResolucionHUB> _ticketResolucionHUB;
        private readonly IHubContext<TicketSendAlert> _ticketSendAlert;
        private readonly LogControlWebApiRest _logControl;
        private readonly AuditoriaService _auditoriaService;
        private IntervalMinsDate _intervalMinDate;

        public TicketRequerimientosController(cmsDb2024Context context, 
                                              IHubContext<TicketResolucionHUB> ticketResolucionHUB,
                                              IHubContext<TicketSendAlert> ticketSendAlert,
                                              LogControlWebApiRest logControl,
                                              IntervalMinsDate intervalMinDate,
                                              AuditoriaService auditoriaService) {
            _context             = context;
            _ticketResolucionHUB = ticketResolucionHUB;
            _ticketSendAlert     = ticketSendAlert;
            _logControl          = logControl;
            _auditoriaService    = auditoriaService;
            _intervalMinDate = intervalMinDate;
        }

        [Authorize]
        [HttpGet("ObtenerTicketsRequerimientos/{codcli}/{codcia}/{type}")]
        public async Task<IActionResult> ObtenerTicketsRequerimientos([FromRoute] string codcli, [FromRoute] string codcia, [FromRoute] string type)
        {
            // Obtener tickets mediante el procedimiento almacenado
            string sentenciaTickets = "exec ObtenerTicketsRequerimientos @ccli, @ccia, @tp";
            DataTable dtTickets = new DataTable();

            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {
                // Obtener tickets
                using (SqlCommand cmd = new SqlCommand(sentenciaTickets, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@ccli", codcli));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@ccia", codcia));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@tp", type));
                    adapter.Fill(dtTickets);
                }
            }

            if (dtTickets.Rows.Count == 0)
            {
                _logControl.LogAction(codcli, "ObtenerTicketsRequerimientos", false);
                return NotFound("No se ha encontrado ningún dato.");
            }

            // Obtener todos los IDs de tickets
            var ticketIds = dtTickets.AsEnumerable()
                .Select(r => Convert.ToInt32(r["idTicket"]))
                .ToList();

            // Obtener todos los técnicos asignados con sus datos de usuarixo e imagen
            var tecnicosPorTicket = await _context.AsignacionTecnicoTicket
                .Where(x => ticketIds.Contains(x.IdRequerimiento ?? 0))
                .Join(_context.Usuario,
                    asignacion => asignacion.CodTenicUser,
                    usuario => usuario.Coduser,
                    (asignacion, usuario) => new {
                        Asignacion = asignacion,
                        NombreUsuario = usuario.Nombre,
                        ApellidoUsuario = usuario.Apellido,
                        CedulaUsuario = usuario.Cedula,
                        EmailUsuario = usuario.Email
                    })
                .GroupJoin(_context.ImgFile,
                    x => "IMG-" + x.Asignacion.CodTenicUser,
                    img => img.Codentidad,
                    (x, imagenes) => new
                    {
                        Data = x,
                        Imagen = imagenes.FirstOrDefault() // Tomamos la primera imagen si existe
                    })
                .GroupBy(x => x.Data.Asignacion.IdRequerimiento)
                .ToDictionaryAsync(
                    g => g.Key.ToString(),
                    g => g.Select(x => {
                        // Crear un objeto dinámico combinando las propiedades
                        var tecnico = new Dictionary<string, object>();
                        // Agregar todas las propiedades originales del técnico
                        tecnico["idAsignacionTecnico"] = x.Data.Asignacion.IdAsignacionTecnico;
                        tecnico["idRequerimiento"] = x.Data.Asignacion.IdRequerimiento;
                        tecnico["resTecnico"] = x.Data.Asignacion.ResTecnico;
                        tecnico["urlA"] = x.Data.Asignacion.UrlA;
                        tecnico["urlB"] = x.Data.Asignacion.UrlB;
                        tecnico["codTenicUser"] = x.Data.Asignacion.CodTenicUser;
                        tecnico["fechacrea"] = x.Data.Asignacion.Fechacrea;
                        tecnico["fechares"] = x.Data.Asignacion.Fechares;
                        tecnico["reasignacion"] = x.Data.Asignacion.Reasignacion;
                        // Agregar las propiedades del usuario
                        tecnico["nombreTecnico"] = x.Data.NombreUsuario;
                        tecnico["apellidoTecnico"] = x.Data.ApellidoUsuario;
                        tecnico["cedulaTecnico"] = x.Data.CedulaUsuario;
                        tecnico["emailTecnico"] = x.Data.EmailUsuario;
                        // Agregar la imagen del técnico si existe
                        tecnico["imagenTecnico"] = x.Imagen?.Imagen ?? string.Empty;
                        return tecnico;
                    }).ToList()
                );

            // Combinar tickets con sus técnicos
            var resultado = new List<Dictionary<string, object>>();
            foreach (DataRow row in dtTickets.Rows)
            {
                var ticketId = row["idTicket"].ToString();
                var rowDict = new Dictionary<string, object>();

                // Agregar todos los campos del ticket
                foreach (DataColumn col in dtTickets.Columns)
                {
                    rowDict[col.ColumnName] = row[col];
                }

                // Agregar los técnicos asignados (si existen)
                rowDict["tecnicos"] = tecnicosPorTicket.TryGetValue(ticketId, out var tecnicos)
                    ? tecnicos
                    : new List<Dictionary<string, object>>();

                resultado.Add(rowDict);
            }

            _logControl.LogAction(codcli, "ObtenerTicketsRequerimientos", true);
            return Ok(resultado);
        }

        [Authorize]
        [HttpPost]
        [Route("GuardarTicketsRequerimiento")]
        public async Task<IActionResult> GuardarTicketsRequerimiento([FromBody] TicketRequerimiento model)
        {
            if (model != null)
            {
                // Guarda el modelo
                _context.TicketRequerimiento.Add(model);
                await _context.SaveChangesAsync();
                _logControl.LogAction(model.Usercrea, "GuardarTicketsRequerimiento", true);
                // Realiza la consulta para obtener los datos necesarios
                var res = (from tr in _context.TicketRequerimiento
                           join ag in _context.Agencia on tr.IdAgencia equals ag.Codagencia into agGroup
                           from ag in agGroup.DefaultIfEmpty()
                           join cli in _context.Cliente on ag.Codcliente equals cli.Codcliente into cliGroup
                           from cli in cliGroup.DefaultIfEmpty()
                           join mt1 in _context.MasterTable on new { Key1 = tr.Tipo, Key2 = "TM" } equals new { Key1 = mt1.Codigo, Key2 = mt1.Master } into mt1Group
                           from mt1 in mt1Group.DefaultIfEmpty()
                           where tr.IdTicket == model.IdTicket
                           select new TicketModelDto
                           {
                               Id = tr.IdTicket,
                               Estado = tr.Estado,
                               Tipo = mt1.Nombre,
                               nombreAgencia = ag.Nombre,
                               nombreCliente = cli.Nombre,
                               codcli = ag.Codcliente
                           }).FirstOrDefault();

                if (res == null) return NotFound("No se encontró el ticket requerido.");
                if (res.Tipo == "Mantenimiento Preventivo")      res.Tipo = "MP";
                else if (res.Tipo == "Mantenimiento Correctivo") res.Tipo = "MC";
                else if (res.Tipo == "Mantenimiento Especial")   res.Tipo = "ME";

                var ticketModelDto = new TicketModelDto {
                    Id = res.Id,
                    IdTicket = res.Id,
                    Estado = res.Estado,
                    Tipo = res.Tipo,
                    nombreAgencia = res.nombreAgencia,
                    nombreCliente = res.nombreCliente,
                    codcli = res.codcli,
                    TiempoTotalExactoMinutos = "0s"
                };

                // Envía la información al hub
                await _ticketResolucionHUB.Clients.All.SendAsync("SendTicketRequerimiento", ticketModelDto);

                // Guardar IntervalosTicket
                var intervalo = new IntervalosTicket
                {
                    Mintime = 0,
                    Fecrea = DateTime.Now,
                    Usercrea = res.codcli,
                    Tipo = 1,
                    IdRequerimiento = res.Id,
                    EstadoTicket = res.Estado,
                    Observacion = "Ticket se ha generado"
                };

                _context.IntervalosTicket.Add(intervalo);
                await _context.SaveChangesAsync();
                return Ok(res);
            }
            else 
            {
                _logControl.LogAction(model?.Usercrea, "GuardarTicketsRequerimiento", false);
                return BadRequest("Debes enviar datos correctos");
            }

        }


        [HttpDelete("EliminarRequerimiento/{id}")]
        public IActionResult EliminarRequerimiento([FromRoute] int id)
        {
            var data = _context.TicketRequerimiento
                          .Where(b => b.IdTicket.Equals(id));



            if (data != null)
            {
                data.ExecuteDelete();
                return Ok(data);
            }
            else
            {
                return BadRequest("No existen datos");
            }
        }

        [Authorize]
        [HttpPut("ActualizarFechaRealTicket/{idTicket}/{estado}")]
        public async Task<IActionResult> ActualizarFechaRealTicket([FromRoute] int idTicket,
                                                                   [FromRoute] int estado,
                                                                   [FromBody] TicketRequerimiento model)
        {
            var ticket = await _context.TicketRequerimiento.FirstOrDefaultAsync(x => x.IdTicket == idTicket);
            if (ticket == null)
            {
                return BadRequest("Ticket inexistente");
            }

            // Actualizar campos del ticket
            ticket.FecreaRealIni = model.FecreaRealIni;
            ticket.FecreaRealFin = DateTime.UtcNow.AddHours(-5);
            ticket.HoraInicialReal = model.HoraInicialReal;
            ticket.HoraFinalReal = model.HoraFinalReal;
            ticket.Observacion = model.Observacion;
            ticket.Estado = estado;
            ticket.CodUserAtencionTicket = model.CodUserAtencionTicket;

            // Obtener todos los intervalos del ticket
            var intervalos = await _context.IntervalosTicket
                .Where(x => x.IdRequerimiento == idTicket)
                .ToListAsync();

            // Calcular tiempo total exacto en C#
            string tiempoTotalFormateado = intervalos.CalcularTiempoTotalExacto(idTicket);

            // Validar si la cadena es null, vacía o solo espacios
            if (string.IsNullOrWhiteSpace(tiempoTotalFormateado))
            {
                tiempoTotalFormateado = "0seg";
            }

            Console.WriteLine($"Tiempo calculado: {tiempoTotalFormateado}");
            // Crear el DTO para SignalR
            var ticketDto = new TicketRequerimientoDto
            {
                IdTicket                        = ticket.IdTicket,
                IdAgencia                       = ticket.IdAgencia,
                Url                             = ticket.Url,
                Estado                          = ticket.Estado,
                Codprov                         = ticket.Codprov,
                Ciudad                          = ticket.Ciudad,
                Fecrea                          = ticket.Fecrea,
                FechainiPlanif                  = ticket.FechainiPlanif,
                FechafinPlanif                  = ticket.FechafinPlanif,
                Area                            = ticket.Area,
                MotivoTrabajo                   = ticket.MotivoTrabajo,
                EspacioSirve                    = ticket.EspacioSirve,
                DescripcionProblema             = ticket.DescripcionProblema,
                NserieEquipo                    = ticket.NserieEquipo,
                Beneficiario                    = ticket.Beneficiario,
                Telefono                        = ticket.Telefono,
                Email                           = ticket.Email,
                FecreaRealIni                   = ticket.FecreaRealIni,
                FecreaRealFin                   = DateTime.UtcNow.AddHours(-5),
                CodTipoEquipo                   = ticket.CodTipoEquipo,
                CodMarca                        = ticket.CodMarca,
                CodModelo                       = ticket.CodModelo,
                Tipo                            = ticket.Tipo,
                HoraInicialReal                 = ticket.HoraInicialReal,
                HoraFinalReal                   = ticket.HoraFinalReal,
                HoraInicialPlanificada          = ticket.HoraInicialPlanificada,
                HoraFinalPlanificada            = ticket.HoraFinalPlanificada,
                Usercrea                        = ticket.Usercrea,
                Valor                           = ticket.Valor,
                Observacion                     = ticket.Observacion,
                Ccia                            = ticket.Ccia,
                CodUserAtencionTicket           = ticket.CodUserAtencionTicket,
                TiempoTotalExactoMinutos        = tiempoTotalFormateado
            };


            Console.WriteLine(JsonSerializer.Serialize(ticketDto, new JsonSerializerOptions { WriteIndented = true }));

            // Si necesitas asignarlo a alguna propiedad (agrega [NotMapped] al modelo si es necesario)
            // ticket.TiempoTotalFormateado = tiempoTotalFormateado;

            await _context.SaveChangesAsync();
            await _ticketResolucionHUB.Clients.All.SendAsync("SendTicketRequerimiento", ticketDto);

            var observ = estado switch
            {
                2 => "Requerimiento asignado.",
                3 => "En proceso.",
                4 => "Ticket cerrado.",
                _ => string.Empty
            };

            var intervalo = new IntervalosTicket
            {
                Mintime = 0,
                Fecrea = DateTime.Now,
                Usercrea = model.CodUserAtencionTicket,
                Tipo = 1,
                IdRequerimiento = idTicket,
                EstadoTicket = estado,
                Observacion = observ
            };

            _context.IntervalosTicket.Add(intervalo);
            await _context.SaveChangesAsync();

            return Ok(ticket);
        }


    }

}
