using System.ComponentModel.DataAnnotations;

namespace ticketsRequerimientosBackend.Models
{
    public class UserRequest
    {
        [Required]
        public string? Usuario { get; set; }
        [Required]
        public string? Password { get; set; }
    }
}
