using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/Master")]
    [ApiController]
    public class MasterTableController : ControllerBase
    {

        private readonly cmsDb2024Context _context;
        public MasterTableController(cmsDb2024Context context)
        {
            _context = context;
        }

        //[Authorize]
        [HttpGet("ObtenerMasterTable/{master}")]
        public IActionResult ObtenerMaster([FromRoute] string master)
        {
            var Datos = from mt in _context.MasterTable
                        where mt.Master == master
                        select mt;

            return (Datos != null) ? Ok(Datos) : NotFound();

        }
    }
}
