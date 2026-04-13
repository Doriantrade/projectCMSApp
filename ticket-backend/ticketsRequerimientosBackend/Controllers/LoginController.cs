using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ticketsRequerimientosBackend.Authentication_Token;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.Controllers
{
    //[Authorize(Policy = "All")]
    [Route("api/Login")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        public IConfiguration _configuration;
        private readonly cmsDb2024Context _context;
        public LoginController(cmsDb2024Context context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        //[Authorize(Policy = "All")]
        [HttpPost]
        [Route("InicioSesion")]
        public IActionResult Login([FromBody] UserRequest userRequest)
        {
            Authenticator authenticator = new(_context);
            GenerateToken generateToken = new(_configuration);
            var user = authenticator.Authenticator_User(userRequest);
            if (user != null)
            {
                var token = generateToken.Generate(user);
                return Ok(new { token = token });
            }
            else
            {
                return NotFound("Usuario no registrado");
            }
        }

    }
}
