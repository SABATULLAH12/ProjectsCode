using Framework.Models.Users;
using NextGen.Framework.Utility;
using System.Web.Mvc;
using System.Web.Security;

namespace NextGen.Framework.Infrastructure
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
            filterContext.Result = new RedirectResult(FormsAuthentication.DefaultUrl);
        }
    }
}