using FixmyCampus.Domain.Enums;

namespace FixmyCampus.Application.DTOs.Tickets;

public class TicketResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Building Building { get; set; }
    public string Room { get; set; } = string.Empty;
    public TicketCategory Category { get; set; }
    public TicketPriority Priority { get; set; }
    public TicketStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }

    public int CreatedById { get; set; }
    public string? CreatedByName { get; set; }

    // This is the technician's User.Id
    public int? AssignedTechnicianId { get; set; }
    public string? AssignedTechnicianName { get; set; }

    // Filled only by GET /api/tickets/{id} (and after assign / status change)
    public List<TicketHistoryDto> History { get; set; } = new();
}

public class TicketHistoryDto
{
    public TicketStatus OldStatus { get; set; }
    public TicketStatus NewStatus { get; set; }
    public DateTime ChangedAt { get; set; }
    public string? ChangedByName { get; set; }
    public string? Comment { get; set; }
}