using Microsoft.EntityFrameworkCore;
using ProyectoBase.DataAccess.Interfaces;
using ProyectoBase.DataAccess.Servicios;
using ProyectoBase.Models;
using ProyectoBase.Services;
using ProyectoBase.Utility;

// 1. Habilitar interruptor de compatibilidad de fechas para PostgreSQL
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// 2. Configurar DbContext con PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Registrar Repositorio Genérico
builder.Services.AddScoped(typeof(IRepositoryAsync<>), typeof(RepositoryAsync<>));

// 4. Registrar Servicio Genérico de forma abierta
builder.Services.AddScoped(typeof(IServiceAsync<>), typeof(ServiceAsync<>));

// 5. Configurar Controladores con NewtonsoftJson
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

// Habilitar la generación de Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 6. Configurar CORS (orígenes permitidos)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// 7. Configurar el pipeline de middleware HTTP
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<GlobalErrorHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
