using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.Authentication_Token
{
    public class GenerateToken
    {
        public IConfiguration _configuration;
        public GenerateToken(IConfiguration configuration)
        {
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        }
        public string Generate(UsuarioPortalTicket usuariosPortalTicket)
        {
            var jwt = _configuration.GetSection("Jwt").Get<JWTModel>() ?? throw new InvalidOperationException("Jwt configuration is missing or invalid.");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key));
            var singIn = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new[] {
                new Claim(JwtRegisteredClaimNames.Sub, jwt.Subject),
                new Claim(ClaimTypes.NameIdentifier, usuariosPortalTicket.Id.ToString()),
                new Claim(ClaimTypes.Name, usuariosPortalTicket.Usuario),
                new Claim(ClaimTypes.Name, usuariosPortalTicket.Ccia),
                new Claim(ClaimTypes.Role, usuariosPortalTicket.Rol),
                new Claim(ClaimTypes.Country, usuariosPortalTicket.IdCliente),
                new Claim(ClaimTypes.AuthorizationDecision, usuariosPortalTicket.Active),
            };

            var token = new JwtSecurityToken(
                jwt.Issuer,
                jwt.Audience,
                claims,
                expires: DateTime.Now.AddHours(8),
                signingCredentials: singIn);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
