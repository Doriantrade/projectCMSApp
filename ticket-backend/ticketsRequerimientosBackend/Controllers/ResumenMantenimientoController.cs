using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Data;
using ticketsRequerimientosBackend.funcionality;
using ticketsRequerimientosBackend.Models;
using ticketsRequerimientosBackend.ModelsDto;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/ResumenMantenimiento")]
    [ApiController]
    public class ResumenMantenimientoController : ControllerBase
    {

        private readonly cmsDb2024Context _context;
        private IntervalMinsDate _intervalMinDate;
        private readonly IHubContext<TicketResolucionHUB> _ticketResolucionHUB;
        public ResumenMantenimientoController(cmsDb2024Context context, IHubContext<TicketResolucionHUB> ticketResolucionHUB, IntervalMinsDate intervalMinDate)
        {
            _context = context;
            _ticketResolucionHUB = ticketResolucionHUB;
            _intervalMinDate = intervalMinDate;
        }

        //[Authorize]
        [HttpPost("GuardarResumenMantenimientos")]
        public async Task<IActionResult> GuardarResumenMantenimientos([FromBody] ResumenMantenimiento model)
        {
            //Console.WriteLine("[1] Inicio del método - Modelo recibido:");
            //Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(model, Newtonsoft.Json.Formatting.Indented));

            if (model == null)
            {
                //Console.WriteLine("[ERROR] Modelo es nulo");
                return BadRequest("El resumen de mantenimiento es inexistente");
            }

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {                    
                    // Validar que el TicketRequerimiento exista ANTES de guardar
                    var canConnect = await _context.Database.CanConnectAsync();
                    var ticket = await _context.TicketRequerimiento.FirstOrDefaultAsync(x => x.IdTicket == model.IdRequerimiento);

                    if (ticket == null)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest($"No existe un TicketRequerimiento con ID: {model.IdRequerimiento}");
                    }

                    _context.ResumenMantenimiento.Add(model);
                    await _context.SaveChangesAsync();

                    // Actualizar el estado del TicketRequerimiento
                    ticket.Estado = 3;

                    // Obtener todos los intervalos del ticket
                    var intervalos = await _context.IntervalosTicket
                        .Where(x => x.IdRequerimiento == model.IdRequerimiento)
                        .ToListAsync();

                    // Calcular tiempo total exacto en C#
                    string tiempoTotalFormateado = intervalos.CalcularTiempoTotalExacto(ticket.IdTicket);
                    Console.WriteLine($"Tiempo calculado: {tiempoTotalFormateado}");
                    // Crear el DTO para SignalR
                    var ticketDto = new TicketRequerimientoDto
                    {
                        IdTicket = ticket.IdTicket,
                        IdAgencia = ticket.IdAgencia,
                        Url = ticket.Url,
                        Estado = ticket.Estado,
                        Codprov = ticket.Codprov,
                        Ciudad = ticket.Ciudad,
                        Fecrea = ticket.Fecrea,
                        FechainiPlanif = ticket.FechainiPlanif,
                        FechafinPlanif = ticket.FechafinPlanif,
                        Area = ticket.Area,
                        MotivoTrabajo = ticket.MotivoTrabajo,
                        EspacioSirve = ticket.EspacioSirve,
                        DescripcionProblema = ticket.DescripcionProblema,
                        NserieEquipo = ticket.NserieEquipo,
                        Beneficiario = ticket.Beneficiario,
                        Telefono = ticket.Telefono,
                        Email = ticket.Email,
                        FecreaRealIni = ticket.FecreaRealIni,
                        FecreaRealFin = ticket.FecreaRealFin,
                        CodTipoEquipo = ticket.CodTipoEquipo,
                        CodMarca = ticket.CodMarca,
                        CodModelo = ticket.CodModelo,
                        Tipo = ticket.Tipo,
                        HoraInicialReal = ticket.HoraInicialReal,
                        HoraFinalReal = ticket.HoraFinalReal,
                        HoraInicialPlanificada = ticket.HoraInicialPlanificada,
                        HoraFinalPlanificada = ticket.HoraFinalPlanificada,
                        Usercrea = ticket.Usercrea,
                        Valor = ticket.Valor,
                        Observacion = ticket.Observacion,
                        Ccia = ticket.Ccia,
                        CodUserAtencionTicket = ticket.CodUserAtencionTicket,
                        TiempoTotalExactoMinutos = tiempoTotalFormateado
                    };

                    await _ticketResolucionHUB.Clients.All.SendAsync("SendTicketRequerimiento", ticketDto);
                    await _context.SaveChangesAsync();

                    // Guardar IntervalosTicket
                    var intervalo = new IntervalosTicket
                    {
                        Mintime = _intervalMinDate.CalcularMinutosDiferencia(ticket.FecreaRealIni, ticket.FecreaRealFin),
                        Fecrea = DateTime.Now,
                        Usercrea = ticket.CodUserAtencionTicket,
                        Tipo = 1,
                        IdRequerimiento = ticket.IdTicket,
                        EstadoTicket = ticket.Estado,
                        Observacion = "En proceso de mantenimiento."
                    };

                    _context.IntervalosTicket.Add(intervalo);
                    await _context.SaveChangesAsync();


                    // Confirmar la transacción (solo si todo sale bien)
                    await transaction.CommitAsync();
                    return Ok(model);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine($"[ERROR] Transacción revertida. Detalles: {ex}");
                    return StatusCode(500, $"Error interno: {ex.Message}");
                }
            }
        }

        [HttpGet("ObtenerDetalleMantenimientoIntervalos/{idTicketReq}")]
        public IActionResult ObtenerDetalleMantenimientoIntervalos([FromRoute] int idTicketReq)
        {

            string sentenciaTickets = "exec DetalleMantenimientoIntervalos @idTicketRequer";
            DataTable dtTickets = new DataTable();

            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {
                using (SqlCommand cmd = new SqlCommand(sentenciaTickets, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@idTicketRequer", idTicketReq));
                    adapter.Fill(dtTickets);
                }
            }

            if (dtTickets == null)
            {
                return NotFound("No hay datos...");
            }

            return Ok(dtTickets);

        }
 
        [Authorize]
        [HttpGet("ObtenerResumenMantenimiento/{idRequerimiento}")]
        public IActionResult ObtenerResumenMantenimiento([FromRoute] int idRequerimiento)
        {
            var res = (from rm in _context.ResumenMantenimiento
                       join mt in _context.MasterTable
                       on rm.CodResuMante equals mt.Codigo
                       where mt.Master == "RM"
                       join mt2 in _context.MasterTable
                       on rm.EstadoEquip equals mt2.Codigo
                       where mt2.Master == "EF"
                       select new
                       {
                           rm.Id,
                           rm.Estado,
                           rm.IdRequerimiento,
                           rm.Fecrea,
                           rm.CodResuMante,
                           rm.SolucionImplementada,
                           rm.Usercrea,
                           rm.EstadoEquip,
                           rm.Valor,
                           rm.Observacion,
                           motivoVisita = mt.Nombre,
                           EstadoNombre = mt2.Nombre,
                            
                       }).Where( x => x.IdRequerimiento == idRequerimiento && x.Estado == 1 )
                       .ToList();

            if (res != null)
            {
                return Ok(res);
            }
            else
            {
                return BadRequest("No encontrado");
            }
        }

        [HttpPut]
        [Route("editarResumenMantenimiento/{id}")]
        public async Task<IActionResult> editarResumenMantenimiento([FromRoute] int id, [FromBody] ResumenMantenimiento model)
        {

            if (id != model.Id)
            {
                return BadRequest("No existe la data");
            }

            _context.Entry(model).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok(model);

        }

    }
}
