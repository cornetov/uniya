using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Uniya.Web.Models;
using Uniya.Shared.Services;
using Uniya.CMS.Model;
using Uniya.CMS.Data;

namespace Uniya.Web.Controllers;

/// <summary>Authenticate.</summary>
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthenticateController : ControllerBase
{
    public static IUser user = XProxy.Get<IUser>();
    //private readonly IConfiguration _configuration;
    private readonly IUserService _userService;

    //public AuthController(IConfiguration configuration, IUserService userService)
    public AuthenticateController(IUserService userService)
    {
        //_configuration = configuration;
        _userService = userService;
    }


    //private readonly IAuthService _authService;

    //public AuthController(IAuthService authService)
    //{
    //    _authService = authService;
    //}

    // POST: auth/login
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Login([FromBody] XLoginUser user)
    {
        if (String.IsNullOrEmpty(user.UserEmail))
        {
            return BadRequest(new { message = "Email address needs to entered" });
        }
        else if (String.IsNullOrEmpty(user.Password))
        {
            return BadRequest(new { message = "Password needs to entered" });
        }

        User loggedInUser = await _userService.Login(user.UserEmail, user.Password);

        if (loggedInUser != null)
        {
            return Ok(loggedInUser);
        }

        return BadRequest(new { message = "User login unsuccessful" });
    }

    // POST: auth/register
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Register([FromBody] XRegisterUser user)
    {
        if (String.IsNullOrEmpty(user.Name))
        {
            return BadRequest(new { message = "Name needs to entered" });
        }
        else if (String.IsNullOrEmpty(user.UserName))
        {
            return BadRequest(new { message = "User name needs to entered" });
        }
        else if (String.IsNullOrEmpty(user.Password))
        {
            return BadRequest(new { message = "Password needs to entered" });
        }

        User userToRegister = new(user.UserName, user.Name, user.Password, user.Role);

        User registeredUser = await _userService.Register(userToRegister);

        User loggedInUser = await _authService.Login(registeredUser.UserName, user.Password);

        if (loggedInUser != null)
        {
            return Ok(loggedInUser);
        }

        return BadRequest(new { message = "User registration unsuccessful" });
    }

    // GET: auth/test
    [Authorize(Roles = "Everyone")]
    [HttpGet]
    public IActionResult Test()
    {
        string token = Request.Headers["Authorization"];

        if (token.StartsWith("Bearer"))
        {
            token = token.Substring("Bearer ".Length).Trim();
        }
        var handler = new JwtSecurityTokenHandler();

        JwtSecurityToken jwt = handler.ReadJwtToken(token);

        var claims = new Dictionary<string, string>();

        foreach (var claim in jwt.Claims)
        {
            claims.Add(claim.Type, claim.Value);
        }

        return Ok(claims);
    }

    [HttpGet, Authorize]
    public Task<ActionResult<UserInfo>> GetMe()
    {
        var userInfo = new UserInfo()
        {
            userId = 1,
            userName = _userService.GetMyName(),
            userRoles = _userService.GetMyRoles()
        };
        return Ok(userInfo);
    }

    [HttpPost("register")]
    public async Task<ActionResult<long>> Register(UserLogin request)
    {
        XProxy.TestPassword(request.password, out string hash, out string salt);

        //user.Id = 1;
        user.Name = request.userName;
        user.PsswdHash = hash;
        user.PsswdSalt = salt;

        return Ok(user.Id);
    }

    [HttpPost("login")]
    public async Task<ActionResult<XUserToken>> Login(UserLogin request)
    {
        if (user.Name != request.userName)
        {
            return BadRequest("User not found.");
        }

        if (!XProxy.VerifyPassword(request.password, user.PsswdHash, user.PsswdSalt))
        {
            return BadRequest("Wrong password.");
        }

        return Ok(_userService.Login(user));
    }

    [HttpPost]
    [Route("refresh")]
    public async Task<IActionResult> Refresh(XUserToken userToken)
    {
        if (userToken is null || userToken.refreshToken is null)
        {
            return BadRequest("Invalid refresh request");
        }
        try
        {
            return Ok(_userService.Refresh(userToken));
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    //private string CreateToken(User user)
    //{
    //    List<Claim> claims = new List<Claim>
    //    {
    //        new Claim(ClaimTypes.Name, user.Username),
    //        new Claim(ClaimTypes.Role, "Reader"),
    //        new Claim(ClaimTypes.Role, "Writer"),
    //        new Claim(ClaimTypes.Role, "Admin")
    //    };

    //    var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(
    //        _configuration.GetSection("AppSettings:Secret").Value));

    //    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

    //    var token = new JwtSecurityToken(
    //        claims: claims,
    //        expires: DateTime.Now.AddDays(1),
    //        signingCredentials: creds);

    //    var jwt = new JwtSecurityTokenHandler().WriteToken(token);

    //    return jwt;
    //}
}
