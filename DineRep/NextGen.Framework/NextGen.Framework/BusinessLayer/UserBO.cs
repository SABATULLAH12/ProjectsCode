using AqUtility.Encryption;
using NextGen.Core.Data;
using Framework.Models.Users;
using System.Linq;

namespace NextGen.Framework.BusinessLayer
{
    public class UserBO
    {
        private UserDbContext _user = null;
        protected bool disposed = false;

        public UserBO()
        {
            _user = new UserDbContext();
        }

        public UserDetail GetUserInfo(LogonUser user)
        {
            if (user != null)
            {
                user.UserName = Security.Encrypt(user.UserName);
                user.Password = Security.Encrypt(user.Password);
            }
            var usr = _user.VerifyUser(user);
            if (usr != null)
                usr.Email = Security.Decrypt(usr.Email);
            return usr;
        }

        public void CreateUser(UserDetail user)
        {
            if (user == null)
                return;

            if (_user.User.Count(x => x.Email == user.Email) == 0)
            {
                _user.User.Add(user);
                _user.SaveChanges();
            }
        }
    }
}