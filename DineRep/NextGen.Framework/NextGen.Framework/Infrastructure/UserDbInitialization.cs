using NextGen.Core.Data;

namespace NextGen.Framework.Infrastructure
{
    internal class UserDbInitialization
    {
        public void DefaultUser()
        {
            UserDbContext user = new UserDbContext();
            user.DefaultUsers();
        }
    }
}