using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using ProyectoBase.DataAccess.Interfaces;
using ProyectoBase.DataAccess.Servicios;
using ProyectoBase.Models;
using ProyectoBase.Services.GenericService;
using ProyectoBase.Services.TokenService;
using ProyectoBase.Services.UsuarioService;
using ProyectoBase.Utility;
using System;
using System.Text;

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

// 5. Registrar TokenService
builder.Services.AddScoped<ITokenService, TokenService>();

// 6. Registrar UsuarioService
builder.Services.AddScoped<IUsuarioService, UsuarioService>();

// 7. Registrar Servicios de Etapa 3
builder.Services.AddScoped<ProyectoBase.Services.DisponibilidadService>();
builder.Services.AddScoped<ProyectoBase.Services.CancelacionMasivaService>();
builder.Services.AddScoped<ProyectoBase.Services.ReservaService>();

// 8. Configurar Autenticación JWT Bearer
string jwtSecretKey = builder.Configuration["Jwt:Admin:Key"] ?? builder.Configuration["Jwt:SecretKey"] ?? "ClaveSecretaSuperSeguraYMuyLarga12345!";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// 9. Configurar Autorización y Policies de Grupos Lógicos
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RESIDENTE", policy =>
        policy.RequireRole("INQUILINO", "PROPIETARIO"));

    options.AddPolicy("ADMINISTRADOR", policy =>
        policy.RequireRole("ADMINISTRADOR_AVANZADO", "SUPER_ADMINISTRADOR"));
});

// 10. Configurar Controladores con NewtonsoftJson
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

// 11. Habilitar la generación de Swagger / OpenAPI con soporte para JWT Bearer
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ProyectoBase API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Ingrese el token JWT usando el esquema Bearer. Ejemplo: 'Bearer 12345abcdef'",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement((doc) => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer"),
            new System.Collections.Generic.List<string>()
        }
    });
});

// 12. Configurar CORS (orígenes permitidos)
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

// 13. Aplicar migraciones pendientes automáticamente al iniciar
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();

    // 13.1 Seed programático e idempotente del usuario Juan Cruz y sus roles
    var juanCruz = System.Linq.Enumerable.FirstOrDefault(
        Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.Include(db.Usuarios, u => u.UsuarioRoles),
        u => u.Username == "juancruz" || u.Email == "juancruz@consorcio.com");

    if (juanCruz == null)
    {
        juanCruz = new Usuario
        {
            Username = "juancruz",
            Email = "juancruz@consorcio.com",
            Password = "123",
            Rol = "SUPER_ADMINISTRADOR",
            Activo = true
        };
        db.Usuarios.Add(juanCruz);
        db.SaveChanges();
    }

    var rolesIds = System.Linq.Enumerable.ToList(
        System.Linq.Enumerable.Select(
            System.Linq.Enumerable.Where(db.Roles, r => r.Codigo == "SUPER_ADMINISTRADOR" || r.Codigo == "ADMINISTRADOR_AVANZADO"),
            r => r.IDRol));

    foreach (var idRol in rolesIds)
    {
        if (!System.Linq.Enumerable.Any(db.UsuariosRoles, ur => ur.IDUsuario == juanCruz.IDUsuario && ur.IDRol == idRol))
        {
            db.UsuariosRoles.Add(new UsuarioRol { IDUsuario = juanCruz.IDUsuario, IDRol = idRol });
        }
    }
    db.SaveChanges();
}

// 14. Configurar el pipeline de middleware HTTP
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
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
