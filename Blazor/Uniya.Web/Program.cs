using Microsoft.FluentUI.AspNetCore.Components;

using System.Text;

using Microsoft.AspNetCore.Authentication.JwtBearer;

using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

using Uniya.Shared.Services;
using Uniya.Web.Components;
using Uniya.Web.Services;
using Uniya.Web.Models;

// Builder
var builder = WebApplication.CreateBuilder(args);
var secret = builder.Configuration.GetSection("AppSettings:Secret").Value;
secret ??= AppSettings.Token;

// Add services to the container
var services = builder.Services;
services.AddRazorComponents()
    .AddInteractiveServerComponents();
services.AddFluentUIComponents();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
services.AddEndpointsApiExplorer();
services.AddScoped<IJwtService, JwtService>();
services.AddScoped<IUserService, UserService>();
services.AddHttpContextAccessor();
services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Standard Authorization header using the Bearer scheme (\"bearer {token}\")",
        In = ParameterLocation.Header,
        Name = "Authorization",
        Scheme = "Bearer",
        BearerFormat = "JWT",
        Type = SecuritySchemeType.ApiKey
    });
    //options.OperationFilter<SecurityRequirementsOperationFilter>();
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// Add device-specific services used by the Uniya.Shared project
services.AddSingleton<IFormFactor, FormFactor>();

// Application
var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

// Swagger interface
app.UseSwagger();
app.UseSwaggerUI();

// Routing
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

// Custom JWT authorization middle-ware
app.UseMiddleware<JwtMiddleware>();

// Authentication
app.UseAuthentication();
app.UseAuthorization();

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddAdditionalAssemblies(typeof(Uniya.Shared._Imports).Assembly);

app.Run();
