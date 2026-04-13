
using cmsDb2024_System.Models;
using Microsoft.AspNetCore.Mvc;

namespace CMS_System.Controllers
{
    [Route("api/Asesor")]
    [ApiController]
    public class AsesorClienteController : Controller
    {

        readonly cmsDb2024Context _context;

        public AsesorClienteController ( cmsDb2024Context context )
        {
            _context = context;
        }

        [HttpPost]
        [Route("guardarAsignacionAsesor")]
        public async Task<IActionResult> guardarAsignacionAsesor([FromBody] Asesorcliente model)
        {

            if (ModelState.IsValid)
            {
                _context.Asesorcliente.Add(model);
                if (await _context.SaveChangesAsync() > 0) {
                    return Ok(model);
                }

                else {
                    return BadRequest("Datos incorrectos");
                }
            }
            else
            {
                return BadRequest("ERROR");
            }
        }

    }
}
