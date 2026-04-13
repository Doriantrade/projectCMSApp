using cmsDb2024_System.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CMS_System.Controllers.fileController
{
    [Route("api/AnyFiles")]
    [ApiController]
    public class AnyFilesController : ControllerBase
    {

        private readonly cmsDb2024Context _context;
        private readonly IWebHostEnvironment _environment;

        public AnyFilesController (cmsDb2024Context context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpGet("fysicfile/{nombreArchivo}")]
        public IActionResult DescargarArchivo(string nombreArchivo)
        {
            string file = nombreArchivo + ".pdf";
            string rutaArchivo = Path.Combine(_environment.ContentRootPath, "fileModel/Assets/" + nombreArchivo, file);

            if (System.IO.File.Exists(rutaArchivo))
            {
                var archivoBytes = System.IO.File.ReadAllBytes(rutaArchivo);
                return File(archivoBytes, "application/octet-stream", file);
            }

            return NotFound("Ruta: " + rutaArchivo);
        }

    }
}
