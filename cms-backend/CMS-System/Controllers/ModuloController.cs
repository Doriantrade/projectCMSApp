using cmsDb2024_System.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Drawing;
using Microsoft.AspNetCore.SignalR;
using CMS_System.Hubs;

namespace CMS_System.Controllers
{
    [Route("api/modulos")]
    [ApiController]
    public class ModuloController : ControllerBase
    {

        private readonly cmsDb2024Context _context;
        private readonly IHubContext<PermissionsHub> _hubContext;

        public ModuloController(cmsDb2024Context context, IHubContext<PermissionsHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet("GetAllModulos")]
        public async Task<IActionResult> GetAllModulos()
        {
            var res = await _context.Modulo.ToListAsync();
            return Ok(res);
        }

        [HttpPost("AsignarModulo/{coduser}/{idmod}/{codcia}")]
        public async Task<IActionResult> AsignarModulo([FromRoute] string coduser, [FromRoute] string idmod, [FromRoute] string codcia)
        {
            var exists = await _context.AsignModUser.AnyAsync(a => a.CodUser == coduser && a.CodMod == idmod);
            if(exists) return BadRequest("El usuario ya tiene este módulo asignado.");

            var nuevaAsignacion = new AsignModUser
            {
                CodUser = coduser,
                CodMod = idmod,
                State = 1,
                CodCia = codcia,
                Permisos = 1, // Por defecto L., C., A., E.
                OrderMod = 0
            };
            
            _context.AsignModUser.Add(nuevaAsignacion);
            await _context.SaveChangesAsync();
            
            var user = await _context.Usuario.FirstOrDefaultAsync(u => u.Coduser == coduser);
            string fullName = user != null ? $"{user.Nombre} {user.Apellido}" : coduser;
            await _hubContext.Clients.All.SendAsync("ForceUpdatePermissions", coduser, fullName);
            
            return Ok(nuevaAsignacion);
        }

        [HttpGet("GetModulos/{userCod}")]
        public async Task<IActionResult> GetModulos([FromRoute] string userCod)
        {
            var res = (from asmod in _context.AsignModUser
                       join mod in _context.Modulo on asmod.CodMod equals mod.Id.ToString() into ModJoin
                       from mod in ModJoin.DefaultIfEmpty()
                       where asmod.CodUser == userCod
                       select new
                       {
                           permisos = asmod.Permisos,
                           cod_user = asmod.CodUser,
                           id = mod.Id,
                           moduleName = mod.ModuleName,
                           moduleDescription = mod.ModuleDescription,
                           icon = mod.Icon,
                           color = mod.Color,
                           tipo = mod.Tipo
                       }).ToList();

            if (res != null && res.Count > 0)
            {
                return Ok(res);
            }
            else
            {
                return BadRequest("Usuario inexistente");
            }
        }


        [HttpGet("EditarPermisosModulos/{permmod}/{codmod}/{userCod}")]
        public async Task<IActionResult> EditarPermisosModulos([FromRoute] string permmod, [FromRoute] string codmod, [FromRoute] string userCod)
        {

            string Sentencia = " exec UpdateEstadoModulo @permiso, @idmod, @coduser ";

            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@permiso", permmod));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@idmod", codmod));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@coduser", userCod));
                    adapter.Fill(dt);
                }
            }

            if (dt == null)
            {
                return NotFound("No se encontro este WebUser...");
            }

            var user = await _context.Usuario.FirstOrDefaultAsync(u => u.Coduser == userCod);
            string fullName = user != null ? $"{user.Nombre} {user.Apellido}" : userCod;
            await _hubContext.Clients.All.SendAsync("ForceUpdatePermissions", userCod, fullName);

            return Ok(dt);

        }

    }
}
