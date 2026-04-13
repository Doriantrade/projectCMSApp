using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/configuracionesInterfazApp")]
    [ApiController]
    public class configuracionesInterfazAppController : ControllerBase
    {

        private readonly cmsDb2024Context _context;

        public configuracionesInterfazAppController(cmsDb2024Context context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("obtenerConfiguracionesInterfazApp/{idMaster}")]
        public async Task<IActionResult> obtenerConfiguracionesInterfazApp([FromRoute] string idMaster)
        {
            if (string.IsNullOrEmpty(idMaster))
            {
                return BadRequest("El idMaster no puede estar vacío");
            }

            var configuraciones = await _context.ConfiguracionesInterfazApp
                .Where(x => x.IdMaster == idMaster)
                .ToListAsync();

            if (!configuraciones.Any())
            {
                return NotFound($"No se encontraron configuraciones para el idMaster: {idMaster}");
            }

            return Ok(configuraciones);
        }



    }
}
