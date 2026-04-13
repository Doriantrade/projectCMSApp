using System.ComponentModel.DataAnnotations;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.ModelsDto
{
    public class ModelAsignacionHubDto
    {
        [Required]
        public AsignacionTecnicoTicket Asignacion { get; set; }

        [Required]
        public TecnicosDto Tecnico { get; set; }
    }

}
