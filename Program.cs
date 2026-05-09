using Microsoft.EntityFrameworkCore;
using Models; // Ajusta según tu namespace
using Data;   // Ajusta según tu namespace
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuración de Base de Datos
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));


builder.Services.AddCors(options => {
options.AddDefaultPolicy(policy => {
// Para desarrollo pueden usar AllowAnyOrigin()
// Para producción, especifiquen su URL de Azure: .WithOrigins("https://mi-sitio.azurewebsites.net")
policy.AllowAnyOrigin()
.AllowAnyMethod()
.AllowAnyHeader();
});
});

builder.Services.AddOpenApi();
var app = builder.Build();

app.UseCors();

// Listado oficial de médicos (Requerimiento B)
string[] medicosAutorizados = { "MED-1010", "MED-2020", "MED-3030", "MED-4040", "MED-5050" };

if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

// --- ENDPOINT 1: POST (Registro con validaciones) ---
app.MapPost("/pacientes", async (Paciente nuevo, AppDbContext db) =>
{
    // Validación Médico
    if (!medicosAutorizados.Contains(nuevo.MedicoResponsable))
        return Results.Json(new { mensaje = "401 Unauthorized: Médico no autorizado" }, statusCode: 401);

    // Validación Capacidad Crítica
    if (nuevo.Gravedad == 5)
    {
        int criticos = await db.Pacientes.CountAsync(p => p.Gravedad == 5 && p.Estado == "En espera");
        if (criticos >= 5)
            return Results.BadRequest("Capacidad máxima alcanzada. Redirección inmediata a otro hospital sugerida");
    }

    // Generación de ID (PAC-2026-XXX)
    int correlativo = await db.Pacientes.CountAsync() + 1;
    nuevo.Id = $"PAC-2026-{correlativo:D3}";
    nuevo.FechaIngreso = DateTime.Now;

    db.Pacientes.Add(nuevo);
    await db.SaveChangesAsync();
    return Results.Created($"/pacientes/{nuevo.Id}", nuevo);
});

// --- ENDPOINT 2: GET (Algoritmo de Selección Manual) ---
app.MapGet("/pacientes", async (AppDbContext db) =>
{
    var lista = await db.Pacientes.ToListAsync();
    int n = lista.Count;

    // ALGORITMO DE SELECCIÓN (Sin OrderBy de LINQ)
    for (int i = 0; i < n - 1; i++)
    {
        int max = i;
        for (int j = i + 1; j < n; j++)
        {
            if (lista[j].Gravedad > lista[max].Gravedad) max = j;
            else if (lista[j].Gravedad == lista[max].Gravedad && lista[j].FechaIngreso < lista[max].FechaIngreso) max = j;
        }
        var temp = lista[max];
        lista[max] = lista[i];
        lista[i] = temp;
    }
    return Results.Ok(lista);
});

// --- ENDPOINT 3: PUT (Actualización de Estado) ---
app.MapPut("/pacientes/{id}", async (string id, Paciente actualizado, AppDbContext db) =>
{
    var paciente = await db.Pacientes.FindAsync(id);
    if (paciente == null) return Results.NotFound("Paciente no encontrado");

    paciente.Estado = actualizado.Estado; // Cambiar entre: En espera, Atendido o Derivado
    // Se puede actualizar también el médico si fuera necesario
    
    await db.SaveChangesAsync();
    return Results.NoContent();
});

// --- ENDPOINT 4: DELETE (Eliminar paciente) ---
app.MapDelete("/pacientes/{id}", async (string id, AppDbContext db) =>
{
    var paciente = await db.Pacientes.FindAsync(id);
    if (paciente == null) return Results.NotFound("Paciente no encontrado");

    db.Pacientes.Remove(paciente);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();