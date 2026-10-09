// PATH: FixmyCampus.Api/Controllers/TechniciansController.cs  (replace whole file)
using FixmyCampus.Application.DTOs.Technicians;
using FixmyCampus.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FixmyCampus.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class TechniciansController : ControllerBase
{
    private readonly ITechnicianService _technicianService;

    public TechniciansController(ITechnicianService technicianService)
    {
        _technicianService = technicianService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTechnicianDto dto)
    {
        try
        {
            var technician = await _technicianService.CreateAsync(dto);

            return Ok(new
            {
                message = "Technician created successfully.",
                id = technician.Id,
                fullName = technician.FullName,
                email = technician.Email,
                specialization = technician.Specialization,
                isAvailable = technician.IsAvailable
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // GET: api/technicians -> for the "assign" dropdown (id + name only,
    // never return the entity: it contains PasswordHash)
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var technicians = await _technicianService.GetAllAsync();

        return Ok(technicians.Select(t => new
        {
            id = t.Id,
            fullName = t.FullName,
            specialization = t.Specialization,
            isAvailable = t.IsAvailable
        }));
    }
}
