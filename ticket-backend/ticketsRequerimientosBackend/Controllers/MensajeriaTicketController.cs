using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using ticketsRequerimientosBackend.Models;
using static System.Net.WebRequestMethods;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/MensajeriaTicket")]
    [ApiController]
    public class MensajeriaTicketController : ControllerBase
    {
        private readonly cmsDb2024Context _context;
        private readonly IHubContext<MesnajeHub> _mensajeHub;
        public MensajeriaTicketController(cmsDb2024Context context, IHubContext<MesnajeHub> mensajeHub)
        {
            _context = context;
            _mensajeHub = mensajeHub;
        }

        [HttpGet("ObtenerMensajesTicket/{idRequerimiento}/{top}")]
        public IActionResult ObtenerMensajeTicket([FromRoute] int idRequerimiento, [FromRoute] int top)
        {
            
            var Datos = (from mjt in _context.MensajeriaTicket
                         orderby mjt.Fechaemit ascending
                         join uspt in _context.UsuarioPortalTicket on mjt.Coduser equals uspt.IdCliente
                         join req in _context.Ticketresolucion on mjt.IdRequerimiento equals req.IdRequerimiento
                         where mjt.IdRequerimiento.Equals(idRequerimiento) && mjt.Active.Equals("A")
                         select new { req.Tipo, uspt.Usuario, Nombres = (uspt.Nombre + " " + uspt.Apellido), uspt.Correo, mjt.IdRequerimiento, mjt.Fechaemit, mjt.Mensaje, mjt.Coduser, mjt.Idmensaje, mjt.Active, mjt.Estado, mjt.UrlImagen }).ToList().Take(top);
            
            return (Datos != null) ? Ok(Datos) : NotFound();

        }


        [HttpPost]
        [Route("GuardarMensajesTicket")]
        public async Task<IActionResult> GuardarMensajesTickets([FromBody] MensajeriaTicket model)
        {
            if (ModelState.IsValid)
            {
                _context.MensajeriaTicket.Add(model);
                await _context.SaveChangesAsync();

                var respuesta = (from mt in _context.MensajeriaTicket
                                 join usp in _context.UsuarioPortalTicket on mt.Coduser equals usp.Coduser into uspJoin
                                 from usp in uspJoin.DefaultIfEmpty()
                                 join tr in _context.Ticketresolucion on mt.IdRequerimiento equals tr.IdRequerimiento into trjoin
                                 from tr in trjoin.DefaultIfEmpty()
                                 join cli in _context.Cliente on mt.Coduser equals cli.Codcliente into cliJoin
                                 from cli in cliJoin.DefaultIfEmpty()
                                 where mt.Coduser == model.Coduser && mt.IdRequerimiento == model.IdRequerimiento && mt.Mensaje == model.Mensaje
                                 select new
                                 {
                                     mt.IdRequerimiento,
                                     mt.Fechaemit,
                                     mt.Mensaje,
                                     mt.Idmensaje,
                                     mt.Coduser,
                                     mt.Active,
                                     mt.Estado,
                                     mt.UrlImagen,
                                     tr.Tipo,
                                     usuarioNombre = usp.Nombre + " " + usp.Apellido,
                                     usp.Usuario,
                                     cliente = cli.Nombre ?? "NO"
                                 })
                                 .FirstOrDefault();

                await _mensajeHub.Clients.All.SendAsync("SendMessageHub", model, respuesta);
                return Ok();
            }
            else
            {
                return BadRequest();
            }
        }

        [HttpGet("ActualizarEstadoMensajes/{idRequer}/{coduser}")]
        public async Task<IActionResult> ActualizarEstadoMensajes([FromRoute] int idRequer, [FromRoute] string coduser)
        {
            var mensajes = _context.MensajeriaTicket
                                   .Where(m => m.IdRequerimiento == idRequer && m.Coduser != coduser)
                                   .ToList();

            if (mensajes == null || !mensajes.Any())
            {
                return NotFound("No se ha podido crear...");
            }

            foreach (var mensaje in mensajes)
            {
                mensaje.Estado = "L";
            }

            await _context.SaveChangesAsync();

            return Ok(mensajes);
        }



        [HttpDelete("BorrarMensajeTicket/{idMensaje}")]
        public async Task<IActionResult> BorrarTicket([FromRoute] int idMensaje) 
        {
            var ticket = _context.MensajeriaTicket.FirstOrDefault(c => c.Idmensaje == idMensaje);
            if (ticket != null)
            {
                ticket.Active = "F";
                return (await _context.SaveChangesAsync() > 0) ? Ok() : BadRequest();
            }
            return NotFound();
        }

    }
}
