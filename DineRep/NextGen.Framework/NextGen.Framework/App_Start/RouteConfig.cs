using NextGen.Core.Configuration;
using System.Web.Mvc;
using System.Web.Routing;

namespace NextGen.Framework
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
            if (ConfigContext.Current.IsConfigured)
                routes.MapRoute(
                    name: "Default",
                    url: "{controller}/{action}/{id}",
                    defaults: new { controller = "Logon", action = "Index", id = UrlParameter.Optional }
                );
            else
                routes.MapRoute(
                    name: "Default",
                    url: "{controller}/{action}/{id}",
                    defaults: new { controller = "Tool", action = "Config", id = UrlParameter.Optional }
                );
        }
    }
}
