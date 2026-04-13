using cmsDb2024_System.Models;
using Microsoft.EntityFrameworkCore;
using CMS_System;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CMS_System.Controllers.GeolocalizacionDataHub;
using CMS_System.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpContextAccessor();

builder.Services.AddSwaggerGen(c => {
    c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
    c.IgnoreObsoleteActions();
    c.IgnoreObsoleteProperties();
    c.CustomSchemaIds(type => type.FullName);
});

var configuration = new ConfigurationBuilder()
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json").Build();

var connectionString = configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<cmsDb2024Context>(options => options.UseSqlServer(connectionString));
builder.Services.AddControllersWithViews().AddNewtonsoftJson(options => options.SerializerSettings
                                                                               .ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

builder.Services.AddSignalR(options => {
    options.EnableDetailedErrors = true;
    options.MaximumReceiveMessageSize = 10 * 1024 * 1024; // 10MB
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})

.AddJwtBearer(options =>
{
    var key = Encoding.ASCII.GetBytes(configuration["Jwt:Key"]);
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(policy =>
{
    policy.WithOrigins(
            "http://localhost:2255",
            "http://localhost:5075",
            "https://cmstickets.cashmachserv.com",
            "https://cmserp.cashmachserv.com",
            "https://cmsmailing.cashmachserv.com"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
});

app.UseHttpsRedirection();
app.UseStaticFiles();
app.MapControllers();
app.UseAuthorization();
app.MapHub<CronoAsignacionHUb>("/hubs/asignCronoHub");
app.MapHub<MantenimimetoEstados>("/hubs/estadosMantenimientosCanbiados");
app.MapHub<GeolocalizacionDataHub>("/hubs/geolocalizacionHub");
app.MapHub<PermissionsHub>("/hubs/permissionsHub");


app.Run();

