using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/IntervalosTicketMsj")]
    [ApiController]
    public class IntervalosTicketMsjController : ControllerBase
    {

        private readonly cmsDb2024Context _context;
        public IntervalosTicketMsjController(cmsDb2024Context context)
        {
            _context = context;
        }

        [HttpPost]
        [Route("GuardarIntervalosTicketMsj")]
        public async Task<IActionResult> GuardarIntervalosTicketMsj([FromBody] IntervalosTicketMsj model)
        {
            if (ModelState.IsValid)
            {
                _context.IntervalosTicketMsj.Add(model);
                return (await _context.SaveChangesAsync() > 0) ? Ok() : BadRequest("No se guardo");
            }
            else
            {
                return BadRequest();
            }
        }


    }
}
