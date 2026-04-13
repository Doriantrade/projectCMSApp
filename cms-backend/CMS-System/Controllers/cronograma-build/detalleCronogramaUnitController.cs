using cmsDb2024_System.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace CMS_System.Controllers.cronograma_build
{
    [Route("api/CronoDetalleUnit")]
    [ApiController]
    public class detalleCronogramaUnitController : ControllerBase
    {
        readonly private cmsDb2024Context _context;

        public detalleCronogramaUnitController(cmsDb2024Context context)
        {
            _context = context;
        }

        [HttpGet("DetalleUnitCrono/{tipo}/{crono}/{mes}/{dia}")]
        public async Task<IActionResult> DetalleUnitCrono([FromRoute] string tipo, [FromRoute] string crono, [FromRoute] int mes, [FromRoute] int dia)
        {

            string Sentencia = " exec detalleCronoUnit @ctipo, @ccrono, @mes, @dia ";

            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@ctipo", tipo));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@ccrono", crono));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@mes", mes));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@dia", dia));
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
