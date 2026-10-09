// PATH: FixmyCampus.Infrastructure/Data/DbSeeder.cs  (NEW file)
using FixmyCampus.Application.Interfaces;
using FixmyCampus.Domain.Entities;
using FixmyCampus.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FixmyCampus.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, IPasswordHasher hasher)
    {
        // ---- users (created only if the email does not exist yet) ----
        var admin = await GetOrCreate(db, "admin@hackathon.local", () =>
            new Admin { FullName = "Campus Admin", Role = UserRole.Admin, AdminId = 1 },
            hasher, "Admin123!");

        var reporter = await GetOrCreate(db, "user@hackathon.local", () =>
            new User { FullName = "Demo Reporter", Role = UserRole.User },
            hasher, "User123!");

        var tech1 = await GetOrCreate(db, "tech1@hackathon.local", () =>
            new Technician { FullName = "Abebe Kebede", Role = UserRole.Technician,
                             Specialization = TicketCategory.Electrical, IsAvailable = true },
            hasher, "Tech123!");

        var tech2 = await GetOrCreate(db, "tech2@hackathon.local", () =>
            new Technician { FullName = "Selam Tesfaye", Role = UserRole.Technician,
                             Specialization = TicketCategory.Network, IsAvailable = true },
            hasher, "Tech123!");

        await db.SaveChangesAsync();

        // ---- sample tickets (only when the table is empty) ----
        if (await db.Tickets.AnyAsync())
            return;

        var now = DateTime.UtcNow;

        var t1 = new Ticket
        {
            Title = "Projector not working", Description = "Projector shows no signal in the lab.",
            Building = Building.ComputerScienceBuilding, Room = "Lab 204",
            Category = TicketCategory.Other, Priority = TicketPriority.High,
            Status = TicketStatus.New, CreatedById = reporter.Id, CreatedAt = now.AddHours(-5)
        };

        var t2 = new Ticket
        {
            Title = "Wi-Fi access point down", Description = "No Wi-Fi on the second floor.",
            Building = Building.MainLibrary, Room = "2nd floor reading hall",
            Category = TicketCategory.Network, Priority = TicketPriority.Urgent,
            Status = TicketStatus.Assigned, CreatedById = reporter.Id,
            AssignedTechnicianId = tech2.Id, CreatedAt = now.AddHours(-4), UpdatedAt = now.AddHours(-3)
        };

        var t3 = new Ticket
        {
            Title = "Broken light", Description = "Ceiling light flickers all day.",
            Building = Building.EngineeringBuilding, Room = "Room 112",
            Category = TicketCategory.Electrical, Priority = TicketPriority.Medium,
            Status = TicketStatus.InProgress, CreatedById = reporter.Id,
            AssignedTechnicianId = tech1.Id, CreatedAt = now.AddHours(-3), UpdatedAt = now.AddHours(-1)
        };

        db.Tickets.AddRange(t1, t2, t3);
        await db.SaveChangesAsync();

        db.TicketHistories.AddRange(
            new TicketHistory { TicketId = t2.Id, OldStatus = TicketStatus.New, NewStatus = TicketStatus.Assigned,
                ChangedById = admin.Id, Comment = "Assigned to Selam Tesfaye", ChangedAt = now.AddHours(-3) },
            new TicketHistory { TicketId = t3.Id, OldStatus = TicketStatus.New, NewStatus = TicketStatus.Assigned,
                ChangedById = admin.Id, Comment = "Assigned to Abebe Kebede", ChangedAt = now.AddHours(-2) },
            new TicketHistory { TicketId = t3.Id, OldStatus = TicketStatus.Assigned, NewStatus = TicketStatus.InProgress,
                ChangedById = tech1.Id, Comment = "Started work", ChangedAt = now.AddHours(-1) });

        await db.SaveChangesAsync();
    }

    private static async Task<User> GetOrCreate(
        AppDbContext db, string email, Func<User> factory,
        IPasswordHasher hasher, string password)
    {
        var existing = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (existing != null) return existing;

        var user = factory();
        user.Email = email;
        user.IsActive = true;
        user.CreatedAt = DateTime.UtcNow;
        user.PasswordHash = hasher.HashPassword(user, password);

        db.Users.Add(user);
        await db.SaveChangesAsync();   // need the generated Id
        return user;
    }
}
