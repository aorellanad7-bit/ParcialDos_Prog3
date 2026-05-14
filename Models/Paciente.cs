using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Models;

[Table("pacientes_juanpablo3936")] 
public class Paciente
{
    [Key] // <-- MUÉVELO AQUÍ
    public string Id { get; set; } = string.Empty; 

    public string? Nombre { get; set; } // El nombre ya no es la llave
    public int Gravedad { get; set; } // 1-5
    public string Estado { get; set; } = "En espera";
    public string MedicoResponsable { get; set; } = string.Empty;
    public DateTime? FechaIngreso { get; set; }
}