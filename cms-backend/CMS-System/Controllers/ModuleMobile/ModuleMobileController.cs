using cmsDb2024_System.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS_System.Controllers.ModuleMobile
{
    [Route("api/ModuleMobil")]
    [ApiController]
    public class ModuleMobileController : ControllerBase
    {

        private readonly cmsDb2024Context _context;

        public ModuleMobileController(cmsDb2024Context context)
        {
            _context = context;
        }

        [HttpGet("ObtenerModuleMobile/{codcia}")]
        public async Task<IActionResult> ObtenerModuleMobile([FromRoute] string codcia)
        {

            Console.WriteLine("CONSULTANDO!");
            Console.WriteLine(codcia);

            var res = await _context.ModuleMobile
                                  .Where(x => x.Ccia == codcia)
                                  .ToListAsync();

            if (!res.Any())
            {
                return BadRequest("No hay datos");
            }

            return Ok(res);
        }
    }
}