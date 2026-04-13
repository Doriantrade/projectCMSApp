using cmsDb2024_System.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CMS_System.Controllers
{
    [Route("api/login")]
    [ApiController]
    public class loginController : ControllerBase
    {

        private readonly cmsDb2024Context _context;

        public loginController(cmsDb2024Context context)
        {
            _context = context;
        }

        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login([FromBody] Usuario userInfo)
        {
            var result = await _context.Usuario.FirstOrDefaultAsync(x => x.Email == userInfo.Email && x.Contrasenia == userInfo.Contrasenia);
            if (result != null)
            {
                return Ok(result);
            }
            else
            {
                return BadRequest("Datos incorrectos");
            }
        }

    }
}
