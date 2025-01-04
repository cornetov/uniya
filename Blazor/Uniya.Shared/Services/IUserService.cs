namespace Uniya.Shared.Services;

using Uniya.CMS;

public interface IUserService
{
    string GetMyName();
    string[] GetMyRoles();
    UserToken Login(IUser user);
    UserToken Refresh(UserToken userToken);
}

public class UserToken
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}
