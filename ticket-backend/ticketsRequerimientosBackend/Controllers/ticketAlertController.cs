using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/TicketAlert")]
    [ApiController]
    public class ticketAlertController : ControllerBase
    {

        private readonly cmsDb2024Context _context;

        public ticketAlertController(cmsDb2024Context context)
        {
            _context = context;
        }


        [HttpPost]
        [Route("GuardarTicketAlert")]
        public async Task<IActionResult> GuardarTicketAlert([FromBody] TicketAlert model)
        {
            if (model == null)
            {
                return BadRequest("El resumen de mantenimiento es inexistente");
            }
            else
            {
                _context.TicketAlert.Add(model);
                await _context.SaveChangesAsync();
                var res = _context.TicketAlert.FirstOrDefault(x => x.Idrequer == model.Idrequer);
                return Ok(res);
            }
        }


        [HttpGet]
        [Route("ObtenerTicketsAlert/{state}")]
        public IActionResult ObtenerTicketsAlert([FromRoute] int state ) {

            var rescontext = _context.TicketAlert.Where(x => x.Estado == state);
            if (rescontext != null)
            {
                return Ok(rescontext);
            }
            else {
                return BadRequest("No hay datos");
            }

        }

        [HttpDelete]
        [Route("EliminarTicketsAlert/{idTIcketAlert}")]
        public IActionResult EliminarArchivoTicket([FromRoute] int id)
        {
            var delete = _context.TicketAlert
                          .Where(b => b.Id.Equals(id))
                          .ExecuteDelete();
            return (delete != 0) ? Ok() : BadRequest();
        }

    }
}

