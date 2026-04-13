using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/NotaEntregaRepuesos")]
    [ApiController]
    public class NotaEntregaController : ControllerBase
    {

        private readonly cmsDb2024Context _context;

        public NotaEntregaController(cmsDb2024Context context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("ObtenerNotaEntregaRepuesos/{idRequer}/{ccia}")]
        public async Task<IActionResult> ObtenerNotaEntregaRepuesos([FromRoute] int idRequer, [FromRoute] string ccia)
        {

            string Sentencia = "exec ObtenerNotaEntrega @idTicket, @codcia";

            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {

                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@idTicket", idRequer));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@codcia", ccia));
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
