using System;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.Collections.Generic;
using Uniya.CMS.Model;

#if ID_GUID
using _Id = System.Guid;
#else
using _Id = System.Int64;
#endif

namespace Uniya.CMS.Data;

/// <summary>
/// Proxy of database.
/// </summary>
public class XCmsSet : XSet
{
    // ------------------------------------------------------------------------------------
    #region ** general object model

    private List<INotifyCollectionChanged> _list = new List<INotifyCollectionChanged>();

    public XCmsSet()
    {
        // base
        AddSet(Persons = []);
        AddSet(Users = []);
        AddSet(Roles = []);
        AddSet(UserRoles = []);
        AddSet(UserSessions = []);

        AddSet(Connections = []);
        AddSet(Tasks = []);

        AddSet(Parameters = []);
        AddSet(Scripts = []);
    }

    void AddSet(INotifyCollectionChanged notify)
    {
        _list.Add(notify);
        notify.CollectionChanged += OnCollectionChanged;
    }

    // database model
    public XSetCollection<IPerson> Persons { get; private set; }
    public XSetCollection<IUser> Users { get; private set; }
    public XSetCollection<IRole> Roles { get; private set; }
    public XSetCollection<IUserRole> UserRoles { get; private set; }
    public XSetCollection<IUserSession> UserSessions { get; private set; }

    public XSetCollection<IConnection> Connections { get; private set; }
    public XSetCollection<ITask> Tasks { get; private set; }

    public XSetCollection<IParameter> Parameters { get; private set; }
    public XSetCollection<IScript> Scripts { get; private set; }

    #endregion

    // ------------------------------------------------------------------------------------
    #region ** fill primary database

    public void Fill()
    {
        // --------------------------------------------------------------
        IPerson person;

        var dtNow = DateTime.Now;

        person = XProxy.Get<IPerson>();
#if ID_GUID
        person.Id = _Id.Parse("d16f4eaf-1239-45b2-b212-3497cac73546");
#else
        person.Id = 1;
#endif
        person.FirstName = "Administrator";
        person.LastName = "Unknown";
        person.Created = dtNow;
        person.Modified = dtNow;
        Persons.Add(person);

        // --------------------------------------------------------------
        IUser user;

        XProxy.TestPassword("Passw0rd", out string hash, out string salt);

        user = XProxy.Get<IUser>();
#if ID_GUID
        user.Id = _Id.Parse("64cb86fe-58cf-4c3a-bfe7-d54cbefbaf38");
#else
        user.Id = 1;
        //user.PersonId = 1;
#endif
        user.Name = "Admin";
        user.PsswdHash = hash;
        user.PsswdSalt = salt;
        user.Email = "admin@triotour.com";
        user.IsEmailChecked = true;
        user.Phone = "+7(910)5540021";
        user.IsPhoneChecked = true;
        user.IsActive = true;
        user.Created = dtNow;
        user.Modified = dtNow;
        Users.Add(user);

        // --------------------------------------------------------------
        IRole role;

        role = XProxy.Get<IRole>();
#if ID_GUID
        role.Id = _Id.Parse("ac9df305-4631-4a45-bb46-1e90d3775a14");
        role.CreatedUserId = _Id.Parse("64cb86fe-58cf-4c3a-bfe7-d54cbefbaf38");
        role.ModifiedUserId = _Id.Parse("64cb86fe-58cf-4c3a-bfe7-d54cbefbaf38");
#else
        role.Id = 1;
        role.CreatedUserId = 1;
        role.ModifiedUserId = 1;
#endif
        role.Name = XRole.Reader;
        role.Title = "Readers";
        role.Description = "Minimal rights for read only";
        role.IsActive = true;
        role.Created = dtNow;
        role.Modified = dtNow;
        Roles.Add(role);

        role = XProxy.Get<IRole>();
#if ID_GUID
        role.Id = _Id.Parse("b20f5556-d065-4ebd-923b-b0f6111be6d3");
        role.ParentId = _Id.Parse("ac9df305-4631-4a45-bb46-1e90d3775a14");
        role.CreatedUserId = _Id.Parse("64cb86fe-58cf-4c3a-bfe7-d54cbefbaf38");
        role.ModifiedUserId = _Id.Parse("64cb86fe-58cf-4c3a-bfe7-d54cbefbaf38");
#else
        role.Id = 2;
        role.ParentId = 1;
        role.CreatedUserId = 1;
        role.ModifiedUserId = 1;
#endif
        role.Name = XRole.Writer;
        role.Title = "Writers";
        role.Description = "Optimal rights for create, update or delete";
        role.IsActive = true;
        role.Created = dtNow;
        role.Modified = dtNow;
        Roles.Add(role);

        role = XProxy.Get<IRole>();
#if ID_GUID
        role.Id = _Id.Parse("cc12dda6-c98a-4ec5-969b-793019c2ca3a");
        role.ParentId = _Id.Parse("ac9df305-4631-4a45-bb46-1e90d3775a14");
        role.CreatedUserId = _Id.Parse("64cb86fe-58cf-4c3a-bfe7-d54cbefbaf38");
        role.ModifiedUserId = _Id.Parse("64cb86fe-58cf-4c3a-bfe7-d54cbefbaf38");
#else
        role.Id = 3;
        role.ParentId = 2;
        role.CreatedUserId = 1;
        role.ModifiedUserId = 1;
#endif
        role.Name = XRole.Administrator;
        role.Title = "Administrators";
        role.Description = "Full rights";
        role.IsActive = true;
        role.Created = dtNow;
        role.Modified = dtNow;
        Roles.Add(role);

        // --------------------------------------------------------------
        IUserRole userRole;

        userRole = XProxy.Get<IUserRole>();
#if ID_GUID
        userRole.Id = _Id.Parse("df0d7cd1-60e2-4ab9-9caf-d11f7cdfd3ca");
        userRole.UserId = _Id.Parse("717c4df0-a4b3-4d75-b2b8-925658823efb");
        userRole.RoleId = _Id.Parse("cc12dda6-c98a-4ec5-969b-793019c2ca3a");
        userRole.CreatedUserId = _Id.Parse("64cb86fe-58cf-4c3a-bfe7-d54cbefbaf38");
        userRole.ModifiedUserId = _Id.Parse("64cb86fe-58cf-4c3a-bfe7-d54cbefbaf38");
#else
        userRole.Id = 1;
        userRole.UserId = 1;
        userRole.RoleId = 3;
        userRole.CreatedUserId = 1;
        userRole.ModifiedUserId = 1;
#endif
        userRole.IsActive = true;
        userRole.Created = dtNow;
        userRole.Modified = dtNow;
        userRole.Note = "Default user's role";
        UserRoles.Add(userRole);

        // --------------------------------------------------------------
        IConnection connection;

        connection = XProxy.Get<IConnection>();
#if ID_GUID
        connection.Id = _Id.Parse("c774b6ec-5cb6-4174-93a5-d13af6bd72fa");
        connection.CreatedUserId = _Id.Parse("64cb86fe-58cf-4c3a-bfe7-d54cbefbaf38");
        connection.ModifiedUserId = _Id.Parse("64cb86fe-58cf-4c3a-bfe7-d54cbefbaf38");
#else
        connection.Id = 1;
        connection.CreatedUserId = 1;
        connection.ModifiedUserId = 1;
#endif
        connection.Name = "base";
        connection.Title = "Base";
        connection.Description = "Default SQLite connection";
        connection.HostUrl = "https://api.triotour.com/";
        connection.ClassName = "Uniya.Connectors.Sqlite.SqliteConnector";
        connection.ComplexCode = XProxy.Encrypt(@"Data Source = (LocalDB)\mssqllocaldb; Initial Catalog = master; Integrated Security = True;");
        connection.IsActive = true;
        connection.Created = dtNow;
        connection.Modified = dtNow;
        Connections.Add(connection);

        // --------------------------------------------------------------
        ITask task;

        task = XProxy.Get<ITask>();
#if ID_GUID
        task.Id = _Id.Parse("7b6473dc-6e0b-446c-aff8-500e55e64127");
        task.CreatedUserId = _Id.Parse("64cb86fe-58cf-4c3a-bfe7-d54cbefbaf38");
        task.ModifiedUserId = _Id.Parse("64cb86fe-58cf-4c3a-bfe7-d54cbefbaf38");
#else
        task.Id = 1;
        task.CreatedUserId = 1;
        task.ModifiedUserId = 1;
#endif
        task.Name = "Backup";
        task.Title = "Backup";
        task.Description = "Backup base storage";
        task.ClassName = "Uniya.Tasks.Backup";
        task.IsActive = false;
        task.Created = dtNow;
        task.Modified = dtNow;
        task.Note = "Backup";
        Tasks.Add(task);

        // --------------------------------------------------------------
        IParameter parameter;

        parameter = XProxy.Get<IParameter>();
#if ID_GUID
        parameter.Id = _Id.Parse("60130f07-9b04-480c-aec2-f790230e6b22");
        parameter.CreatedUserId = _Id.Parse("64cb86fe-58cf-4c3a-bfe7-d54cbefbaf38");
        parameter.ModifiedUserId = _Id.Parse("64cb86fe-58cf-4c3a-bfe7-d54cbefbaf38");
#else
        parameter.Id = 1;
        parameter.CreatedUserId = 1;
        parameter.ModifiedUserId = 1;
#endif
        parameter.Name = "LastRegistryDate";
        parameter.Title = "Registry date";
        parameter.Description = "Last date and time of change registry";
        parameter.Created = dtNow;
        parameter.Modified = dtNow;
        parameter.Value = "2019-08-15T17:00:00";
        parameter.Note = "Backup";
        Parameters.Add(parameter);

        //INSERT INTO[Person] ([Id], [FirstName], [SecondName], [LastName], [Birthday], [Phone], [Email], [Created], [Modified], [Note])
        //AddPerson(1, "Admin", "", "Unknown", "1970-04-26T09:00:01", "", "", "2019-08-15T17:00:02", "2019-08-15T17:00:02", "Fake person");

        //INSERT INTO[User] ([Id], [Name], [Active], [Password], [PersonId], [Created], [Modified], [Title], [Role], [Note])
        //AddUser(1, "admin", true, "nimda", 1, "2019-08-15T17:00:02", "2019-08-15T17:00:02", "Administrator", "admin", "Default administrator");

        //INSERT INTO[Role] ([Id], [Name], [Active], [Created], [Modified], [Title], [Note])
        //AddRole(1, "admin", true, "2019-08-15T17:00:02", "2019-08-15T17:00:02", "Administrators", "Full rights");
        //AddRole(2, "reader", true, "2019-08-15T17:00:02", "2019-08-15T17:00:02", "Readers", "Minimal rights for read only");
        //AddRole(3, "writer", true, "2019-08-15T17:00:02", "2019-08-15T17:00:02", "Writers", "Optimal rights for create, update or delete");

        //INSERT INTO[UserRole] ([Id], [Active], [UserId], [RoleId], [Created], [Modified], [Note])
        //AddUserRole(1, true, 1, 1, "2019-08-15T17:00:02", "2019-08-15T17:00:02", "Default administrator");
        //AddUserRole(2, true, 2, 2, "2019-08-15T17:00:02", "2019-08-15T17:00:02", "Any user");

        //INSERT INTO[Connection] ([Id], [Name], [Active], [ClassName], [Created], [Modified], [Title], [HostUrl], [Note])
        //AddConnection(1, "sys", true, "Uniya.Connectors.Sqlite.SqliteConnector", "2019-08-15T17:00:01", "2019-08-15T17:00:01", "Uniya System", "localhost", @"Data Source=(LocalDB)\mssqllocaldb;Initial Catalog=master;Integrated Security=True;");
        //AddConnection(2, "tt", true, "Uniya.Connectors.MsSql.MsSqlConnector", "2019-08-15T17:00:01", "2019-08-15T17:00:01", "Triotour Uniya", "api.triotour.com", "data source=ms-sql-7.in-solve.ru;initial catalog=1gb_uniya2;User ID=1gb_triotour;Password=b7ac0e623rty;");
        //AddConnection(3, "ftsp", true, "Uniya.Connectors.SharePoint.SharePointConnector", "2019-08-15T17:00:01", "2019-08-15T17:00:01", "Finguru SharePoint REG", "https://practic.sharepoint.com/sites/register", "VDoroshenko@a-practic.ru|Practic8");
        //AddConnection(4, "fgbx", true, "Uniya.Connectors.Bitrix24.Bitrix24Connector", "2021-03-10T12:30:01", "2021-03-10T12:30:01", "Finguru Bitrix24 PORTAL", "https://portal.finguru.com", "local.57fe05cb295182.55185886|6MTR5Go2xRVjWcHfTlKhvM5AshunytE9Ml739omM66z92jwVHv");
        //AddConnection(999, "test", true, "Uniya.Connectors.MsSql.MsSqlConnector", "2019-08-15T17:00:01", "2019-08-15T17:00:01", "Test Uniya", "192.168.173.50", "data source=192.168.173.50;initial catalog=TestDb1;User ID=sa;Password=1234Qwer;");

        //INSERT INTO[Task]([Id], [Name], [Active], [ClassName], [Created], [Modified], [Title], [Autostart], [Connections])
        //AddTask(1, "SysBackup", false, "Uniya.Tasks.SystemBackupTask", "2019-08-15T17:00:01", "2019-08-15T17:00:01", "Uniya System Backup MS SQL data", false, 0, "sys");
        //AddTask(999, "TestBackup", false, "Uniya.Tasks.TestBackupTask", "2019-08-15T17:00:01", "2019-08-15T17:00:01", "Uniya Test Backup MS SQL data", false, 0, "test");

        //INSERT INTO[Parameter]([Id], [Name], [Title], [ParamValue], [Created], [Modified])
        //AddParameter(1, "AccountantMonth", "Month of accountant", "201905", "2019-08-15T17:00:01", "2019-08-15T17:00:01");
        //AddParameter(2, "LastRegistryDate", "Last date in the registry", "2019-03-06T15:03:27", "2019-08-15T17:00:01", "2019-08-15T17:00:01");
        //AddParameter(3, "LastRegistryId", "Last ID in the registry", "164679", "2019-08-15T17:00:01", "2019-08-15T17:00:01");

        //dynamic userEntiny = new XEntity("User");
        //userEntiny.Id = "20";
        //userEntiny.Created = DateTime.Now;
        //userEntiny.Modified = DateTime.Now;
        //userEntiny.Name = a.Name;
        //userEntiny.Password = a.Password;
        //userEntiny.IsActive = false;

        //IUser user = userEntiny.To<IUser>();
        //Assert.Equal(user.Password, a.Password);
        //Assert.Equal(user.Name, a.Name);

        //IRole role = roleEntiny.To<IRole>();
        //Assert.Equal(role.Name, a.Role);

        //dynamic roleEntiny = new XEntity("Role");
        //roleEntiny.Id = a.Id;
        //roleEntiny.Created = DateTime.Now;
        //roleEntiny.Modified = DateTime.Now;
        //roleEntiny.Name = a.Role;
        //roleEntiny.Note = "Test role";
        //roleEntiny.CreatedUserId = 20;
        //roleEntiny.ModifiedUserId = 20;
    }
    #endregion
}