using cmsDb2024_System.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace CMS_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioPortalTicketController : ControllerBase
    {
        private readonly cmsDb2024Context _context;

        public UsuarioPortalTicketController(cmsDb2024Context context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsuarioPortalTickets()
        {
            var list = await _context.UsuarioPortalTicket.ToListAsync();
            return Ok(list);
        }
        
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetUsuarioPortalTicket(int id)
        {
            var model = await _context.UsuarioPortalTicket.FindAsync(id);
            if (model == null) return NotFound("UsuarioPortalTicket not found");
            return Ok(model);
        }

        [HttpGet("{coduser}")]
        public async Task<IActionResult> GetUsuarioPortalTicketByCoduser(string coduser)
        {
            var model = await _context.UsuarioPortalTicket.FirstOrDefaultAsync(u => u.Coduser == coduser);
            if (model == null) return NotFound("UsuarioPortalTicket not found");
            return Ok(model);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUsuarioPortalTicket([FromBody] UsuarioPortalTicket model)
        {
            if (model == null) return BadRequest("Model cannot be null");
            
            _context.UsuarioPortalTicket.Add(model);
            await _context.SaveChangesAsync();
            return Ok(model);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateUsuarioPortalTicket(int id, [FromBody] UsuarioPortalTicket model)
        {
            if (id != model.Id) return BadRequest("Id mismatch");

            _context.Entry(model).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UsuarioPortalTicketExists(id))
                    return NotFound();
                else
                    throw;
            }
            return Ok(model);
        }

        [HttpPut("{coduser}")]
        public async Task<IActionResult> UpdateUsuarioPortalTicketByCoduser(string coduser, [FromBody] UsuarioPortalTicket model)
        {
            var existing = await _context.UsuarioPortalTicket.FirstOrDefaultAsync(u => u.Coduser == coduser);
            if (existing == null) return NotFound("UsuarioPortalTicket not found");

            existing.Usuario = model.Usuario;
            existing.Password = model.Password;
            // Solo actualizamos estos 2 campos en el perfil, los demas se mantienen
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuarioPortalTicket(int id)
        {
            var model = await _context.UsuarioPortalTicket.FindAsync(id);
            if (model == null) return NotFound("UsuarioPortalTicket not found");

            _context.UsuarioPortalTicket.Remove(model);
            await _context.SaveChangesAsync();
            return Ok(new { message = "User deleted successfully" });
        }

        private bool UsuarioPortalTicketExists(int id)
        {
            return _context.UsuarioPortalTicket.Any(e => e.Id == id);
        }
    }
}
