using System.ComponentModel.DataAnnotations;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.ModelsDto
{
    public class ModelMultiDataFileMedia
    {
        [Required]
        public FileMediaTicket fileMediaData { get; set; }

        [Required]
        public TunelAlerFileDto cantFileData { get; set; }
    }
}
