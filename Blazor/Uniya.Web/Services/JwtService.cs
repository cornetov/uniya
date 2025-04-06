namespace Uniya.Web.Services;

using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Uniya.Web.Models;
using Uniya.Shared.Services;
using Uniya.CMS.Data;
using Uniya.CMS.Model;

public interface IJwtService
{
    XUserToken GenerateToken(IUser user);
    bool ValidateAccessToken(string? token, out string userName, out List<string> userRoles);
    bool ValidateRefreshToken(string? token, out Guid guid, out DateTime expires);
}

public class JwtService(IOptions<AppSettings> appSettings) : IJwtService
{
    private readonly AppSettings _appSettings = appSettings.Value;

    public XUserToken GenerateToken(IUser user)
    {
        // expires date and time
        var dtNow = DateTime.Now;
        var expires = dtNow.AddMinutes(_appSettings.FastInMinutes);

        // user identifier and roles
        List<Claim> claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, XRole.Reader),
            new Claim(ClaimTypes.Role, XRole.Writer),
            new Claim(ClaimTypes.Role, XRole.Administrator),
            new Claim(ClaimTypes.Expired, expires.ToString("u"))
        };

        // access token
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(_appSettings.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        // refresh token
        var guid = Guid.NewGuid();
        expires = dtNow.AddDays(_appSettings.LongInDays);
        var dtBytes = GetBytes(expires);
        var guidBytes = guid.ToByteArray();
        var data = new byte[40];
        Array.Copy(guidBytes, 0, data, 0, guidBytes.Length);
        Array.Copy(dtBytes, 0, data, 16, dtBytes.Length);
        dtBytes = GetBytes(user.Id);
        Array.Copy(dtBytes, 0, data, 24, dtBytes.Length);
        dtBytes = GetBytes(dtNow);
        Array.Copy(dtBytes, 0, data, 32, dtBytes.Length);
        data = XProxy.Encrypt(data);

        //var jwt = new JwtSecurityTokenHandler().WriteToken(token);

        // generate token that is valid for 7 days
        //var tokenHandler = new JwtSecurityTokenHandler();
        //var key = Encoding.ASCII.GetBytes(_appSettings.Secret ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
        //var tokenDescriptor = new SecurityTokenDescriptor
        //{
        //    Subject = new ClaimsIdentity(claims),
        //    Expires = DateTime.UtcNow.AddDays(7),
        //    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        //};
        //var token = tokenHandler.CreateToken(tokenDescriptor);
        //return tokenHandler.WriteToken(token);

        return new XUserToken()
        {
            AccessToken = tokenHandler.WriteToken(token),
            RefreshToken = Convert.ToBase64String(data)
        };
    }

    private static byte[] GetBytes(Guid value)
    {
        return value.ToByteArray();
    }
    private static byte[] GetBytes(DateTime value)
    {
        return BitConverter.GetBytes(value.ToBinary());
    }
    private static byte[] GetBytes(int value)
    {
        return BitConverter.GetBytes(value);
    }
    private static byte[] GetBytes(long value)
    {
        return BitConverter.GetBytes(value);
    }
    private static byte[] GetBytes(float value)
    {
        return BitConverter.GetBytes(value);
    }
    private static byte[] GetBytes(double value)
    {
        return BitConverter.GetBytes(value);
    }

    private static string GenerateRefreshToken()
    {
        var guid = Guid.NewGuid();
        return Convert.ToBase64String(guid.ToByteArray());
        //var randomNumber = new byte[64];
        //using var rng = RandomNumberGenerator.Create();
        //rng.GetBytes(randomNumber);
        //return Convert.ToBase64String(randomNumber);
    }

    public bool ValidateAccessToken(string? token, out string userName, out List<string> userRoles)
    {
        // initialization
        userName = string.Empty;
        userRoles = new List<string>();

        // sanity
        if (token == null) return false;

        // validate
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_appSettings.Secret ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
        try
        {
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                // set clock-skew to zero so tokens expire exactly at token expiration time (instead of 5 minutes later)
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
            //user = jwtToken.Claims.First(x => x.Type == ClaimTypes.Name).Value;
            foreach (var claim in jwtToken.Claims)
            {
                if (claim.Type == ClaimTypes.Name)
                    userName = claim.Value;
                else if (claim.Type == ClaimTypes.Role)
                    userRoles.Add(claim.Value);
            }

            // return if validation successful
            return true;
        }
        catch
        {
            // return if validation fails
            return false;
        }
    }

    public bool ValidateRefreshToken(string? token, out Guid guid, out DateTime expires)
    {
        // initialization
        guid = Guid.Empty;
        expires = DateTime.MinValue;

        // sanity
        if (token == null) return false;

        // validate
        var data = Convert.FromBase64String(token);
        try
        {
            data = XProxy.Decrypt(data);
            var guidBytes = new byte[16];
            Array.Copy(data, 0, guidBytes, 0, guidBytes.Length);
            expires = DateTime.FromBinary(BitConverter.ToInt64(data, 16));
            guid = new Guid(guidBytes);

            // done, if validation successful
            return true;
        }
        catch
        {
            // done, if validation fails
            return false;
        }
    }
}
