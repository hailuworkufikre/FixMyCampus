// PATH: FixmyCampus.Application/Services/TicketService.cs  (replace whole file)
using FixmyCampus.Application.DTOs.Tickets;
using FixmyCampus.Application.Interfaces;
using FixmyCampus.Domain.Entities;
using FixmyCampus.Domain.Enums;

namespace FixmyCampus.Application.Services;

public class TicketService : ITicketService
{
    private readonly ITicketRepository _ticketRepository;

    public TicketService(ITicketRepository ticketRepository)
    {
        _ticketRepository = ticketRepository;
    }

    public async Task<TicketResponseDto> CreateAsync(CreateTicketDto dto, int userId)
    {
        var ticket = new Ticket
        {
            Title = dto.Title,
            Description = dto.Description,
            Building = dto.Building,
            Room = dto.Room,
            Category = dto.Category,
            Priority = dto.Priority,
            Status = TicketStatus.New,
            CreatedById = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _ticketRepository.AddAsync(ticket);
        await _ticketRepository.SaveChangesAsync();

        var saved = await _ticketRepository.GetByIdAsync(ticket.Id)
            ?? throw new InvalidOperationException("Ticket could not be created.");

        return MapToDto(saved);
    }

    public async Task<IEnumerable<TicketResponseDto>> GetAllAsync()
    {
        var tickets = await _ticketRepository.GetAllAsync();
        return tickets.Select(MapToDto);
    }

    public async Task<IEnumerable<TicketResponseDto>> GetFilteredAsync(
        Building? building,
        TicketStatus? status)
    {
        var tickets = await _ticketRepository.GetFilteredAsync(building, status);
        return tickets.Select(MapToDto);
    }

    public async Task<TicketResponseDto?> GetByIdAsync(int id)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);
        return ticket == null ? null : MapToDto(ticket);
    }

    public async Task<IEnumerable<TicketResponseDto>> GetMyTicketsAsync(int userId)
    {
        var tickets = await _ticketRepository.GetByUserIdAsync(userId);
        return tickets.Select(MapToDto);
    }

    public async Task<TicketResponseDto?> UpdateAsync(int id, UpdateTicketDto dto, int userId)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);

        if (ticket == null || ticket.CreatedById != userId)
            return null;

        ticket.Title = dto.Title;
        ticket.Description = dto.Description;
        ticket.Building = dto.Building;
        ticket.Room = dto.Room;
        ticket.Category = dto.Category;
        ticket.Priority = dto.Priority;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _ticketRepository.UpdateAsync(ticket);
        await _ticketRepository.SaveChangesAsync();

        return MapToDto(ticket);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var ticket = await _ticketRepository.GetByIdAsync(id);

        if (ticket == null || ticket.CreatedById != userId)
            return false;

        await _ticketRepository.DeleteAsync(ticket);
        await _ticketRepository.SaveChangesAsync();

        return true;
    }

    // HARD RULE (1/2): assigning is the ONLY way a ticket goes New -> Assigned.
    public async Task<TicketResponseDto?> AssignAsync(
        int ticketId,
        AssignTicketDto dto,
        int changedById)
    {
        var ticket = await _ticketRepository.GetByIdAsync(ticketId);

        if (ticket == null)
            return null;

        if (ticket.Status != TicketStatus.New)
            throw new InvalidOperationException(
                $"Only a New ticket can be assigned. This ticket is {ticket.Status}.");

        var technician = await _ticketRepository.GetTechnicianByIdAsync(dto.TechnicianId)
            ?? throw new InvalidOperationException("Technician not found.");

        if (!technician.IsAvailable)
            throw new InvalidOperationException("Technician is not available.");

        var oldStatus = ticket.Status;

        ticket.AssignedTechnicianId = technician.Id;
        ticket.AssignedTechnician = technician;
        ticket.Status = TicketStatus.Assigned;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _ticketRepository.AddHistoryAsync(new TicketHistory
        {
            TicketId = ticket.Id,
            OldStatus = oldStatus,
            NewStatus = TicketStatus.Assigned,
            ChangedById = changedById,
            Comment = $"Assigned to {technician.FullName}",
            ChangedAt = DateTime.UtcNow
        });

        await _ticketRepository.UpdateAsync(ticket);
        await _ticketRepository.SaveChangesAsync();

        // reload so the response contains the new history row
        var saved = await _ticketRepository.GetByIdAsync(ticketId);
        return MapToDto(saved!);
    }

    // HARD RULE (2/2): status only moves forward, one step, no skipping.
    //   Assigned -> InProgress -> Resolved
    public async Task<TicketResponseDto?> UpdateStatusAsync(
        int ticketId,
        TicketStatus status,
        int changedById,
        string? comment)
    {
        var ticket = await _ticketRepository.GetByIdAsync(ticketId);

        if (ticket == null)
            return null;

        var oldStatus = ticket.Status;

        if (!Enum.IsDefined(typeof(TicketStatus), status))
            throw new InvalidOperationException("Unknown status value.");

        if (oldStatus == TicketStatus.New)
            throw new InvalidOperationException(
                "A New ticket must be assigned to a technician first.");

        if (!IsValidForwardStep(oldStatus, status))
            throw new InvalidOperationException(
                $"Invalid status change: {oldStatus} -> {status}. " +
                "Status can only move forward one step at a time.");

        ticket.Status = status;
        ticket.UpdatedAt = DateTime.UtcNow;

        if (status == TicketStatus.Resolved)
            ticket.ResolvedAt = DateTime.UtcNow;

        await _ticketRepository.AddHistoryAsync(new TicketHistory
        {
            TicketId = ticket.Id,
            OldStatus = oldStatus,
            NewStatus = status,
            ChangedById = changedById,
            Comment = comment,
            ChangedAt = DateTime.UtcNow
        });

        await _ticketRepository.UpdateAsync(ticket);
        await _ticketRepository.SaveChangesAsync();

        var saved = await _ticketRepository.GetByIdAsync(ticketId);
        return MapToDto(saved!);
    }

    private static bool IsValidForwardStep(TicketStatus from, TicketStatus to)
    {
        return (from == TicketStatus.Assigned && to == TicketStatus.InProgress)
            || (from == TicketStatus.InProgress && to == TicketStatus.Resolved);
    }

    private static TicketResponseDto MapToDto(Ticket ticket)
    {
        return new TicketResponseDto
        {
            Id = ticket.Id,
            Title = ticket.Title,
            Description = ticket.Description,
            Building = ticket.Building,
            Room = ticket.Room,
            Category = ticket.Category,
            Priority = ticket.Priority,
            Status = ticket.Status,
            CreatedAt = ticket.CreatedAt,
            UpdatedAt = ticket.UpdatedAt,
            ResolvedAt = ticket.ResolvedAt,
            CreatedById = ticket.CreatedById,
            CreatedByName = ticket.CreatedBy?.FullName,
            AssignedTechnicianId = ticket.AssignedTechnician?.Id,
            AssignedTechnicianName = ticket.AssignedTechnician?.FullName,
            History = ticket.History
                .OrderBy(h => h.ChangedAt)
                .Select(h => new TicketHistoryDto
                {
                    OldStatus = h.OldStatus,
                    NewStatus = h.NewStatus,
                    ChangedAt = h.ChangedAt,
                    ChangedByName = h.ChangedBy?.FullName,
                    Comment = h.Comment
                })
                .ToList()
        };
    }
}
