using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Security.Claims;
using System.Text;
using ticketsRequerimientosBackend;
using ticketsRequerimientosBackend.auditoria_services;
using ticketsRequerimientosBackend.Controllers.Geolocalizacion.signalr_gl;
using ticketsRequerimientosBackend.funcionality;
using ticketsRequerimientosBackend.LoggerControl;
using ticketsRequerimientosBackend.Models;

var builder = WebApplication.CreateBuilder(args);

// Configuración de DbContext
builder.Services.AddDbContext<cmsDb2024Context>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<AuditoriaService>();
builder.Services.AddScoped<OperacionesAuditoriaService>();
builder.Services.AddScoped<IntervalMinsDate>();

// Configuración mejorada de autenticación JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer( options => {
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
        NameClaimType = ClaimTypes.NameIdentifier,
        RoleClaimType = ClaimTypes.Role
    };
});

// Configuración de controladores
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
    });

builder.Services.AddEndpointsApiExplorer();

// Configuración mejorada de Swagger para JWT
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "API Tickets", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement( new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header
            },
            new List<string>()
        }
    });
});

// Configuración de logging
Log.Logger = new LoggerConfiguration()
    .WriteTo.File("logs/webApiLogsControl.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Logging.ClearProviders();
builder.Logging.AddSerilog();

// Servicios adicionales
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<LogControlWebApiRest>();

// Configuración de SignalR
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.MaximumReceiveMessageSize = 1024 * 1024; // 1MB
});

var app = builder.Build();

// Configuración del pipeline de middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API Tickets v1");
        c.OAuthClientId("swagger-ui");
        c.OAuthAppName("Swagger UI");
    });
}

// Configuración de CORS (actualizada)
// 1. Asegúrate de que este bloque esté después de app.UseRouting()
app.UseRouting();

app.UseCors(policy =>
{
    policy.WithOrigins(
            "http://localhost:2255",
            "http://localhost:5075",
            "http://104.243.44.89:5001",
            "http://104.243.44.89:4004",
            "https://cmstickets.cashmachserv.com",
            "https://cmsmailing.cashmachserv.com"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
});

// Configuración de WebSocket
var webSocketOptions = new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromSeconds(120)
};

foreach (var origin in new[] {
    "http://localhost:2255",
    "http://104.243.44.89:5001",
    "https://cmstickets.cashmachserv.com",
    "http://104.243.44.89:4004",
    "https://cmsmailing.cashmachserv.com"
})
{
    webSocketOptions.AllowedOrigins.Add(origin);
}

// Orden CRUCIAL de middlewares
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseWebSockets(webSocketOptions);
app.UseRouting();

// IMPORTANTE: Este orden es esencial
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Hubs SignalR
app.MapHub<TicketResolucionHUB>("hubs/estadoTickets");
app.MapHub<TicketSendAlert>("hubs/SendTicketRequerimientoHub");
app.MapHub<MesnajeHub>("hubs/msjHub");
app.MapHub<AprobarCotizacionHub>("hubs/SendCotizAproHub");
app.MapHub<TecnicosSendHub>("hubs/SendTecnicoAsignado");
app.MapHub<fileAlertHub>("hubs/SendfileAlertHubTunel");
app.MapHub<EliminacionTecnicoHub>("hubs/EliminarTecnicoSignalRequer");
app.MapHub<FileDelete>("hubs/EliminarArchivoRequer");
app.MapHub<HoraMantenimientoHub>("hubs/TiempoMantenimiento");
app.MapHub<LocationHub>("/locationHub");

app.Run();