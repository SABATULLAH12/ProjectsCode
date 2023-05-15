using System;
using System.Configuration;
using System.Web.Mvc;

namespace NextGen.Framework
{
    public class EnableToolConfigAttribute : FilterAttribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationContext filterContext)
        {
            var isenableconfig = Convert.ToBoolean(ConfigurationManager.AppSettings["NextGen:ShowToolConfig"]);
            if (!isenableconfig)
            {
                filterContext.Result = new HttpNotFoundResult();
            }
        }
    }
}