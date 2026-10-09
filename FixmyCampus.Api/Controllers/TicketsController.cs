// PATH: FixmyCampus.Api/Controllers/TicketsController.cs  (replace whole file)
using System.Security.Claims;
using FixmyCampus.Application.DTOs.Tickets;
using FixmyCampus.Application.Interfaces;
using FixmyCampus.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FixmyCampus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    // The user id always comes from the JWT, never from the client.
    private int GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");

        if (!int.TryParse(userId, out var id))
            throw new UnauthorizedAccessException("Invalid user ID.");

        return id;
    }

    // POST: api/tickets
    [HttpPost]
    public async Task<IActionResult> Create(CreateTicketDto dto)
    {
        var ticket = await _ticketService.CreateAsync(dto, GetCurrentUserId());
        return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, ticket);
    }

    // GET: api/tickets            -> campus feed (any logged-in user)
    // GET: api/tickets?building=1&status=0
    [HttpGet]
    public async Task<IActionResult> GetAll(Building? building, TicketStatus? status)
    {
        var tickets = await _ticketService.GetFilteredAsync(building, status);
        return Ok(tickets);
    }

    // GET: api/tickets/my
    [HttpGet("my")]
    public async Task<IActionResult> GetMyTickets()
    {
        var tickets = await _ticketService.GetMyTicketsAsync(GetCurrentUserId());
        return Ok(tickets);
    }

    // GET: api/tickets/5   -> detail + status history
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var ticket = await _ticketService.GetByIdAsync(id);

        if (ticket == null)
            return NotFound(new { message = "Ticket not found." });

        return Ok(ticket);
    }

    // PUT: api/tickets/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateTicketDto dto)
    {
        var ticket = await _ticketService.UpdateAsync(id, dto, GetCurrentUserId());

        if (ticket == null)
            return NotFound(new { message = "Ticket not found or you are not the owner." });

        return Ok(ticket);
    }

    // DELETE: api/tickets/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _ticketService.DeleteAsync(id, GetCurrentUserId());

        if (!deleted)
            return NotFound(new { message = "Ticket not found." });

        return NoContent();
    }

    // PUT: api/tickets/5/assign   body: { "technicianId": 3 }
    [HttpPut("{id:int}/assign")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Assign(int id, AssignTicketDto dto)
    {
        try
        {
            var ticket = await _ticketService.AssignAsync(id, dto, GetCurrentUserId());

            if (ticket == null)
                return NotFound(new { message = "Ticket not found." });

            return Ok(ticket);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PATCH: api/tickets/5/status   body: { "status": 2, "comment": "..." }
    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Admin,Technician")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateTicketStatusDto dto)
    {
        try
        {
            var ticket = await _ticketService.UpdateStatusAsync(
                id, dto.Status, GetCurrentUserId(), dto.Comment);

            if (ticket == null)
                return NotFound(new { message = "Ticket not found." });

            return Ok(ticket);
        }
        catch (InvalidOperationException ex)
        {
            // illegal skip / backward move -> 400
            return BadRequest(new { message = ex.Message });
        }
    }
}
