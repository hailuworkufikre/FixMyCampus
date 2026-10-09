// PATH: FixmyCampus.Application/DTOs/Tickets/UpdateTicketStatusDto.cs  (NEW file)
using System.ComponentModel.DataAnnotations;
using FixmyCampus.Domain.Enums;

namespace FixmyCampus.Application.DTOs.Tickets;

public class UpdateTicketStatusDto
{
    [Required]
    [EnumDataType(typeof(TicketStatus))]
    public TicketStatus Status { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }
}