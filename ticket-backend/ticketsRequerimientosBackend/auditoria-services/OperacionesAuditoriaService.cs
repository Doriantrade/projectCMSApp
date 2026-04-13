using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.auditoria_services
{
    public class OperacionesAuditoriaService
    {
        private readonly cmsDb2024Context _context;
        private readonly AuditoriaService _auditoriaService;

        public OperacionesAuditoriaService(
            cmsDb2024Context context,
            AuditoriaService auditoriaService)
        {
            _context = context;
            _auditoriaService = auditoriaService;
        }

        public async Task<(string codusuario, string nombre, string correo)> ObtenerDatosUsuario(ClaimsPrincipal user)
        {
            var codusuario = user.FindFirst(ClaimTypes.Country)?.Value ?? "Sistema";

            var datosUsuario = await _context.UsuarioPortalTicket
                .Where(x => x.Coduser == codusuario)
                .Select(x => new { x.Nombre, x.Correo })
                .FirstOrDefaultAsync();

            return (
                codusuario,
                datosUsuario?.Nombre ?? "Usuario desconocido",
                datosUsuario?.Correo ?? "Correo no disponible"
            );
        }

        public async Task RegistrarEliminacion<T>(
            T entidad,
            string idEntidad,
            ClaimsPrincipal user,
            string accion,
            int codmodulo = 0) where T : class
        {
            var (codusuario, nombre, correo) = await ObtenerDatosUsuario(user);

            await _auditoriaService.RegistrarAuditoria(
                accion: accion,
                codmodulo: codmodulo,
                codusuario: codusuario,
                entidad: entidad,
                idEntidad: idEntidad,
                systemObserv: $"Eliminación por: {nombre} ({correo})"
            );
        }
    }

}
