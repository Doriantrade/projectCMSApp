using cmsDb2024_System.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace CMS_System.Controllers
{
    [Route("api/Garantias")]
    [ApiController]
    public class GarantiasController : ControllerBase
    {

          private readonly cmsDb2024Context _context;

        public GarantiasController(cmsDb2024Context context)
        {
            _context = context;
        }


        [HttpPost]
        [Route("GuardarGarantias")]
        public async Task<IActionResult> GuardarGarantias([FromBody] Garantias model)
        {

            if (ModelState.IsValid)
            {
                _context.Garantias.Add(model);
                if (await _context.SaveChangesAsync() > 0)
                {
                    return Ok(model);
                }
                else
                {
                    return BadRequest("Datos incorrectos");
                }
            }
            else
            {
                return BadRequest("ERROR");
            }
        }

        [HttpPut]
        [Route("EditarGarantia/{codgarantia}")]
        public async Task<IActionResult> EditarGarantia([FromRoute] string codgarantia, [FromBody] Garantias model)
        {

            if ( codgarantia != model.Codgarantia )
            {
                return BadRequest("No existe la garantia");
            }

            _context.Entry(model).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok(model);

        }

        [HttpGet("obtenerGarantias/{codcia}")]
        public async Task<IActionResult> obtenerGarantias([FromRoute] string codcia)
        {

            string Sentencia = " select mt1.nombre as nombrefrecuencia, mt2.nombre as nombretipomant, gar.* from garantias as gar " +
                               " left join MasterTable as mt1 on mt1.codigo = gar.codfrec and mt1.master = 'TF'                   " +
                               " left join MasterTable as mt2 on mt2.codigo = gar.codtipomant and mt2.master = 'TM' " +
                               " where gar.ccia = @ccia";

            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@ccia", codcia));
                    adapter.Fill(dt);
                }
            }

            if (dt == null)
            {
                return NotFound("No se ha podido crear...");
            }

            return Ok(dt);

        }

    }


}
