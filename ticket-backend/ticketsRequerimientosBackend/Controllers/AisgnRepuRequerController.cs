using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Security.Claims;
using ticketsRequerimientosBackend.auditoria_services;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/AsignRepuRequer")]
    [ApiController]
    public class AisgnRepuRequerController : ControllerBase
    {

        private readonly cmsDb2024Context _context;
        private readonly AuditoriaService _auditoriaService;
        private readonly OperacionesAuditoriaService _operacionesAuditoria;
        public AisgnRepuRequerController(cmsDb2024Context context, 
                                         AuditoriaService auditoriaService,
                                         OperacionesAuditoriaService operacionesAuditoria)
        {
            _context = context;
            _auditoriaService = auditoriaService;
            _operacionesAuditoria = operacionesAuditoria;
        }

        [Authorize]
        [HttpPost]
        [Route("guardarAsignRepuRequer")]
        public async Task<IActionResult> guardarAsignRepuRequer([FromBody] List<AsignRepuRequer> models)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Modelo no válido.");
            }

            try
            {

                await _context.AsignRepuRequer.AddRangeAsync(models);

                if (await _context.SaveChangesAsync() > 0)
                {
                    return Ok(models);
                }
                else
                {
                    return BadRequest("Error al guardar en la base de datos.");
                }
            }
            catch (Exception ex)
            {
                // Log the exception here
                return StatusCode(500, "Ocurrió un error interno al procesar la solicitud.");
            }
        }

        [Authorize]
        [HttpDelete("EliminarRepuestosAsignados/{idRepu}")]
        public async Task<IActionResult> EliminarRepuestosAsignados([FromRoute] string idRepu)
        {
            var repAsignado = await _context.AsignRepuRequer
                .FirstOrDefaultAsync(x => x.Codrep.Equals(idRepu));

            if (repAsignado == null)
            {
                return NotFound("Repuesto asignado no encontrado");
            }

            await _operacionesAuditoria.RegistrarEliminacion(
                repAsignado,
                repAsignado.Id.ToString(),
                User,
                "ELIMINAR_REPUESTO_ASIGNADO_POR_CODREP",
                0
            );

            var filasEliminadas = await _context.AsignRepuRequer
                .Where(b => b.Codrep.Equals(idRepu))
                .ExecuteDeleteAsync();

            return filasEliminadas > 0
                ? Ok()
                : StatusCode(500, "No se pudo eliminar el repuesto");
        
        }

        [Authorize]
        [HttpDelete("EliminarAsignacionRepuTicket/{idRequer}")]
        public async Task<IActionResult> EliminarAsignacionRepuTicket([FromRoute] int idRequer)
        {
            // 1. Obtener los repuestos asignados (solo lectura)
            var repuestosAsignados = await _context.AsignRepuRequer
                .AsNoTracking()
                .Where(x => x.IdRequer == idRequer)
                .ToListAsync();

            if (repuestosAsignados == null || !repuestosAsignados.Any())
            {
                return NotFound(new
                {
                    success = false,
                    message = $"No se encontraron repuestos asignados para el ticket {idRequer}"
                });
            }

            // 2. Obtener datos del usuario una sola vez
            var (codusuario, nombreUsuario, correoUsuario) = await _operacionesAuditoria.ObtenerDatosUsuario(User);
            // 3. Registrar auditoría para cada repuesto
            foreach (var repuesto in repuestosAsignados)
            {
                await _operacionesAuditoria.RegistrarEliminacion(
                    repuesto, // Pasar el item individual, no la lista completa
                    repuesto.Id.ToString(),
                    User,
                    "ELIMINAR_REPUESTO_ASIGNADO",
                    0
                );
            }

            // 4. Eliminación masiva eficiente
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var filasEliminadas = await _context.AsignRepuRequer
                    .Where(x => x.IdRequer == idRequer)
                    .ExecuteDeleteAsync();

                await transaction.CommitAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                //_logger.LogError(ex, "Error al eliminar repuestos asignados para ticket {TicketId}", idRequer);

                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    success = false,
                    message = "Error al eliminar repuestos asignados",
                    error = ex.Message
                });
            }
        }


        //[Authorize]
        [HttpGet("obtenerRepuestosRequerimientos/{idRequer}")]
        public async Task<IActionResult> obtenerRepuestosRequerimientos([FromRoute] int idRequer)
        {
            string Sentencia = " exec ObtenerRepuestosRequerimientos @idR ";
            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString)) {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@idR", idRequer));
                    adapter.Fill(dt);
                }
            }
            if (dt == null)
            {
                return NotFound("No se ha podido crear...");
            }
            return Ok(dt);
        }
        
        [Authorize]
        [HttpGet("actualizarEquipoContadorInicial/{idEquipo}/{contador}")]
        public async Task<IActionResult> actualizarEquipoContadorInicial([FromRoute] string idEquipo, [FromRoute] int contador)
        {
            string Sentencia = "exec ActualizarContadorEquipo @idEq, @cont";
            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString)) {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@idEq", idEquipo));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@cont", contador));
                    adapter.Fill(dt);
                }
            }

            if (dt == null)
            {
                return NotFound("No se ha podido crear...");
            }

            return Ok(dt);

        }


        [Authorize]
        [HttpGet("obtenerLocalidadAgencia/{idAg}")]
        public async Task<IActionResult> obtenerLocalidadAgencia([FromRoute] string idAg)
        {
            string Sentencia = "exec ObtenerLocalidadesAgencia @idAgencia";
            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString)) {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@idAgencia", idAg));
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
