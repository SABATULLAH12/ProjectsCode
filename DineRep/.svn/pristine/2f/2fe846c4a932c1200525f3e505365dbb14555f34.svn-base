using AqUtility.Encryption;
using Framework.Models.Users;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Linq;

namespace NextGen.Core.Data
{
    public class UserDbContext : DbContext
    {
        public UserDbContext() : base("name=" + ConfigurationManager.AppSettings["ToolConn"]) { }

        public DbSet<UserDetail> User { get; set; }

        public UserDetail VerifyUser(LogonUser user)
        {
            if (user == null || this.User == null)
                return null;
            var returnobj = this.User.FirstOrDefault(x => x.Email == user.UserName && x.Password == user.Password);
            if (returnobj != null)
                returnobj.Password = null;
            return returnobj;
        }

        public void DefaultUsers()
        {
            List<UserDetail> userslst = new List<UserDetail>(){
            new UserDetail() {Id = 1, Name = "Thanuj Kumara AS", Email = "thanuj@aqinsights.com", Password = "thanuj.123", Role = "Super" },
            new UserDetail() {Id = 2, Name = "Developer", Email = "devuser@aqinsights.com", Password = "devuser.123", Role = "Admin" },
            new UserDetail() {Id = 3, Name = "Tester", Email = "testuser@aqinsights.com", Password = "testuser.123", Role = "Normal" }
            };

            foreach (var u in userslst)
            {
                u.Password = Security.Encrypt(u.Password);
                u.Email = Security.Encrypt(u.Email);

                if (User.Count(x => x.Email == u.Email) == 0)
                    User.Add(u);
                else if (User.Count(x => x.Email == u.Email && x.Password == u.Password) == 0)
                    User.FirstOrDefault(x => x.Email == u.Email).Password = u.Password;
            }

            this.SaveChanges();
        }

        public void AddUser(UserDetail user)
        {
            user.Password = Security.Encrypt(user.Password);
            user.Email = Security.Encrypt(user.Email);

            if (User.Count(x => x.Email == user.Email) == 0)
                User.Add(user);
            else if (User.Count(x => x.Email == user.Email && x.Password == user.Password) == 0)
                User.FirstOrDefault(x => x.Email == user.Email).Password = user.Password;

            this.SaveChanges();
        }
    }
}