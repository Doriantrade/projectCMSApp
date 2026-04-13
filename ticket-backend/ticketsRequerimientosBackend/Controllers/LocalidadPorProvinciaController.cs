using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using ticketsRequerimientosBackend.auditoria_services;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/LocalidadPorProvincia")]
    [ApiController]
    public class LocalidadPorProvinciaController : ControllerBase
    {

        private readonly cmsDb2024Context _context;

        public LocalidadPorProvinciaController(cmsDb2024Context context)
        {
            _context = context;
        }


        //[Authorize]
        [HttpGet("ObtenerLocalidadPorProvincia/{cprov}")]
        public async Task<IActionResult> obtenerRepuestosRequerimientos([FromRoute] int cprov)
        {
            string Sentencia = " exec ObtenerLocalidadPorProvincia @codprov ";
            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@codprov", cprov));
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
