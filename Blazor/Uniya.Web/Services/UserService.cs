namespace Uniya.Web.Services;

using Microsoft.Extensions.Options;

using System.Security.Claims;
using Uniya.Web.Models;
using Uniya.Shared.Services;
using Uniya.CMS.Model;
using Uniya.CMS.Data;

public class UserService : IUserService
{
    private HttpContext? _httpContext;
    private UserContext _userContext;
    private IJwtService _jwtService;
    private readonly AppSettings _appSettings;

    public UserService(IHttpContextAccessor context, IJwtService jwt, IOptions<AppSettings> options)
    {
        _httpContext = context.HttpContext;
        _jwtService = jwt;
        _appSettings = options.Value;
        _userContext = new UserContext(_appSettings);
    }

    //private readonly IHttpContextAccessor _httpContextAccessor;

    //public UserService(IHttpContextAccessor httpContextAccessor)
    //{
    //    _httpContextAccessor = httpContextAccessor;
    //}

    //public string Login(string login, string password)
    public XUserToken Login(IUser user)
    {
        // create session
        var userToken = _jwtService.GenerateToken(user, );
        return userToken;
    }
    public async Task<XUserToken> Login(string userEmail, string password)
    {
        _userContext.Users

        // create session
        var userToken = _jwtService.GenerateToken(user);
        return userToken;
    }
    public XUserToken Refresh(XUserToken userToken)
    {
        // update session
        return new XUserToken() { AccessToken = "", RefreshToken = "" };
    }

    public string GetMyName()
    {
        return GetMyName(_httpContext);
        //return GetMyName(_httpContextAccessor.HttpContext);
    }
    public string[] GetMyRoles()
    {
        return GetMyRoles(_httpContext);
    }

    static string GetMyName(HttpContext? httpContext)
    {
        var result = string.Empty;
        if (httpContext != null && httpContext.User != null)
        {
            result = httpContext.User.FindFirstValue(ClaimTypes.Name);
        }
        return result;
    }
    static string[] GetMyRoles(HttpContext? httpContext)
    {
        var result = new List<string>();
        if (httpContext != null && httpContext.User != null)
        {
            foreach (var role in httpContext.User.FindAll(ClaimTypes.Role))
                result.Add(role.Value);
        }
        return result.ToArray();
    }

}
