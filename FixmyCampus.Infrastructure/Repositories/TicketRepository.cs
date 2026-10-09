// PATH: FixmyCampus.Infrastructure/Repositories/TicketRepository.cs  (replace whole file)
using FixmyCampus.Application.Interfaces;
using FixmyCampus.Domain.Entities;
using FixmyCampus.Domain.Enums;
using FixmyCampus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FixmyCampus.Infrastructure.Repositories;

public class TicketRepository : ITicketRepository
{
    private readonly AppDbContext _context;

    public TicketRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Ticket ticket)
    {
        await _context.Tickets.AddAsync(ticket);
    }

    // Detail view: includes the status history (with who changed it)
    public async Task<Ticket?> GetByIdAsync(int id)
    {
        return await _context.Tickets
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTechnician)
            .Include(t => t.History)
                .ThenInclude(h => h.ChangedBy)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<IEnumerable<Ticket>> GetAllAsync()
    {
        return await _context.Tickets
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTechnician)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Ticket>> GetByUserIdAsync(int userId)
    {
        return await _context.Tickets
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTechnician)
            .Where(t => t.CreatedById == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Ticket>> GetFilteredAsync(
        Building? building,
        TicketStatus? status)
    {
        var query = _context.Tickets
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedTechnician)
            .AsQueryable();

        if (building.HasValue)
            query = query.Where(t => t.Building == building.Value);

        if (status.HasValue)
            query = query.Where(t => t.Status == status.Value);

        return await query
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<Technician?> GetTechnicianByIdAsync(int technicianId)
    {
        return await _context.Technicians
            .FirstOrDefaultAsync(t => t.Id == technicianId);
    }

    public Task UpdateAsync(Ticket ticket)
    {
        _context.Tickets.Update(ticket);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Ticket ticket)
    {
        _context.Tickets.Remove(ticket);
        return Task.CompletedTask;
    }

    public async Task AddHistoryAsync(TicketHistory history)
    {
        await _context.TicketHistories.AddAsync(history);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
