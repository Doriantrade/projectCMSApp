using cmsDb2024_System.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace CMS_System.Controllers
{
    [Route("api/AsignacionUsuarioBodega")]
    [ApiController]
    public class AsignacionUsuarioBodegaController : ControllerBase
    {


        private readonly cmsDb2024Context _context;

        public AsignacionUsuarioBodegaController(cmsDb2024Context context)
        {
            _context = context;
        }

        [HttpPost]
        [Route("GuardarAsignacionUsuarioBodega")]
        public async Task<IActionResult> GuardarAsignacionUsuarioBodega([FromBody] AsignacionUsuarioBodega model)
        {
            if (ModelState.IsValid)
            {
                _context.AsignacionUsuarioBodega.Add(model);
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
        [Route("EditarAsignacionUsuarioBodega/{id}")]
        public async Task<IActionResult> EditarAsignacionUsuarioBodega([FromRoute] int id, [FromBody] AsignacionUsuarioBodega model)
        {
            
            if (id != model.Id)
            {
                return BadRequest("No existe la asignacion");
            }

            _context.Entry(model).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok(model);

        }


        [HttpGet("ObtenerAsignacionUsuarioBodega/{ccia}")]
        public async Task<IActionResult> ObtenerAsignacionUsuarioBodega([FromRoute] string ccia)
        {

            string Sentencia = " exec ObtenerAsignacionUsuarioBodega @ccia ";

            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@ccia", ccia));
                    adapter.Fill(dt);
                }
            }

            if (dt == null)
            {
                return NotFound("No se ha podido crear...");
            }

            return Ok(dt);

        }


        [HttpDelete]
        [Route("EliminarAsignacionUsuarioBodega/{id}")]
        public async Task<IActionResult> EliminarAsignacionUsuarioBodega([FromRoute] int id)
        {
            var asignacion = await _context.AsignacionUsuarioBodega.FindAsync(id);

            if (asignacion == null)
            {
                return NotFound("No se encontró la asignación de usuario y bodega.");
            }

            // Suponiendo que tienes una columna 'Estado' en tu modelo AsignacionUsuarioBodega
            asignacion.Estado = 0;
            _context.Entry(asignacion).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return Ok("Se ha eliminado lógicamente la asignación.");
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "Error al actualizar la base de datos.");
            }
        }


    }
}
