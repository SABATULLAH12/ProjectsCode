using NextGen.Core.Data;

namespace Dine.Infrastructure
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