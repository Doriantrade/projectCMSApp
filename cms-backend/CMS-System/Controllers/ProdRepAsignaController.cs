using cmsDb2024_System.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CMS_System.Controllers
{
    [Route("api/Repbodasigna")]
    [ApiController]
    public class ProdRepAsignaController : ControllerBase
    {

        private readonly cmsDb2024Context _context;

        public ProdRepAsignaController(cmsDb2024Context context)
        {
            _context = context;
        }

        [HttpPost("GuardarRepbodasigna")]
        public async Task<IActionResult> GuardarRepbodasigna([FromBody] Repbodasigna model)
        {

            var res = validateDboExist(model);
            if (res != null)
            {

                return BadRequest("Datos duplicados");

            }

            if (!ModelState.IsValid)
            {

                return BadRequest("Modelo de datos inválido");

            }

            _context.Repbodasigna.Add(model);
            if (await _context.SaveChangesAsync() > 0)
            {

                var dboModelSave = validateDboExist(model);
                return Ok(dboModelSave);

            }

            return BadRequest("No se pudo guardar la información");

        }

        private Repbodasigna validateDboExist(Repbodasigna model) => _context.Repbodasigna.FirstOrDefault(x => x.Codrepbodega == model.Codrepbodega && x.Codbodega == model.Codbodega);



    }
}
