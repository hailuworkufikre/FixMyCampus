// PATH: FixmyCampus.Application/DTOs/Tickets/UpdateTicketDto.cs  (replace whole file)
using FixmyCampus.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace FixmyCampus.Application.DTOs.Tickets;

public class UpdateTicketDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [EnumDataType(typeof(Building))]
    public Building Building { get; set; } = Building.MainLibrary;

    [Required]
    [MaxLength(50)]
    public string Room { get; set; } = string.Empty;

    [EnumDataType(typeof(TicketCategory))]
    public TicketCategory Category { get; set; }

    [EnumDataType(typeof(TicketPriority))]
    public TicketPriority Priority { get; set; }
}