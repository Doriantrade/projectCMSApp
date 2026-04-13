using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Data;
using ticketsRequerimientosBackend.Models;
using ticketsRequerimientosBackend.ModelsDto;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/TicketResolucion")]
    [ApiController]
    public class TicketResolucionController : ControllerBase
    {

        private readonly cmsDb2024Context _context;
        private readonly IHubContext<TicketResolucionHUB> _ticketResolucionHUB;
        private readonly IHubContext<TicketSendAlert> _ticketSendAlert;
        private readonly IHubContext<EliminacionTecnicoHub> _eliminacionTecnicoHub;
        public TicketResolucionController(cmsDb2024Context context,
                                   IHubContext<TicketResolucionHUB> ticketResolucionHUB,
                                   IHubContext<TicketSendAlert> ticketSendAlert,
                                   IHubContext<EliminacionTecnicoHub> eliminacionTecnicoHub)
        {
            _context = context;
            _ticketResolucionHUB = ticketResolucionHUB;
            _ticketSendAlert = ticketSendAlert;
            _eliminacionTecnicoHub = eliminacionTecnicoHub; // Asignamos el hub
        }

        [HttpDelete]
        [Route("EliminarTecnicosProcess/{idTicket}/{coduserTecnic}")]
        public async Task<IActionResult> EliminarTecnicosProcess([FromRoute] int idTicket,
                                                                 [FromRoute] string coduserTecnic)
        {
            try
            {
                var cronogramaEntry = await _context.Cronograma
                    .FirstOrDefaultAsync(c => c.Codusertecnic == coduserTecnic && c.IdRequer == idTicket);
                var mantemaqcroEntry = await _context.Mantemaqcro
                    .FirstOrDefaultAsync(m => m.Codtecnico == coduserTecnic && m.IdRequer == idTicket);
                var asignacionEntry = await _context.AsignacionTecnicoTicket
                    .FirstOrDefaultAsync(a => a.CodTenicUser == coduserTecnic && a.IdRequerimiento == idTicket);

                if (cronogramaEntry != null)
                {
                    _context.Cronograma.Remove(cronogramaEntry);
                }
                if (mantemaqcroEntry != null)
                {
                    _context.Mantemaqcro.Remove(mantemaqcroEntry);
                }
                if (asignacionEntry != null)
                {
                    _context.AsignacionTecnicoTicket.Remove(asignacionEntry);
                }

                await _context.SaveChangesAsync();

                // Aquí es donde aplicamos SignalR para enviar el técnico que se está eliminando
                var tecnico = new tecnicoDto
                {
                    IdTecnico = coduserTecnic,
                    IdTIcket = idTicket
                };

                // Enviamos la notificación a todos los clientes conectados al hub de eliminación de técnicos
                await _eliminacionTecnicoHub.Clients.All.SendAsync("EliminacionTecnicoSignal", tecnico);
                return Ok();

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    

        [HttpPost]
        [Route("GuardarTickets")]
        public async Task<IActionResult> GuardarTickets([FromBody] Ticketresolucion model)
        {
            string ruta = "http://192.168.55.242:5130/icon-cliente/";
            if (ModelState.IsValid)
            {
                _context.Ticketresolucion.Add(model);
                await _context.SaveChangesAsync();
                var respuesta = (from tr in _context.Ticketresolucion
                                 join ag in _context.Agencia on tr.Idagencia equals ag.Codagencia into agJoin
                                 from ag in agJoin.DefaultIfEmpty()
                                 join cli in _context.Cliente on ag.Codcliente equals cli.Codcliente into cliJoin
                                 from cli in cliJoin.DefaultIfEmpty()
                                 join imgCli in _context.ImgFile on cli.Codcliente equals imgCli.Codentidad into imgCliJoin
                                 from imgCli in imgCliJoin.DefaultIfEmpty()
                                 where tr.Fechacrea == model.Fechacrea
                                 select new
                                 {
                                     tr.Fechacrea,
                                     ag.Nombre,
                                     ag.Codcliente,
                                     imagen = ruta + imgCli.Imagen,
                                     tr.Obervacion,
                                     tr.MensajeDelProblema,
                                     tr.Tipo,
                                     tr.Estado,
                                     tr.CodMaquina,
                                     tr.IdRequerimiento

                                 }).FirstOrDefault();
                await _ticketSendAlert.Clients.All.SendAsync("SendTicketRequerimientoAlertHub", respuesta);
                return Ok();
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpGet("ObtenerTicket/{codCliente}")]
        public IActionResult ObtenerTicket([FromRoute] string codCliente)
        {
            var Datos = from tr in _context.Ticketresolucion
                        join ag in _context.Agencia on tr.Idagencia equals ag.Codagencia into agJoin
                        from ag in agJoin.DefaultIfEmpty()
                        join cli in _context.Cliente on ag.Codcliente equals cli.Codcliente into cliJoin
                        from cli in cliJoin.DefaultIfEmpty()
                        join mtk in _context.MensajeriaTicket on tr.IdRequerimiento equals mtk.IdRequerimiento into mtkJoin
                        from mtk in mtkJoin.DefaultIfEmpty()
                        where cli.Codcliente == codCliente 
                        group new { tr, ag, cli, mtk } by new
                        {
                            tr.IdRequerimiento,
                            tr.Idagencia,
                            tr.UrlA,
                            tr.UrlB,
                            tr.Estado,
                            tr.MensajeDelProblema,
                            tr.Obervacion,
                            tr.CodMaquina,
                            tr.Fechacrea,
                            tr.Tipo,
                            ag.CampoB,
                            cli.Ruc,
                            ag.Nombre,
                            cli.Telfpago,
                            cli.NombreMantenimiento,
                            cli.Telfclimanteni,
                            NombreAgencia = ag.Nombre,
                            cli.Codcliente
                        } into g
                        select new
                        {
                            g.Key.IdRequerimiento,
                            g.Key.Idagencia,
                            g.Key.UrlA,
                            g.Key.UrlB,
                            g.Key.Estado,
                            g.Key.MensajeDelProblema,
                            g.Key.Obervacion,
                            g.Key.CodMaquina,
                            g.Key.Fechacrea,
                            g.Key.Tipo,
                            g.Key.CampoB,
                            g.Key.Ruc,
                            g.Key.Nombre,
                            g.Key.Telfpago,
                            g.Key.NombreMantenimiento,
                            g.Key.Telfclimanteni,
                            NombreAgencia = g.Key.Nombre,
                            g.Key.Codcliente,
                            CantidadMensajes = g.Count( m => m.mtk.Idmensaje != null && m.mtk.Active == "A" )
                        };

            return (Datos != null) ? Ok(Datos) : NotFound();
        
        }



        [HttpPut]
        [Route("ActualizarTicket/{id}")]
        public async Task<IActionResult> ActualizarTicket([FromRoute] int id, [FromBody] Ticketresolucion model)
        {
            if (id != model.IdRequerimiento)
            {
                return BadRequest(); 
            }
            _context.Entry(model).State = EntityState.Modified;
            return (await _context.SaveChangesAsync() > 0) ? Ok() : BadRequest();
        }



[HttpGet]
[Route("ActualizarTicketEstado/{id}/{estado}")]
public async Task<IActionResult> ActualizarTicketEstado([FromRoute] int id, [FromRoute] int estado)
{
    var ticket = _context.TicketRequerimiento.FirstOrDefault(c => c.IdTicket == id);
    
    if (ticket == null)
    {
        return NotFound("Ticket no encontrado");
    }

    // Actualizar el estado del ticket
    ticket.Estado = estado;
    
    try
    {
        
        _context.TicketRequerimiento.Update(ticket);
        
        await _context.SaveChangesAsync();
        return Ok();
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Error al actualizar el ticket: {ex.Message}");
    }
}


        [HttpGet]
        [Route("obtenerMensajesNoLeidosTickets/{CodCliente}")]
        public async Task<IActionResult> ObtenerMensajesNoLeidosTickets([FromRoute] string CodCliente)
        {
            var result = await (from tkr in _context.Ticketresolucion
                                join mtk in _context.MensajeriaTicket on tkr.IdRequerimiento equals mtk.IdRequerimiento into mtkGroup
                                from mtk in mtkGroup.DefaultIfEmpty()
                                join ag in _context.Agencia on tkr.Idagencia equals ag.Codagencia
                                join cli in _context.Cliente on ag.Codcliente equals cli.Codcliente
                                where cli.Codcliente == CodCliente
                                group mtk by new { tkr.Tipo, tkr.Estado, tkr.IdRequerimiento, tkr.MensajeDelProblema, tkr.Obervacion, tkr.Idagencia, cli.Codcliente } into g
                                select new
                                {
                                    g.Key.Tipo,
                                    g.Key.Estado,
                                    g.Key.IdRequerimiento,
                                    g.Key.MensajeDelProblema,
                                    g.Key.Idagencia,
                                 g.Key.Codcliente,
                                    g.Key.Obervacion,
                                    Cantidad = g.Count(m => m.Estado == "NL"),
                                    CodRequerimiento = "#" + g.Key.Tipo + "-" + g.Key.IdRequerimiento.ToString().PadLeft(9, '0')
                                }).ToListAsync();

            if (result != null && result.Any())
            {
                return Ok(result);
            }
            return NotFound();
        }

        [HttpGet("reporteTenicoCorrectivo/{idRequer}")]
        public async Task<IActionResult> reporteTenicoCorrectivo([FromRoute] int idRequer)
        {

            string Sentencia = "exec ReporteTecnicoCorrectivo @idR";

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

            if (dt == null)
            {
                return NotFound("No se ha podido crear...");
            }

            return Ok(dt);

        }

        [HttpDelete("BorrarTicket/{id}")]
        public IActionResult BorrarTicket([FromRoute] int id)
        {
            var data = _context.Ticketresolucion
                          .Where(b => b.IdRequerimiento.Equals(id));
            


            if ( data != null )
            {
                    data.ExecuteDelete();
                    return Ok(data);
            }
            else
            {
                return BadRequest("No existen datos");
            }
        }
    }
}
