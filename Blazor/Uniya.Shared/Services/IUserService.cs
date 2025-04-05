namespace Uniya.Shared.Services;

using Uniya.CMS.Model;

public interface IUserService
{
    Task<string> GetMyName();
    Task<string[]> GetMyRoles();
    Task<XUserToken> Login(IUser user);
    Task<XUserToken> Register(XRegisterUser user);
    Task<XUserToken> Refresh(XUserToken userToken);
}

public class XUserToken
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}
