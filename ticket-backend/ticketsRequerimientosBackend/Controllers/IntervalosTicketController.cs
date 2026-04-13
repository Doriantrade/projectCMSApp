using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/intervalosTicket")]
    [ApiController]
    public class IntervalosTicketController : ControllerBase
    {

        private readonly cmsDb2024Context _context;
        public IntervalosTicketController(cmsDb2024Context context)
        {
            _context = context;
        }

        [HttpPost]
        [Route("GuardarIntervalosTicket")]
        public async Task<IActionResult> GuardarIntervalosTicket([FromBody] IntervalosTicket model)
        {
            if (ModelState.IsValid)
            {
                _context.IntervalosTicket.Add(model);
                return (await _context.SaveChangesAsync() > 0) ? Ok() : BadRequest("No se guardo");
            }
            else
            {
                return BadRequest();
            }
        }

    }
}
