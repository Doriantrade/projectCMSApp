using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/cotizacion")]
    [ApiController]
    public class CotizacionController : ControllerBase
    {

        private readonly cmsDb2024Context _context;

        public CotizacionController(cmsDb2024Context context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("ObtenerCotizacion/{idRequer}/{ccia}")]
        public async Task<IActionResult> ObtenerCotizacion([FromRoute] int idRequer, [FromRoute] string ccia)
        {

            string Sentencia = "exec ObtenerCotizacion @idTicket, @codcia";

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

        [Authorize]
        [HttpPost]
        [Route("GuardarAuditoriaCotizacionDeBaja")]
        public async Task<IActionResult> GuardarAuditoriaCotizacionDeBaja([FromBody] AuditoriaCotizaBaja model)
        {
            try
            {
                if (model == null)
                {
                    return BadRequest("Los datos de la auditoría no pueden ser nulos");
                }

                _context.AuditoriaCotizaBaja.Add(model);
                await _context.SaveChangesAsync();

                // Opción 1: Devolver el mismo modelo que se guardó (si tiene el ID actualizado)
                // return Ok(model);

                // Opción 2: Recuperar el registro recién guardado (como lo haces actualmente)
                var registroGuardado = await _context.AuditoriaCotizaBaja
                    .FirstOrDefaultAsync(x => x.Idrequer == model.Idrequer);

                if (registroGuardado == null)
                {
                    return StatusCode(500, "El registro se guardó pero no pudo ser recuperado");
                }

                return Ok(registroGuardado);

            }
            catch (Exception ex)
            {
                // Loggear el error (ex) aquí si tienes un sistema de logging
                return StatusCode(500, $"Error interno al guardar la auditoría: {ex.Message}");
            }
        }

        [Authorize]
        [HttpGet]
        [Route("ActualizarStockRepuestos/{codRep}/{cantidadAAgregar}")]
        public async Task<IActionResult> ActualizarStockRepuestos([FromRoute] string codRep, [FromRoute] int cantidadAAgregar)
        {
            try
            {
                // Validar parámetros de entrada
                if (string.IsNullOrEmpty(codRep))
                {
                    return BadRequest("El código de repuesto no puede estar vacío");
                }

                // Buscar el repuesto por su código
                var repuesto = await _context.Repuestos
                    .FirstOrDefaultAsync(r => r.Codrep == codRep);

                if (repuesto == null)
                {
                    return NotFound($"Repuesto con código {codRep} no encontrado");
                }

                // Obtengno el stock actual (si es null, considerar como 0)
                int stockActual = repuesto.CantRep ?? 0;

                // Calculo nuevo stock
                int nuevoStock = stockActual + cantidadAAgregar;

                // Validoo que el stock no sea negativo
                if (nuevoStock < 0)
                {
                    return BadRequest("No se puede establecer un stock negativo");
                }

                // Actualizar la cantidad de repuestos
                repuesto.CantRep = nuevoStock;

                // Guardar los cambios en la base de datos
                _context.Repuestos.Update(repuesto);
                await _context.SaveChangesAsync();

                // Retornar respuesta con información detallada
                return Ok(repuesto);
            }
            catch (Exception ex)
            {
                // Loggear el error (deberías implementar un sistema de logging)
                return StatusCode(500, $"Error interno al actualizar el stock: {ex.Message}");
            }
        }

    }
}
