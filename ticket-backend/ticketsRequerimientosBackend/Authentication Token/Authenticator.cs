using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.Authentication_Token
{
    public class Authenticator
    {
        private cmsDb2024Context _context;
        public Authenticator(cmsDb2024Context context)
        {
            _context = context;
        }

        public UsuarioPortalTicket? Authenticator_User(UserRequest userRequest)
        {
            var usuario = _context.UsuarioPortalTicket.Where(x => x.Usuario == userRequest.Usuario && x.Password == userRequest.Password).FirstOrDefault();

            // observacion validar por actividad
            // var usuario = _context.UsuarioPortalTicket.Where(x => x.Usuario == userRequest.Usuario && x.Password == userRequest.Password && x.Active == "A").FirstOrDefault();
            
            if (usuario != null)
            {
                return usuario;
            }
            else
            {
                return null;
            }

        }
    }
}