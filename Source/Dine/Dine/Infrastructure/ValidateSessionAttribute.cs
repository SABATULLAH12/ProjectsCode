using Framework.Models.Users;
using Dine.Utility;
using System.Web.Mvc;
using System.Web.Security;

namespace Dine.Infrastructure
{
    public class ValidateSessionAttribute : FilterAttribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationContext filterContext)
        {
            if (filterContext.HttpContext.Session != null)
            {
                var userInfo = filterContext.HttpContext.Session[Constants.Session.ActiveUser] as UserDetail;
                if (userInfo != null)
                    return;
            }
            filterContext.Result = new RedirectResult(FormsAuthentication.LoginUrl);
        }
    }
}