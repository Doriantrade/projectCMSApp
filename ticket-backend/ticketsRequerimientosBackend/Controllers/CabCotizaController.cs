using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ticketsRequerimientosBackend.auditoria_services;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/CabCotiza")]
    [ApiController]
    public class CabCotizaController : ControllerBase
    {

        private readonly cmsDb2024Context _context;
        public CabCotizaController(cmsDb2024Context context)
        {
            _context = context;
        }

        [Authorize]
        [HttpPost]
        [Route("guardarCabCotiza")]
        public async Task<IActionResult> guardarCabCotiza([FromBody] CabCotiza models)
        {
            if (!ModelState.IsValid) {
                return BadRequest("Modelo no válido.");
            }
            try {
                await _context.CabCotiza.AddAsync(models);
                if (await _context.SaveChangesAsync() > 0)
                {
                    return Ok(models);
                }
                else
                {
                    return BadRequest("Error al guardar en la base de datos.");
                }
            }
            catch (Exception ex) {
                return StatusCode(500, "Ocurrió un error interno al procesar la solicitud.");
            }
        }

        [HttpGet]
        [Route("actualizarCotizacion/{idRepoTec}/{codUserAprueba}/{estado}")]
        public async Task<IActionResult> ActualizarCotizacion(
            [FromRoute] int idRepoTec,
            [FromRoute] string codUserAprueba,
            [FromRoute] int estado) {
            try
            {
                var cotizacion = await _context.CabCotiza
                                    .FirstOrDefaultAsync(c => c.IdRepoTec == idRepoTec);

                if (cotizacion == null)
                {
                    return NotFound($"No se encontró la cotización con idRepoTec: {idRepoTec}");
                }

                // Usar los parámetros recibidos
                cotizacion.CodUserAprueba = codUserAprueba;
                cotizacion.Estado = estado;

                _context.Entry(cotizacion).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return Ok(cotizacion);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al actualizar: {ex.Message}");
            }
        }

        [HttpGet]
        [Route("obtenerCabCotizaUnit/{id}")]
        public async Task<IActionResult> ObtenerCabCotizaUnit([FromRoute] int id) {
            var cotizacion = await _context.CabCotiza.FirstOrDefaultAsync(c => c.IdRepoTec == id);
            if (cotizacion == null) NotFound($"No se encontró la cotización con ID {id}");
            return Ok(cotizacion);
        }

        [HttpGet]
        [Route("obtenerCabCotizaGen")]
        public async Task<IActionResult> obtenerCabCotizaGen()
        {
            try
            {
                var cotizacion = await _context.CabCotiza.ToListAsync();

                if (cotizacion == null || !cotizacion.Any())
                {
                    return NotFound("No se encontraron registros de cabecera de cotización");
                }

                return Ok(cotizacion);
            }

            catch (Exception ex) { return StatusCode(500, "Ocurrió un error interno al procesar la solicitud"); }
            
        }


        [HttpDelete]
        [Route("eliminarCotizacion/{idRequer}/{idResMant}")]
        public async Task<IActionResult> EliminarCotizacion([FromRoute] int idRequer, [FromRoute] int idResMant)
        {
            try
            {
                // 1. Buscar la cotización por su IdRepoTec (que es igual a idRequer en la ruta)
                var cotizacion = await _context.CabCotiza.FirstOrDefaultAsync(x => x.IdRepoTec == idRequer && x.IdResManten == idResMant );

                if (cotizacion == null)
                {
                    return NotFound($"No se encontró la cotización con ID {idRequer}.");
                }

                // --- 2. VALIDACIÓN DE ESTADO ---
                if (cotizacion.Estado == 0)
                {
                    // Caso: El registro ya está dado de baja (Estado = 0). NO SE HACE NADA, solo se notifica.
                    return Conflict($"La cotización con ID {idRequer} ya se encuentra dada de baja (Estado = 0).");
                }

                // --- Si el estado es 1 (ACTIVO), procedemos con las eliminaciones ---

                // 3. ELIMINACIÓN FÍSICA de ResumenMantenimiento
                if (cotizacion.IdResManten.HasValue) // Verificamos si tiene un resumen asociado
                {
                    var resMantenimiento = await _context.ResumenMantenimiento.FirstOrDefaultAsync(x => x.Id == cotizacion.IdResManten);
                    if (resMantenimiento != null)
                    {
                        _context.ResumenMantenimiento.Remove(resMantenimiento);
                    }
                }

                // 4. ELIMINACIÓN FÍSICA de TODOS los registros de AsignRepuRequer relacionados con este requerimiento
                // Se buscan todos los items de repuesto asociados a IdRequer y se eliminan.
                var asignacionesRepuestos = await _context.AsignRepuRequer
                                                        .Where(x => x.IdRequer == idRequer)
                                                        .ToListAsync();

                if (asignacionesRepuestos.Any())
                {
                    _context.AsignRepuRequer.RemoveRange(asignacionesRepuestos);
                }

                // 5. ELIMINACIÓN LÓGICA de CabCotiza (al final)
                cotizacion.Estado = 0;
                _context.CabCotiza.Update(cotizacion);

                // 6. Guardar todos los cambios (eliminaciones físicas y cambio de estado lógico)
                await _context.SaveChangesAsync();

                return Ok($"Cotización con ID {idRequer} dada de baja (Estado = 0). Items de repuesto y resumen de mantenimiento eliminados.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al procesar la eliminación: {ex.Message}");
            }
        }



    }
}
