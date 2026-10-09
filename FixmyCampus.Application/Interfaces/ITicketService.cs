// PATH: FixmyCampus.Application/Interfaces/ITicketService.cs  (replace whole file)
using FixmyCampus.Application.DTOs.Tickets;
using FixmyCampus.Domain.Enums;

namespace FixmyCampus.Application.Interfaces;

public interface ITicketService
{
    Task<TicketResponseDto> CreateAsync(CreateTicketDto dto, int userId);

    Task<IEnumerable<TicketResponseDto>> GetAllAsync();

    Task<IEnumerable<TicketResponseDto>> GetFilteredAsync(
        Building? building,
        TicketStatus? status);

    Task<TicketResponseDto?> GetByIdAsync(int id);

    Task<IEnumerable<TicketResponseDto>> GetMyTicketsAsync(int userId);

    Task<TicketResponseDto?> UpdateAsync(int id, UpdateTicketDto dto, int userId);

    Task<bool> DeleteAsync(int id, int userId);

    // New -> Assigned
    Task<TicketResponseDto?> AssignAsync(
        int ticketId,
        AssignTicketDto dto,
        int changedById);

    // Assigned -> InProgress -> Resolved (forward only)
    Task<TicketResponseDto?> UpdateStatusAsync(
        int ticketId,
        TicketStatus status,
        int changedById,
        string? comment);
}
