using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ticketsRequerimientosBackend.funcionality;
using ticketsRequerimientosBackend.LoggerControl;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.Controllers.config_systems
{
    [Route("api/confCMD")]
    [ApiController]
    public class configSystemCMLController : ControllerBase
    {

        private readonly cmsDb2024Context _context;
        public configSystemCMLController(cmsDb2024Context context)
        {
            _context = context;
        }


        //[Authorize]
        [HttpGet("obtenerConfiguracionSystems")]
        public async Task<IActionResult> obtenerConfiguracionesInterfazApp()
        {

            var configuraciones = await _context.ConfigSystem                
                .ToListAsync();

            if (!configuraciones.Any())
            {
                return Ok($"No se encontraron configuraciones para el sistema");
            }

            return Ok(configuraciones);
        }

        [HttpGet("obtenerCommandline")]
        public async Task<IActionResult> obtenerComandLine()
        {
            var cml = await _context.Commandline.ToListAsync();
            if (!cml.Any())
            {
                return Ok($"No se encontraron datos para CML");
            }


            return Ok(cml);

        }

        [HttpPut("actualizarConfigSystem/{id}")]
        public async Task<IActionResult> actualizarConfigSystem([FromRoute] int id, [FromBody] ConfigSystem model)
        {

            if (id != model.Id )
            {
                return BadRequest("No existe esta configuracion");
            }

            _context.Entry(model).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok(model);

        }

    }
}
